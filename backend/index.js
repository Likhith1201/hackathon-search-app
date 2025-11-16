import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';
import { registerType } from 'pgvector/pg'; 
import { GoogleGenerativeAI } from '@google/generative-ai'; 

// --- Config and Setup ---
dotenv.config(); 

// --- Database Connection ---
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL 
});

(async () => {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database');
    await registerType(client); 
    console.log('pgvector type registered');
    client.release();
  } catch (err) {
    console.error('Database connection or pgvector error', err.stack);
  }
})();

// --- Google AI Setup ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

// --- Helper Functions ---
const getCategory = (content) => {
  const text = content.toLowerCase();
  if (text.includes('marketing') || text.includes('strategy') || text.includes('campaign')) {
    return 'Marketing';
  }
  if (text.includes('product') || text.includes('roadmap') || text.includes('feature')) {
    return 'Product';
  }
  if (text.includes('q4') || text.includes('q3') || text.includes('internal') || text.includes('memo')) {
    return 'Internal';
  }
  return 'General';
};

// --- AI Embedding Function ---
async function getEmbedding(text) {
  try {
    const chunks = [];
    const maxChunkSize = 10000;
    for (let i = 0; i < text.length; i += maxChunkSize) {
      chunks.push(text.substring(i, i + maxChunkSize));
    }

    const result = await model.batchEmbedContents({
      requests: chunks.map(chunk => ({
        content: { parts: [{text: chunk}], role: "user" }, 
        taskType: "RETRIEVAL_DOCUMENT"
      }))
    });

    // Average the embeddings of all chunks
    const embeddings = result.embeddings.map(e => e.values);
    if (embeddings.length === 0) return null;

    const avgEmbedding = new Array(embeddings[0].length).fill(0);
    for (const emb of embeddings) {
      for (let i = 0; i < emb.length; i++) {
        avgEmbedding[i] += emb[i];
      }
    }
    for (let i = 0; i < avgEmbedding.length; i++) {
      avgEmbedding[i] /= embeddings.length;
    }
    
    return avgEmbedding;

  } catch (error) {
    console.error('Error getting embedding:', error.message);
    throw new Error('Failed to generate embedding');
  }
}

// --- Express & Multer Setup ---
const app = express();
const PORT = 5000;
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'AI Semantic Search Backend is Live!' });
});

// --- /upload ROUTE  ---
app.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const file = req.file;
    const originalName = file.originalname;
    const content = fs.readFileSync(file.path, 'utf-8');
    fs.unlinkSync(file.path); // Delete temp file

    // 1. Get category
    const category = getCategory(content);

    // 2. Get AI embedding 
    console.log(`Generating embedding for ${originalName}...`);
    const embedding = await getEmbedding(content);
    if (!embedding) {
      return res.status(500).json({ error: 'Could not generate AI embedding.' });
    }
    console.log('Embedding generated successfully.');

    // 3. Save to PostgreSQL
    const queryText = `
      INSERT INTO documents (filename, content, category, embedding)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const embeddingString = `[${embedding.join(',')}]`;
    const queryParams = [originalName, content, category, embeddingString];
    
    await pool.query(queryText, queryParams);
    
    res.json({
      message: 'File uploaded, vectorized, and saved to database!',
      filename: originalName,
    });

  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ error: 'Server error during file processing.' });
  }
});

// --- /search ROUTE  ---
app.get('/search', async (req, res) => {
  const { term } = req.query;

  if (!term) {
    return res.status(400).json({ error: 'No search term provided.' });
  }

  try {
    // 1. Get AI embedding for the SEARCH TERM
    console.log(`Generating embedding for search term: "${term}"...`);

    const searchEmbeddingResult = await model.embedContent({
      content: { parts: [{text: term}], role: "user" }, 
      taskType: "RETRIEVAL_QUERY"
    });
    const searchEmbedding = searchEmbeddingResult.embedding.values;
    const searchEmbeddingString = `[${searchEmbedding.join(',')}]`;

    // 2. Perform a vector similarity search in PostgreSQL
    const queryText = `
      SELECT filename, content, category, embedding <=> $1 AS distance
      FROM documents
      ORDER BY distance ASC
      LIMIT 5
    `;
    
    const { rows } = await pool.query(queryText, [searchEmbeddingString]);
    
    // 3. Format results
    const results = rows.map(doc => {
      const content = doc.content.toLowerCase();
      const termLower = term.toLowerCase();
      let index = content.indexOf(termLower);
      if (index === -1) index = 0; 
      const start = Math.max(0, index - 50);
      const end = Math.min(content.length, index + 100);
      const snippet = `...${doc.content.substring(start, end)}...`;

      return {
        filename: doc.filename,
        snippet: snippet,
        category: doc.category,
        distance: doc.distance
      };
    });

    console.log(`Semantic search for '${term}' found ${results.length} results.`);
    res.json({ results: results });

  } catch (error) {
    console.error('Error during AI search:', error);
    res.status(500).json({ error: 'Server error during AI search.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
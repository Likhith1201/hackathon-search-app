import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// ---  Database Imports ---
import pg from 'pg'; 
import dotenv from 'dotenv'; 

dotenv.config();

// ---  Database Connection ---
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
  }
});

pool.connect((err) => {
  if (err) {
    console.error('Database connection error', err.stack);
  } else {
    console.log('Successfully connected to PostgreSQL database');
  }
});

// ---  Categorization Function  ---
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

// --- Express & Multer Setup  ---
const app = express();
const PORT = 5000;
const upload = multer({ dest: 'uploads/' });

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello from the backend server! (Now with PostgreSQL)' });
});

// ---  /upload ROUTE ---
app.post('/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const file = req.file;
    const filePath = file.path;
    const originalName = file.originalname;

    const content = fs.readFileSync(filePath, 'utf-8');
    const category = getCategory(content);

    // ---  Insert into PostgreSQL Database ---
    const queryText = `
      INSERT INTO documents (filename, content, category)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    const queryParams = [originalName, content, category];
    
    await pool.query(queryText, queryParams);

    fs.unlinkSync(filePath); 

    console.log(`Uploaded, categorized, and saved to DB: ${originalName}`);
    
    res.json({
      message: 'File uploaded and saved to database successfully!',
      filename: originalName,
    });

  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ error: 'Server error during file processing.' });
  }
});

// ---  /search ROUTE ---
app.get('/search', async (req, res) => {
  const { term } = req.query;

  if (!term) {
    return res.status(400).json({ error: 'No search term provided.' });
  }

  const searchTerm = `%${term}%`; 

  try {
    // ---  Select from PostgreSQL Database ---
    const queryText = `
      SELECT filename, content, category
      FROM documents
      WHERE content ILIKE $1 OR filename ILIKE $1
    `;
    
    const { rows } = await pool.query(queryText, [searchTerm]);
    
    const results = rows.map(doc => {
      const content = doc.content.toLowerCase();
      const termLower = term.toLowerCase();
      
      const index = content.indexOf(termLower);
      const start = Math.max(0, index - 50);
      const end = Math.min(content.length, index + 50);
      const snippet = `...${doc.content.substring(start, end)}...`;

      return {
        filename: doc.filename,
        snippet: snippet,
        category: doc.category,
      };
    });

    console.log(`Search for '${term}' found ${results.length} results from DB.`);
    res.json({ results: results });

  } catch (error) {
    console.error('Error during search:', error);
    res.status(500).json({ error: 'Server error during search.' });
  }
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 5000;

// --- In-Memory Database ---
let documentDatabase = []; 

// --- Multer Setup ---
const upload = multer({ dest: 'uploads/' });
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// ---  Automatic Categorization Function ---
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

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---
app.get('/', (req, res) => {
  res.json({ message: 'Hello from the backend server!' });
});

// ---  UPLOAD ROUTE ---
app.post('/upload', upload.single('document'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const file = req.file;
    const filePath = file.path;
    const originalName = file.originalname;

    const content = fs.readFileSync(filePath, 'utf-8');

    const category = getCategory(content);

    documentDatabase.push({
      filename: originalName,
      content: content,
      category: category, 
    });

    fs.unlinkSync(filePath);

    console.log(`Uploaded & categorized '${originalName}' as '${category}'`);
    
    res.json({
      message: 'File uploaded and processed successfully!',
      filename: originalName,
    });

  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ error: 'Server error during file processing.' });
  }
});

// ---  SEARCH ROUTE ---
app.get('/search', (req, res) => {
  const { term } = req.query; 

  if (!term) {
    return res.status(400).json({ error: 'No search term provided.' });
  }

  const searchTerm = term.toLowerCase();
  const results = [];

  for (const doc of documentDatabase) {
    const content = doc.content.toLowerCase();
    
    if (content.includes(searchTerm)) {
      const index = content.indexOf(searchTerm);
      const start = Math.max(0, index - 50);
      const end = Math.min(content.length, index + 50);
      const snippet = `...${content.substring(start, end)}...`;

      results.push({
        filename: doc.filename,
        snippet: snippet,
        category: doc.category, // We're sending the category to the frontend
      });
    }
  }

  console.log(`Search for '${term}' found ${results.length} results.`);
  res.json({ results: results });
});


// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
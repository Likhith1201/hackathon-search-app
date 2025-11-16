
# 📁 Knowledge Discovery: AI-Powered Semantic Search

This is my entry for the **AI-Powered Marketing Hackathon** under **Challenge #4: Knowledge Discovery & Internal Search**.

I built this because finding old documents was frustrating — keyword search often fails when you don’t remember exact terms. This tool uses **semantic search** powered by AI embeddings so it understands the *meaning* behind your query.

**🔗 Live Demo:** https://hackathon-search-app.vercel.app  
**▶️ Demo Video:** https://drive.google.com/file/d/1Tugx6UMDZhX4Y3CpmTcpdLyEuFK2aElA/view?usp=sharing

---

## 🚀 Features

- **Document Upload:** Supports `.txt` and `.md` files.  
- **AI Vectorization:** Uses **Google Gemini `text-embedding-004`** model to convert each document into a 768-dimension vector.  
- **Semantic Search:** Queries are embedded and compared using **cosine similarity** via `pgvector`.  
- **Automatic Categorization:** Extracts and assigns simple keyword-based categories.  
- **Snippet Preview:** Shows a relevant snippet from the file in search results.

---

## 🧠 Approach & Key Technical Decisions

1. **Problem Choice**  
   Selected Challenge #4 to explore full-stack + AI + database vector search.

2. **Initial MVP**  
   Started with a lightweight MVP using React + Node.js + in-memory storage to test the flow (upload → search → preview).

3. **The AI Upgrade**  
   To meet the “smart search” requirement, upgraded to **semantic search** using:
   - **Google Gemini Embeddings**
   - **pgvector** SQL search  
   - Migration from in-memory array → **PostgreSQL on Neon**

4. **Final Architecture**  
   A fully working end-to-end RAG-style semantic search system.

---

## 🛠️ Tech Stack

### **Frontend**
- React (Vite)
- Deployed on Vercel

### **Backend**
- Node.js + Express
- Multer (file uploads)
- Google Generative AI SDK
- Deployed on Render

### **Database**
- PostgreSQL (Neon)
- `pgvector` for vector search

---

## ⚙️ Running Locally

### **Prerequisites**
- Node.js 18+
- PostgreSQL with `pgvector`
- Google AI API key

---

### **1. Clone Repository**

```bash
git clone https://github.com/Likhith1201/hackathon-search-app.git
cd hackathon-search-app
```

---

### **2. Backend Setup**

1. Create `.env` inside `/backend`:

```
DATABASE_URL="YOUR_POSTGRESQL_CONNECTION_STRING"
GOOGLE_API_KEY="YOUR_GOOGLE_AI_API_KEY"
```

2. Install dependencies:

```bash
cd backend
npm install
```

3. Configure database (run in SQL console):

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  content TEXT,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE documents
ADD COLUMN embedding vector(768);
```

4. Run backend server:

```bash
npm start
```

Backend runs at: **http://localhost:5000**

---

### **3. Frontend Setup**

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 📌 Conclusion

This project demonstrates a real-world, production-ready AI semantic search engine with vector embeddings, fast database queries, and a clean UI. Perfect for internal knowledge discovery and enterprise document search.


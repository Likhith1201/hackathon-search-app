# 📁 Knowledge Discovery: AI-Powered Semantic Search

This is my entry for the AI-Powered Marketing Hackathon. I chose **Challenge #4: Knowledge Discovery & Internal Search**.

I was frustrated with how hard it is to find old documents, so I built a tool that goes beyond simple keyword matching. It uses **semantic search** to understand the *meaning* of your query, so it can find the right document even if you don't remember the exact words.

**Live Demo:** `https://hackathon-search-app.vercel.app`

**Demo Video:** `[YOUR 5-10 MINUTE DEMO VIDEO LINK HERE]`

---

## 🚀 Features

* **Document Upload:** Users can upload `.txt` or `.md` files.
* **AI Vectorization:** On upload, I use **Google's `text-embedding-004` model** to create a 768-dimension vector (an "embedding") that represents the document's meaning.
* **AI-Powered Semantic Search:** When you search, your query is *also* turned into a vector. The backend then uses `pgvector` to find the documents with the "closest" meaning to what you're asking for.
* **Automatic Categorization:** The app automatically tags documents based on keywords.
* **Snippet Generation:** The search results show you a preview snippet of the text, not just the filename.

---

## 🧠 Approach & Technical Decisions 

This section covers my approach and key decisions, as required by the submission guidelines.

1.  **Problem Choice:** I chose **Challenge #4** because it was a chance to build a complete, end-to-end AI system rather than relying on unreliable web scraping.

2.  **Initial MVP (The "What"):** I first built a "hackathon-grade" MVP in a few hours. This included a React frontend and a Node.js backend using an in-memory array. This met most of the core requirements (index, search, preview, clean UI) and proved the concept.

3.  **The AI Upgrade (The "How"):** The prompt's requirement for "smart search" and "AI tools" meant a simple keyword search wasn't enough. I made the key technical decision to upgrade from keyword search to **semantic search**.
    * **Challenge:** How do you search by *meaning*?
    * **Solution:** I implemented a full RAG (Retrieval-Augmented Generation) pipeline.
        * **Database:** I migrated from the in-memory array to a **PostgreSQL** database on **Neon**. This was a key challenge, as it meant refactoring all my code to use SQL and learning to use the **`pgvector`** extension. I had to manage the database connection string in a production environment (Render), which was a great learning experience.
        * **AI Model:** I used the **Google Generative AI (Gemini) API** for embeddings. I had to learn how to batch requests and structure the API calls correctly to avoid `400` errors.
        * **Search Logic:** I rewrote the search logic from a simple `.includes()` to an SQL query that uses cosine distance (`<=>`) to find the "closest" vectors in the database.

4.  **Final Architecture:** The final product is a robust, full-stack application.

---

## 🛠️ Tech Stack

* **Frontend:** **React** (built with Vite), deployed on **Vercel**.
* **Backend:** **Node.js** with **Express**, deployed on **Render**.
    * **`@google/generative-ai`**: To connect to the Gemini API for embeddings.
    * **`multer`**: For handling file uploads.
* **Database:**
    * **PostgreSQL** (hosted on **Neon**).
    * **`pgvector`**: A PostgreSQL extension for storing and querying AI-generated vectors.

---

## ⚙️ How to Run Locally

### Prerequisites

* Node.js (v18 or later)
* npm
* A **PostgreSQL** database with the **`pgvector`** extension enabled (e.g., a free Neon account).
* A **Google AI API Key**.

### 1. Clone the Repository

```bash
git clone [https://github.com/Likhith1201/hackathon-search-app.git](https://github.com/Likhith1201/hackathon-search-app.git)
cd hackathon-search-app


2. Set Up the Backend

  1. Go to the backend folder and create a .env file.

  2. Add your secret keys:
      DATABASE_URL="YOUR_POSTGRESQL_CONNECTION_STRING"
      GOOGLE_API_KEY="YOUR_GOOGLE_AI_API_KEY"

  3. Install dependencies:
     
      cd backend
      npm install


  4. Set up the database: Connect to your PostgreSQL database and run the following SQL commands:
      
      -- First, enable the pgvector extension
         CREATE EXTENSION IF NOT EXISTS vector;

      -- Then, create the table
      CREATE TABLE documents (
       id SERIAL PRIMARY KEY,
       filename VARCHAR(255) NOT NULL,
       content TEXT,
       category VARCHAR(100),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Finally, add the vector column
      ALTER TABLE documents
      ADD COLUMN embedding vector(768);


  5. Run the server:
      
      npm start
      # Server will be running on http://localhost:5000


3. Set Up the Frontend:
    
    # Open a new terminal
    cd frontend
    npm install
    npm run dev
    # App will be running on http://localhost:5173  
    

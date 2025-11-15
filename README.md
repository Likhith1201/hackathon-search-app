# 📁 Knowledge Discovery: Internal Search Tool

This is a full-stack web application that acts as a smart internal search tool. It provides a clean interface for users to upload documents and then perform a fast, content-based search across the entire knowledge base.

This tool is designed for any team that generates a large number of documents (like marketing, legal, or research) and needs a simple way to find information instantly.

**Live Demo:** `[YOUR DEPLOYED URL - WE WILL ADD THIS NEXT]`

---

## 🚀 Features

* **Document Upload:** Users can upload text-based documents (`.txt`, `.md`) directly via the web interface.
* **File Processing:** The backend reads and processes files, storing their content in-memory for instant search.
* **Smart Search:** A real-time search bar that queries the entire document database.
* **Snippet Generation:** The search results show the relevant filename and a contextual snippet of the text, with the search term highlighted for clarity.

---

## 🛠️ Tech Stack

* **Frontend:** **React** (built with Vite)
    * Uses `useState` for state management and the `fetch` API for communicating with the backend.
* **Backend:** **Node.js** with **Express**
    * Uses `multer` for handling file uploads.
    * Uses `fs` (File System) to read file content.
* **Database:** **In-Memory Array**
    * For this project, an in-memory array (`let documentDatabase = []`) is used to store document content. This provides maximum speed and simplicity, avoiding the need for external database setup.

---

## 🧠 Design Decisions

1.  **Tech Stack:** I chose the **React/Node.js (Express)** stack because it's a fast, modern, and efficient way to build a full-stack application with a single language (JavaScript).
2.  **In-Memory "Database":** Setting up and managing a full SQL or NoSQL database can be complex. An in-memory array is extremely fast for search and simplifies the architecture for this type of application.
3.  **Future Enhancements:** The current search is a robust text-matching algorithm. A great next step would be to replace the simple `.includes()` search with a call to a generative AI API (like Google's Gemini) to enable true *semantic search* (searching by meaning, not just keywords).

---

## ⚙️ How to Run Locally

### Prerequisites
* Node.js (v18 or later)
* npm

### 1. Clone the Repository
```bash
git clone [https://github.com/Likhith1201/hackathon-search-app.git](https://github.com/Likhith1201/hackathon-search-app.git)
cd hackathon-search-app
```

### 2. Set Up the Backend
```bash
# Go to the backend folder
cd backend

# Install dependencies
npm install

# Run the server
npm start
# Server will be running on http://localhost:5000
```

### 3. Set Up the Frontend
```bash
# Open a new terminal and go to the frontend folder
cd frontend

# Install dependencies
npm install

# Run the client
npm run dev
# App will be running on http://localhost:5173
```

### 4. Use the App
1.  Open `http://localhost:5173` in your browser.
2.  Upload a `.txt` or `.md` file.
3.  Search for a term inside that file.
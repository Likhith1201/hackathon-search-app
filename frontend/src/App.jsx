import React, { useState } from 'react';

const API_URL = 'https://hackathon-search-app.onrender.com';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  
  const [searchResults, setSearchResults] = useState([]); 
  const [searchMessage, setSearchMessage] = useState('Your search results will appear here...');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadMessage('');
  };

  const handleUpload = async (event) => {
    event.preventDefault(); 
    if (!selectedFile) {
      setUploadMessage('Please select a file first.');
      return;
    }
    setUploadMessage('Uploading...');
    const formData = new FormData();
    formData.append('document', selectedFile);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        setUploadMessage(`Success: ${data.filename} was uploaded!`);
        setSelectedFile(null);
        event.target.reset();
      } else {
        setUploadMessage(`Error: ${data.error || 'Upload failed.'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadMessage('Error: Could not connect to the server.');
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault(); 
    if (!searchTerm) {
      setSearchMessage('Please enter a search term.');
      setSearchResults([]);
      return;
    }
    setSearchMessage('Searching...');

    try {
      const response = await fetch(`${API_URL}/search?term=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();

      if (response.ok) {
        if (data.results.length > 0) {
          setSearchResults(data.results);
          setSearchMessage(''); 
        } else {
          setSearchResults([]);
          setSearchMessage(`No results found for "${searchTerm}".`);
        }
      } else {
        setSearchMessage(`Error: ${data.error || 'Search failed.'}`);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchMessage('Error: Could not connect to the server.');
      setSearchResults([]);
    }
  };


  return (
    <div className="App">
      <h1>📁 Knowledge Discovery</h1>

      {/* --- UPLOAD SECTION --- */}
      <div className="upload-container">
        <h2>Upload Documents</h2>
        <form onSubmit={handleUpload}>
          <input 
            type="file" 
            onChange={handleFileChange} 
            accept=".txt,.md"
          />
          <button type="submit">Upload</button>
        </form>
        {uploadMessage && <p>{uploadMessage}</p>}
      </div>

      {/* --- SEARCH SECTION --- */}
      <div className="search-container">
        <h2>Search Documents</h2>
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Enter search term (e.g., 'marketing strategy')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      <div className="results-container">
        <h2>Results</h2>
        
        {searchResults.length === 0 && <p>{searchMessage}</p>}

        {searchResults.map((result, index) => (
          <div key={index} className="result-item">
            <div className="result-item-header">
              <h3>{result.filename}</h3>
              <span className="category-tag">{result.category}</span>
            </div>

            <p dangerouslySetInnerHTML={{ 
              __html: result.snippet
                .replace(new RegExp(searchTerm, 'gi'), (match) => `<strong>${match}</strong>`)
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
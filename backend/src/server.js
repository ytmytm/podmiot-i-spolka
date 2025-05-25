const express = require('express');
const http = require('http'); // Still used for http.createServer if not using app.listen directly
const path = require('path');
const sentencesRouter = require('./routes/sentences'); // Import the sentences router

const app = express();
const port = process.env.PORT || 3000;

// Middleware for logging requests (optional, but good for debugging)
app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    next();
});

// Mount the sentences router under both /sentences and /api/sentences paths
app.use('/sentences', sentencesRouter);
app.use('/api/sentences', sentencesRouter);

// Basic root endpoint
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Backend is running with Express!' });
});

// Fallback for 404 Not Found
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware (optional, basic example)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

// Create HTTP server with the Express app
const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Backend server with Express listening on port ${port}`);
}); 
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const router = express.Router();

// Enable CORS for development
router.use(cors());

// Determine the path to sentences_pl.json
// Assuming the backend is run from the project root, or paths are adjusted in Docker context.
// If run via `node src/server.js` from `backend/`, `../data/` is correct.
// In Docker, if `backend/src` is WORKDIR, and `data` is copied to `/usr/src/app/data`,
// then the path needs to be relative to `server.js` or absolute in container.

// Let's assume the `data` directory is at the same level as the `backend` directory 
// when the server process starts (e.g. project_root/data and project_root/backend).
// This path needs to be correct relative to where `server.js` is run or an absolute path in the container.
const sentencesFilePath = path.join(__dirname, '../../data/sentences_pl.json');

let sentencesCache = [];
let lastModifiedTime = 0;

// Function to load sentences and cache them
function loadSentences() {
    try {
        const stats = fs.statSync(sentencesFilePath);
        if (stats.mtimeMs > lastModifiedTime) {
            console.log('Reloading sentences_pl.json as it has been modified...');
            const jsonData = fs.readFileSync(sentencesFilePath, 'utf-8');
            sentencesCache = JSON.parse(jsonData);
            lastModifiedTime = stats.mtimeMs;
            console.log(`Successfully loaded ${sentencesCache.length} sentences.`);
        } else {
            // console.log('Using cached sentences as the file has not changed.');
        }
    } catch (error) {
        console.error('Error loading or parsing sentences_pl.json:', error);
        // Keep using old cache if available, or an empty array if initial load fails
        if (!sentencesCache) sentencesCache = []; 
    }
}

// Initial load
loadSentences();

router.get('/random', (req, res) => {
    loadSentences(); // Check for updates before serving
    const level = parseInt(req.query.level) || 1; // Default to level 1 if not specified
    
    // Filter sentences by level
    const levelSentences = sentencesCache.filter(sentence => sentence.level === level);
    
    if (levelSentences.length === 0) {
        return res.status(404).json({ 
            error: 'No sentences found for this level',
            availableLevels: [...new Set(sentencesCache.map(s => s.level))].sort()
        });
    }
    
    // Pick a random sentence from the filtered list
    const randomIndex = Math.floor(Math.random() * levelSentences.length);
    const randomSentence = levelSentences[randomIndex];
    
    res.json(randomSentence);
});

module.exports = router; 
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const Trie = require('./data-structures/Trie');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Trie
const trie = new Trie();
let suggestionsLoaded = false;
let totalWordsLoaded = 0;

// LOCAL hardcoded words (always available + fast)
const LOCAL_WORDS = [
    'javascript', 'python', 'java', 'cpp', 'csharp', 'ruby', 'php', 'go', 'rust', 'typescript',
    'react', 'vue', 'angular', 'nextjs', 'nuxt', 'svelte', 'ember',
    'django', 'flask', 'fastapi', 'spring', 'laravel', 'express', 'nestjs', 'rails',
    'nodejs', 'deno', 'bun', 'mongodb', 'postgresql', 'mysql', 'redis',
    'docker', 'kubernetes', 'git', 'github', 'gitlab', 'jenkins',
    'html', 'css', 'sass', 'tailwindcss', 'bootstrap', 'material',
    'graphql', 'rest', 'api', 'microservices', 'devops', 'cloud',
    'aws', 'azure', 'gcp', 'heroku', 'netlify', 'vercel', 'firebase',
    'webpack', 'vite', 'babel', 'jest', 'mocha', 'cypress', 'testing',
    'machine', 'learning', 'data', 'science', 'ai', 'tensorflow', 'pytorch'
];

/**
 * Load words from BOTH local AND online sources
 */
async function loadSuggestions() {
    try {
        // 1. Add LOCAL words first (guaranteed, fast)
        console.log('\n📚 Loading LOCAL words...');
        LOCAL_WORDS.forEach(word => {
            trie.insert(word.toLowerCase());
            totalWordsLoaded++;
        });
        console.log(`✓ Added ${LOCAL_WORDS.length} LOCAL words`);
        
        // 2. Try to fetch from ONLINE API
        try {
            console.log('\n🌐 Fetching ONLINE API words...');
            const response = await axios.get('https://random-word-api.herokuapp.com/all', {
                timeout: 5000
            });
            
            if (Array.isArray(response.data) && response.data.length > 0) {
                const apiWords = response.data.slice(0, 2000);
                let addedCount = 0;
                const localLower = LOCAL_WORDS.map(w => w.toLowerCase());
                
                apiWords.forEach(word => {
                    const cleanWord = word.toLowerCase().trim();
                    if (!localLower.includes(cleanWord) && cleanWord.length > 2) {
                        trie.insert(cleanWord);
                        addedCount++;
                        totalWordsLoaded++;
                    }
                });
                
                console.log(`✓ Added ${addedCount} ONLINE API words`);
            }
        } catch (apiError) {
            console.warn('⚠ Online API failed:', apiError.message);
            console.log('✓ Using LOCAL words only');
        }
        
        suggestionsLoaded = true;
        console.log(`\n✅ SUCCESS! Total words: ${totalWordsLoaded} (LOCAL + ONLINE)\n`);
    } catch (error) {
        console.error('Error loading suggestions:', error);
        suggestionsLoaded = true;
    }
}

// Load suggestions on startup
loadSuggestions();

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'Server is running',
        suggestionsLoaded,
        wordsCount: COMMON_WORDS.length
    });
});

// Get autocomplete suggestions from loaded data
app.get('/api/suggestions', (req, res) => {
    try {
        const { query = '' } = req.query;

        if (!suggestionsLoaded) {
            return res.status(503).json({ 
                error: 'Suggestions are still loading. Please try again in a moment.' 
            });
        }

        // Return suggestions matching the query
        const suggestions = trie.getSuggestions(query.trim());
        res.json({ query: query.trim(), suggestions });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add a new word to the Trie
app.post('/api/words', (req, res) => {
    try {
        const { word } = req.body;

        if (!word || word.trim() === '') {
            return res.status(400).json({ error: 'Word is required' });
        }

        trie.insert(word.trim().toLowerCase());
        res.json({ message: 'Word added successfully', word: word.trim() });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Reload suggestions from API
app.post('/api/reload', async (req, res) => {
    try {
        // Clear existing trie
        trie.root.children = {};
        suggestionsLoaded = false;
        
        const count = await loadSuggestionsFromAPI();
        res.json({ message: 'Suggestions reloaded', wordsCount: count });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reload suggestions' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/songs - List all 24 tracks
router.get('/', (req, res) => {
  const songs = db.getSongs();
  res.json(songs);
});

// GET /api/songs/search?q=... - Search songs
router.get('/search', (req, res) => {
  const query = req.query.q || '';
  const results = db.searchSongs(query);
  res.json(results);
});

// GET /api/songs/:id - Get single track
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const song = db.getSongs().find(s => s.id === id);
  if (!song) {
    return res.status(404).json({ error: 'Song not found.' });
  }
  res.json(song);
});

module.exports = router;

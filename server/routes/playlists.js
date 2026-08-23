const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/playlists - Fetch user playlists
router.get('/', verifyToken, (req, res) => {
  const playlists = db.getUserPlaylists(req.user.id);
  res.json(playlists);
});

// POST /api/playlists - Create new playlist
router.post('/', verifyToken, (req, res) => {
  const { name, desc } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Playlist name is required.' });
  }
  const playlist = db.createPlaylist(req.user.id, name, desc);
  res.json(playlist);
});

module.exports = router;

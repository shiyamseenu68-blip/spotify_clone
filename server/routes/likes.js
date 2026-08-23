const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/likes - Get user liked track IDs
router.get('/', verifyToken, (req, res) => {
  const likes = db.getUserLikes(req.user.id);
  res.json(likes);
});

// POST /api/likes/toggle - Toggle liked track
router.post('/toggle', verifyToken, (req, res) => {
  const { songId } = req.body;
  if (!songId) {
    return res.status(400).json({ error: 'songId is required.' });
  }
  const updatedLikes = db.toggleLike(req.user.id, parseInt(songId));
  res.json(updatedLikes);
});

module.exports = router;

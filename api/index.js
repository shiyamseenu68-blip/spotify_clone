const express = require('express');
const cors = require('cors');

const authRoutes = require('../server/routes/auth');
const songRoutes = require('../server/routes/songs');
const playlistRoutes = require('../server/routes/playlists');
const likeRoutes = require('../server/routes/likes');

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/likes', likeRoutes);

// Vercel serverless function handler
module.exports = app;

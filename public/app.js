/* ==========================================================================
   SPOTIFY DEMO FRONTEND ENGINE (NO AUTHENTICATION REQUIRED)
   ========================================================================== */

const API_BASE = '/api';

// --------------------------------------------------------------------------
// 1. STATE MANAGEMENT
// --------------------------------------------------------------------------
class AppState {
  constructor() {
    this.audio = document.getElementById('audio-player');
    this.songs = [];
    this.currentTrack = null;
    this.currentQueue = [];
    this.queueIndex = 0;
    this.isPlaying = false;
    this.isShuffle = false;
    this.repeatMode = 'off';
    this.volume = 0.8;
    this.isMuted = false;
    this.currentView = 'home';

    // Demo mode - no authentication
    this.token = null;
    this.user = { name: 'Demo User', email: 'demo@spotify.com' };

    this.likedTrackIds = new Set();
    this.userPlaylists = [];

    this.audioCtx = null;
    this.analyser = null;
    this.visualizerAnimationId = null;
  }

  getAuthHeader() {
    return { 'Content-Type': 'application/json' };
  }

  async loadInitialData() {
    try {
      const songsRes = await fetch(`${API_BASE}/songs`);
      if (songsRes.ok) {
        this.songs = await songsRes.json();
        this.currentQueue = [...this.songs];
      } else {
        // Fallback to demo songs if API fails
        this.loadDemoSongs();
      }
    } catch (err) {
      console.warn("Backend API connection note:", err);
      // Fallback to demo songs if API fails
      this.loadDemoSongs();
    }
  }

  loadDemoSongs() {
    this.songs = [
      {
        id: 1,
        title: "Let Me Down Slowly",
        artist: "Alec Benjamin",
        album: "Narrated For You",
        duration: "2:49",
        cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop",
        url: "https://res.cloudinary.com/bb2v4ewv/video/upload/v1787475465/Let_Me_Down_Slowly_PagalWorld.com.pe.mp3",
        genre: "Pop",
        lyrics: ["This night is cold in the kingdom", "I can feel you fade away"]
      },
      {
        id: 2,
        title: "Shape Of You",
        artist: "Ed Sheeran",
        album: "÷ (Divide)",
        duration: "3:53",
        cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop",
        url: "https://res.cloudinary.com/bb2v4ewv/video/upload/v1787475465/Shape-Of-You_PagalWorlld.Com.mp3",
        genre: "Pop",
        lyrics: ["The club isn't the best place to find a lover", "I'm in love with the shape of you"]
      },
      {
        id: 3,
        title: "Someone You Loved",
        artist: "Lewis Capaldi",
        album: "Divinely Uninspired to a Hellish Extent",
        duration: "3:02",
        cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop",
        url: "https://res.cloudinary.com/bb2v4ewv/video/upload/v1787475462/Someone-You-Loved_PagalWorld.mp3",
        genre: "Pop / Ballad",
        lyrics: ["I was getting kinda used to being someone you loved"]
      },
      {
        id: 4,
        title: "Master The Blaster",
        artist: "Anirudh Ravichander",
        album: "Master (Original Soundtrack)",
        duration: "3:40",
        cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop",
        url: "https://res.cloudinary.com/bb2v4ewv/video/upload/v1787475461/Master_The_Blaster_320_PagalWorldl.mp3",
        genre: "Regional / Tamil",
        lyrics: ["JD is in the house!", "Master the blaster rhythm"]
      },
      {
        id: 5,
        title: "Perfect",
        artist: "Ed Sheeran",
        album: "÷ (Divide)",
        duration: "4:23",
        cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop",
        url: "https://res.cloudinary.com/bb2v4ewv/video/upload/v1787475460/Perfect.mp3",
        genre: "Pop",
        lyrics: ["I found a love for me", "Darling, just dive right in"]
      },
      {
        id: 6,
        title: "Faded",
        artist: "Alan Walker",
        album: "Different World",
        duration: "3:32",
        cover: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&auto=format&fit=crop",
        url: "https://res.cloudinary.com/bb2v4ewv/video/upload/v1787475454/FADED.mp3",
        genre: "EDM",
        lyrics: ["Where are you now?", "Was it all in my fantasy?"]
      }
    ];
    this.currentQueue = [...this.songs];
    this.likedTrackIds = new Set([1, 2, 3]);
  }

  async loadUserData() {
    // Demo mode - no user data loading
  }

  async toggleLike(trackId) {
    if (this.likedTrackIds.has(trackId)) {
      this.likedTrackIds.delete(trackId);
    } else {
      this.likedTrackIds.add(trackId);
    }
  }
        });
      } catch (err) {
        console.error("API error toggling like:", err);
      }
    }
  }

  async createPlaylist(name, desc) {
    if (!this.token) return;
    try {
      const res = await fetch(`${API_BASE}/playlists`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify({ name, desc })
      });
      if (res.ok) {
        const newPl = await res.json();
        this.userPlaylists.push(newPl);
        renderUserSidebarPlaylists();
      }
    } catch (err) {
      console.error("API error creating playlist:", err);
    }
  }

  // Demo mode - no authentication functions needed
}

const state = new AppState();

// --------------------------------------------------------------------------
// 2. UI CONTROLLER (DEMO MODE)
// --------------------------------------------------------------------------

function updateAuthUI() {
  const appShell = document.getElementById('app-shell');
  const playerBar = document.getElementById('player-bar-footer');
  const menuUserName = document.getElementById('menu-user-name');
  const playlistOwnerName = document.getElementById('playlist-owner-name');

  // Demo mode - always show app
  appShell.classList.remove('hidden');
  playerBar.classList.remove('hidden');

  if (menuUserName) menuUserName.textContent = state.user.name;
  if (playlistOwnerName) playlistOwnerName.textContent = state.user.name;
}

// --------------------------------------------------------------------------
// 3. AUDIO ENGINE & PLAYBACK CONTROLLER
// --------------------------------------------------------------------------

function playTrack(track, queueContext = state.songs) {
  state.currentTrack = track;
  state.currentQueue = [...queueContext];
  state.queueIndex = state.currentQueue.findIndex(t => t.id === track.id);
  if (state.queueIndex === -1) state.queueIndex = 0;

  state.audio.src = track.url;
  state.audio.volume = state.isMuted ? 0 : state.volume;
  
  const playPromise = state.audio.play();
  if (playPromise !== undefined) {
    playPromise.then(() => {
      state.isPlaying = true;
      updatePlayerUI();
      updateTrackActiveHighlights();
      initAudioVisualizerContext();
    }).catch(err => {
      console.warn('Playback error / User interaction needed:', err);
      state.isPlaying = false;
      updatePlayerUI();
    });
  }
}

function togglePlayPause() {
  if (!state.currentTrack) {
    if (state.songs.length > 0) playTrack(state.songs[0]);
    return;
  }

  if (state.audio.paused) {
    state.audio.play();
    state.isPlaying = true;
  } else {
    state.audio.pause();
    state.isPlaying = false;
  }
  updatePlayerUI();
  updateTrackActiveHighlights();
}

function playNextTrack() {
  if (state.currentQueue.length === 0) return;

  if (state.repeatMode === 'one' && state.currentTrack) {
    state.audio.currentTime = 0;
    state.audio.play();
    return;
  }

  if (state.isShuffle) {
    let nextIdx = Math.floor(Math.random() * state.currentQueue.length);
    if (nextIdx === state.queueIndex && state.currentQueue.length > 1) {
      nextIdx = (nextIdx + 1) % state.currentQueue.length;
    }
    state.queueIndex = nextIdx;
  } else {
    state.queueIndex++;
    if (state.queueIndex >= state.currentQueue.length) {
      if (state.repeatMode === 'all') {
        state.queueIndex = 0;
      } else {
        state.queueIndex = state.currentQueue.length - 1;
        state.audio.pause();
        state.isPlaying = false;
        updatePlayerUI();
        return;
      }
    }
  }

  playTrack(state.currentQueue[state.queueIndex], state.currentQueue);
}

function playPrevTrack() {
  if (!state.currentTrack) return;

  if (state.audio.currentTime > 3) {
    state.audio.currentTime = 0;
    return;
  }

  if (state.queueIndex > 0) {
    state.queueIndex--;
  } else {
    state.queueIndex = state.currentQueue.length - 1;
  }

  playTrack(state.currentQueue[state.queueIndex], state.currentQueue);
}

// --------------------------------------------------------------------------
// 4. WEB AUDIO SPECTRUM VISUALIZER
// --------------------------------------------------------------------------
function initAudioVisualizerContext() {
  if (state.audioCtx) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    state.audioCtx = new AudioContext();
    state.analyser = state.audioCtx.createAnalyser();
    const source = state.audioCtx.createMediaElementSource(state.audio);
    source.connect(state.analyser);
    state.analyser.connect(state.audioCtx.destination);
    state.analyser.fftSize = 128;
  } catch (e) {
    console.log("AudioContext note:", e);
  }
}

function drawVisualizer() {
  const canvas = document.getElementById('visualizer-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  canvas.width = canvas.parentElement.clientWidth - 80;
  canvas.height = 400;

  if (!state.analyser) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1db954';
    ctx.font = '16px Inter';
    ctx.fillText('Audio visualizer ready. Play a track to view spectrum.', 40, canvas.height / 2);
    return;
  }

  const bufferLength = state.analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function renderFrame() {
    state.visualizerAnimationId = requestAnimationFrame(renderFrame);
    state.analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.2;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;

      const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
      gradient.addColorStop(0, '#1ed760');
      gradient.addColorStop(0.5, '#1db954');
      gradient.addColorStop(1, '#0b4a22');

      ctx.fillStyle = gradient;
      ctx.fillRect(x, canvas.height - barHeight, barWidth - 4, barHeight);

      x += barWidth;
    }
  }

  renderFrame();
}

// --------------------------------------------------------------------------
// 5. UI RENDERING & DYNAMIC VIEWS
// --------------------------------------------------------------------------

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function setTimeGreeting() {
  const hour = new Date().getHours();
  const greetingEl = document.getElementById('time-greeting');
  if (!greetingEl) return;
  if (hour < 12) greetingEl.textContent = "Good morning";
  else if (hour < 18) greetingEl.textContent = "Good afternoon";
  else greetingEl.textContent = "Good evening";
}

function renderQuickPicks() {
  const grid = document.getElementById('quick-picks-grid');
  if (!grid) return;
  grid.innerHTML = '';
  
  const picks = state.songs.slice(0, 6);
  picks.forEach(song => {
    const card = document.createElement('div');
    card.className = 'quick-pick-card';
    card.innerHTML = `
      <img src="${song.cover}" class="quick-pick-img" alt="${song.title}">
      <span class="quick-pick-title">${song.title}</span>
      <button class="quick-pick-play"><i class="fa-solid fa-play"></i></button>
    `;
    card.addEventListener('click', () => playTrack(song, state.songs));
    grid.appendChild(card);
  });
}

function createMusicCard(song) {
  const card = document.createElement('div');
  card.className = 'music-card';
  card.innerHTML = `
    <div class="card-img-wrapper">
      <img src="${song.cover}" alt="${song.title}" loading="lazy">
      <button class="card-play-btn"><i class="fa-solid fa-play"></i></button>
    </div>
    <div class="card-info">
      <span class="card-title">${song.title}</span>
      <span class="card-artist">${song.artist}</span>
    </div>
  `;
  card.addEventListener('click', () => playTrack(song, state.songs));
  return card;
}

function renderShelves() {
  const featuredGrid = document.getElementById('featured-cards-grid');
  const popularGrid = document.getElementById('popular-cards-grid');
  const chillGrid = document.getElementById('chill-cards-grid');

  if (!featuredGrid || !popularGrid || !chillGrid) return;

  featuredGrid.innerHTML = '';
  popularGrid.innerHTML = '';
  chillGrid.innerHTML = '';

  state.songs.slice(0, 5).forEach(s => featuredGrid.appendChild(createMusicCard(s)));
  state.songs.slice(5, 10).forEach(s => popularGrid.appendChild(createMusicCard(s)));
  state.songs.slice(10, 15).forEach(s => chillGrid.appendChild(createMusicCard(s)));
}

function renderTrackTable(tableBody, tracksList) {
  if (!tableBody) return;
  tableBody.innerHTML = '';
  tracksList.forEach((song, index) => {
    const isPlayingThis = state.currentTrack && state.currentTrack.id === song.id;
    const isLiked = state.likedTrackIds.has(song.id);

    const tr = document.createElement('tr');
    tr.className = isPlayingThis ? 'active-track' : '';
    tr.setAttribute('data-id', song.id);

    tr.innerHTML = `
      <td class="col-index">
        ${isPlayingThis && state.isPlaying ? `
          <div class="equalizer-icon">
            <div class="eq-bar"></div>
            <div class="eq-bar"></div>
            <div class="eq-bar"></div>
          </div>
        ` : (index + 1)}
      </td>
      <td class="col-title">
        <div class="track-title-cell">
          <img src="${song.cover}" class="track-thumb" alt="${song.title}">
          <div class="track-text">
            <span class="track-name">${song.title}</span>
            <span class="track-subartist">${song.artist}</span>
          </div>
        </div>
      </td>
      <td class="col-album">${song.album}</td>
      <td class="col-date">${song.duration}</td>
      <td class="col-actions">
        <button class="icon-btn table-heart-btn ${isLiked ? 'active' : ''}" data-id="${song.id}">
          <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
      </td>
    `;

    tr.addEventListener('click', (e) => {
      if (e.target.closest('.table-heart-btn')) {
        e.stopPropagation();
        state.toggleLike(song.id).then(() => {
          renderTrackTable(tableBody, tracksList);
          updateLikedCount();
        });
        return;
      }
      playTrack(song, tracksList);
    });

    tableBody.appendChild(tr);
  });
}

function renderUserSidebarPlaylists() {
  const container = document.getElementById('user-playlists-container');
  if (!container) return;

  const likedItemHtml = `
    <div class="playlist-item active" data-playlist-id="liked">
      <div class="playlist-cover liked-cover">
        <i class="fa-solid fa-heart"></i>
      </div>
      <div class="playlist-info">
        <span class="playlist-name">Liked Songs</span>
        <span class="playlist-meta"><i class="fa-solid fa-thumbtack pinned"></i> Playlist • <span id="liked-count">${state.likedTrackIds.size}</span> songs</span>
      </div>
    </div>
  `;

  container.innerHTML = likedItemHtml;

  state.userPlaylists.forEach(pl => {
    const item = document.createElement('div');
    item.className = 'playlist-item';
    item.setAttribute('data-playlist-id', pl.id);
    item.innerHTML = `
      <div class="playlist-cover" style="background: linear-gradient(135deg, #1e3264, #0b1836); color:#fff; font-size:18px;">
        <i class="fa-solid fa-music"></i>
      </div>
      <div class="playlist-info">
        <span class="playlist-name">${pl.name}</span>
        <span class="playlist-meta">Playlist • ${pl.tracks ? pl.tracks.length : 0} songs</span>
      </div>
    `;
    item.addEventListener('click', () => {
      switchView('playlist');
      renderCustomPlaylistView(pl);
    });
    container.appendChild(item);
  });

  container.querySelector('[data-playlist-id="liked"]').addEventListener('click', () => switchView('playlist'));
}

function renderCustomPlaylistView(pl) {
  const bannerTitle = document.getElementById('banner-title');
  const bannerDesc = document.getElementById('banner-description');
  const bannerCount = document.getElementById('banner-count');
  const tableBody = document.getElementById('playlist-tracks-body');

  bannerTitle.textContent = pl.name;
  bannerDesc.textContent = pl.desc || "Custom playlist saved in your database.";
  bannerCount.textContent = `${pl.tracks ? pl.tracks.length : 0} songs`;

  const plTracks = (pl.tracks || []).map(id => state.songs.find(s => s.id === id)).filter(Boolean);
  renderTrackTable(tableBody, plTracks.length > 0 ? plTracks : state.songs.slice(0, 8));
}

function updateTrackActiveHighlights() {
  const allRows = document.querySelectorAll('.track-table tr[data-id]');
  allRows.forEach(tr => {
    const id = parseInt(tr.getAttribute('data-id'));
    if (state.currentTrack && state.currentTrack.id === id) {
      tr.classList.add('active-track');
    } else {
      tr.classList.remove('active-track');
    }
  });
}

function updateLikedCount() {
  const countEl = document.getElementById('liked-count');
  if (countEl) countEl.textContent = state.likedTrackIds.size;
}

function switchView(viewName) {
  state.currentView = viewName;

  document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));

  const searchHeader = document.getElementById('header-search');
  const headerChips = document.getElementById('header-chips');

  if (viewName === 'home') {
    document.getElementById('view-home').classList.remove('hidden');
    document.getElementById('nav-home').classList.add('active');
    searchHeader.classList.add('hidden');
    headerChips.classList.remove('hidden');
  } else if (viewName === 'search') {
    document.getElementById('view-search').classList.remove('hidden');
    document.getElementById('nav-search').classList.add('active');
    searchHeader.classList.remove('hidden');
    headerChips.classList.add('hidden');
    document.getElementById('search-input').focus();
  } else if (viewName === 'playlist' || viewName === 'library') {
    document.getElementById('view-playlist').classList.remove('hidden');
    document.getElementById('nav-library').classList.add('active');
    searchHeader.classList.add('hidden');
    headerChips.classList.remove('hidden');
    renderLikedPlaylistView();
  }
}

function renderLikedPlaylistView() {
  const bannerTitle = document.getElementById('banner-title');
  const bannerDesc = document.getElementById('banner-description');
  const bannerCount = document.getElementById('banner-count');
  const tableBody = document.getElementById('playlist-tracks-body');

  const likedTracks = state.songs.filter(s => state.likedTrackIds.has(s.id));

  bannerTitle.textContent = "Liked Songs";
  bannerDesc.textContent = "Your favorite saved tracks in your database.";
  bannerCount.textContent = `${likedTracks.length} songs`;

  renderTrackTable(tableBody, likedTracks);
}

// --------------------------------------------------------------------------
// 6. PLAYER UI, QUEUE DRAWER & LYRICS
// --------------------------------------------------------------------------

function updatePlayerUI() {
  const track = state.currentTrack;
  const coverEl = document.getElementById('player-cover');
  const titleEl = document.getElementById('player-title');
  const artistEl = document.getElementById('player-artist');
  const playPauseBtn = document.getElementById('btn-play-pause');
  const heartBtn = document.getElementById('player-heart-btn');
  const shuffleBtn = document.getElementById('btn-shuffle');
  const repeatBtn = document.getElementById('btn-repeat');

  if (!track) return;

  coverEl.src = track.cover;
  titleEl.textContent = track.title;
  artistEl.textContent = track.artist;

  if (state.isPlaying) {
    playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
  } else {
    playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
  }

  const isLiked = state.likedTrackIds.has(track.id);
  heartBtn.className = `icon-btn heart-btn ${isLiked ? 'active' : ''}`;
  heartBtn.innerHTML = `<i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>`;

  shuffleBtn.classList.toggle('active', state.isShuffle);
  repeatBtn.classList.toggle('active', state.repeatMode !== 'off');

  document.getElementById('vis-cover').src = track.cover;
  document.getElementById('vis-title').textContent = track.title;
  document.getElementById('vis-artist').textContent = track.artist;

  renderQueue();
  renderLyrics();
}

function renderLyrics() {
  const container = document.getElementById('lyrics-lines-container');
  if (!container) return;

  container.innerHTML = '';
  const track = state.currentTrack || state.songs[0];
  const lyricsList = (track && track.lyrics) ? track.lyrics : [
    "Sing along to your favorite song",
    "High quality audio streaming",
    "Full-Stack Spotify Experience"
  ];

  lyricsList.forEach((line, idx) => {
    const p = document.createElement('p');
    p.className = `lyric-line ${idx === 0 ? 'active' : ''}`;
    p.textContent = line;
    p.addEventListener('click', () => {
      container.querySelectorAll('.lyric-line').forEach(l => l.classList.remove('active'));
      p.classList.add('active');
    });
    container.appendChild(p);
  });
}

function renderQueue() {
  const nowPlayingDiv = document.getElementById('queue-now-playing');
  const nextListDiv = document.getElementById('queue-next-list');

  if (!nowPlayingDiv || !nextListDiv) return;

  if (!state.currentTrack) {
    nowPlayingDiv.innerHTML = '<p class="playlist-meta">No track playing</p>';
    nextListDiv.innerHTML = '';
    return;
  }

  nowPlayingDiv.innerHTML = `
    <img src="${state.currentTrack.cover}" alt="Cover">
    <div class="queue-item-info">
      <span class="queue-item-name">${state.currentTrack.title}</span>
      <span class="queue-item-artist">${state.currentTrack.artist}</span>
    </div>
  `;

  nextListDiv.innerHTML = '';
  const upcoming = state.currentQueue.slice(state.queueIndex + 1);
  if (upcoming.length === 0) {
    nextListDiv.innerHTML = '<p class="playlist-meta" style="padding:12px;">End of queue</p>';
  } else {
    upcoming.forEach(song => {
      const item = document.createElement('div');
      item.className = 'queue-item';
      item.innerHTML = `
        <img src="${song.cover}" alt="Cover">
        <div class="queue-item-info">
          <span class="queue-item-name">${song.title}</span>
          <span class="queue-item-artist">${song.artist}</span>
        </div>
      `;
      item.addEventListener('click', () => playTrack(song, state.currentQueue));
      nextListDiv.appendChild(item);
    });
  }
}

// --------------------------------------------------------------------------
// 7. EVENT LISTENERS SETUP
// --------------------------------------------------------------------------

function setupEventListeners() {
  // Demo mode - no login event listeners needed
  
  // Profile Menu
  const profileAvatarBtn = document.getElementById('profile-avatar-btn');
  const profileMenu = document.getElementById('profile-menu');

  if (profileAvatarBtn && profileMenu) {
    profileAvatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      profileMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!profileMenu.contains(e.target) && !profileAvatarBtn.contains(e.target)) {
        profileMenu.classList.add('hidden');
      }
    });
  }

  // Navigation
  document.getElementById('nav-home').addEventListener('click', () => switchView('home'));
  document.getElementById('nav-search').addEventListener('click', () => switchView('search'));
  document.getElementById('nav-library').addEventListener('click', () => switchView('playlist'));
  document.getElementById('logo-btn').addEventListener('click', () => switchView('home'));

  // Player controls
  document.getElementById('btn-play-pause').addEventListener('click', togglePlayPause);
  document.getElementById('btn-next').addEventListener('click', playNextTrack);
  document.getElementById('btn-prev').addEventListener('click', playPrevTrack);

  document.getElementById('btn-shuffle').addEventListener('click', () => {
    state.isShuffle = !state.isShuffle;
    updatePlayerUI();
  });

  document.getElementById('btn-repeat').addEventListener('click', () => {
    if (state.repeatMode === 'off') state.repeatMode = 'all';
    else if (state.repeatMode === 'all') state.repeatMode = 'one';
    else state.repeatMode = 'off';
    updatePlayerUI();
  });

  document.getElementById('player-heart-btn').addEventListener('click', () => {
    if (state.currentTrack) {
      state.toggleLike(state.currentTrack.id).then(() => {
        updatePlayerUI();
        updateLikedCount();
        if (state.currentView === 'playlist') renderLikedPlaylistView();
      });
    }
  });

  // Audio events
  state.audio.addEventListener('timeupdate', () => {
    const current = state.audio.currentTime;
    const duration = state.audio.duration;

    document.getElementById('current-time').textContent = formatTime(current);
    document.getElementById('total-duration').textContent = formatTime(duration);

    if (duration > 0) {
      const pct = (current / duration) * 100;
      document.getElementById('seek-fill').style.width = `${pct}%`;
      document.getElementById('seek-handle').style.left = `${pct}%`;
    }
  });

  state.audio.addEventListener('ended', playNextTrack);

  // Seek bar
  const seekContainer = document.getElementById('seek-container');
  let isSeeking = false;

  const handleSeek = (e) => {
    const rect = seekContainer.getBoundingClientRect();
    let pos = (e.clientX - rect.left) / rect.width;
    pos = Math.max(0, Math.min(1, pos));
    if (state.audio.duration) {
      state.audio.currentTime = pos * state.audio.duration;
    }
  };

  seekContainer.addEventListener('mousedown', (e) => {
    isSeeking = true;
    handleSeek(e);
  });

  document.addEventListener('mousemove', (e) => {
    if (isSeeking) handleSeek(e);
  });

  document.addEventListener('mouseup', () => {
    isSeeking = false;
  });

  // Volume bar
  const volumeContainer = document.getElementById('volume-container');
  const volumeFill = document.getElementById('volume-fill');
  const volumeHandle = document.getElementById('volume-handle');

  const setVolumeUI = (vol) => {
    const pct = vol * 100;
    volumeFill.style.width = `${pct}%`;
    volumeHandle.style.left = `${pct}%`;
  };

  const handleVolume = (e) => {
    const rect = volumeContainer.getBoundingClientRect();
    let pos = (e.clientX - rect.left) / rect.width;
    pos = Math.max(0, Math.min(1, pos));
    state.volume = pos;
    state.isMuted = false;
    state.audio.volume = pos;
    setVolumeUI(pos);
  };

  volumeContainer.addEventListener('mousedown', handleVolume);

  document.getElementById('btn-mute').addEventListener('click', () => {
    state.isMuted = !state.isMuted;
    state.audio.volume = state.isMuted ? 0 : state.volume;
    setVolumeUI(state.isMuted ? 0 : state.volume);
  });

  setVolumeUI(state.volume);

  // Search input handler -> Backend API Search
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const browseCategories = document.getElementById('browse-categories');
  const topResultCard = document.getElementById('top-result-card');
  const searchTracksList = document.getElementById('search-tracks-list');

  searchInput.addEventListener('input', async (e) => {
    const query = e.target.value.trim();

    if (!query) {
      searchResults.classList.add('hidden');
      browseCategories.classList.remove('hidden');
      return;
    }

    searchResults.classList.remove('hidden');
    browseCategories.classList.add('hidden');

    // Demo mode local search
    const q = query.toLowerCase();
    const matches = state.songs.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.genre.toLowerCase().includes(q)
    );

    if (matches.length > 0) {
      const top = matches[0];
      topResultCard.innerHTML = `
        <img src="${top.cover}" class="top-result-img" alt="${top.title}">
          <span class="top-result-title">${top.title}</span>
          <span class="top-result-artist">Song • ${top.artist}</span>
          <button class="big-play-btn" style="position:absolute; bottom:20px; right:20px;"><i class="fa-solid fa-play"></i></button>
        `;
        topResultCard.onclick = () => playTrack(top, matches);

        renderTrackTable(searchTracksList, matches);
      } else {
        topResultCard.innerHTML = '<p style="padding:20px;">No results found</p>';
        searchTracksList.innerHTML = '';
      }
  });

  // Drawer & Modals
  const queueDrawer = document.getElementById('queue-drawer');
  document.getElementById('btn-queue').addEventListener('click', () => queueDrawer.classList.toggle('hidden'));
  document.getElementById('close-queue-btn').addEventListener('click', () => queueDrawer.classList.add('hidden'));

  const visModal = document.getElementById('visualizer-modal');
  document.getElementById('btn-visualizer').addEventListener('click', () => {
    visModal.classList.remove('hidden');
    initAudioVisualizerContext();
    drawVisualizer();
  });
  document.getElementById('close-vis-btn').addEventListener('click', () => {
    visModal.classList.add('hidden');
    if (state.visualizerAnimationId) cancelAnimationFrame(state.visualizerAnimationId);
  });

  const lyricsModal = document.getElementById('lyrics-modal');
  document.getElementById('btn-lyrics').addEventListener('click', () => {
    lyricsModal.classList.toggle('hidden');
    renderLyrics();
  });
  document.getElementById('close-lyrics-btn').addEventListener('click', () => lyricsModal.classList.add('hidden'));

  // Playlist modal
  const playlistModal = document.getElementById('create-playlist-modal');
  document.getElementById('create-playlist-btn').addEventListener('click', () => playlistModal.classList.remove('hidden'));
  document.getElementById('close-playlist-modal-btn').addEventListener('click', () => playlistModal.classList.add('hidden'));
  document.getElementById('cancel-playlist-btn').addEventListener('click', () => playlistModal.classList.add('hidden'));

  document.getElementById('create-playlist-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('new-playlist-name').value.trim();
    const desc = document.getElementById('new-playlist-desc').value.trim();

    if (name) {
      await state.createPlaylist(name, desc);
      playlistModal.classList.add('hidden');
      document.getElementById('create-playlist-form').reset();
    }
  });

  document.getElementById('playlist-play-btn').addEventListener('click', () => {
    const likedTracks = state.songs.filter(s => state.likedTrackIds.has(s.id));
    if (likedTracks.length > 0) {
      playTrack(likedTracks[0], likedTracks);
    } else if (state.songs.length > 0) {
      playTrack(state.songs[0], state.songs);
    }
  });
}

// --------------------------------------------------------------------------
// 8. APP INITIALIZATION
// --------------------------------------------------------------------------
async function initApp() {
  await state.loadInitialData();
  updateAuthUI();
  setTimeGreeting();
  renderQuickPicks();
  renderShelves();
  renderUserSidebarPlaylists();
  
  const allTracksBody = document.getElementById('all-tracks-body');
  renderTrackTable(allTracksBody, state.songs);
  
  updateLikedCount();
  setupEventListeners();

  if (state.songs.length > 0) {
    state.currentTrack = state.songs[0];
    state.audio.src = state.songs[0].url;
    updatePlayerUI();
  }
}

document.addEventListener('DOMContentLoaded', initApp);

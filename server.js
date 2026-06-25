import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { BotManager } from './bot-manager.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Configure CORS for local development port 5173
const corsOptions = {
  origin: '*', // Allow all origins for local control
  methods: ['GET', 'POST'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.io initialization
const io = new Server(httpServer, {
  cors: corsOptions
});

const botManager = new BotManager(io);

function getBotConfig() {
  let host = 'localhost';
  let port = 25565;
  let username = 'AFK_Bot';
  let auth = 'offline';

  try {
    const settingsPath = path.join(__dirname, 'settings.json');
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      const settings = JSON.parse(data);
      if (settings.host) host = settings.host;
      if (settings.port !== undefined) port = settings.port;
      if (settings.username) username = settings.username;
      if (settings.auth) auth = settings.auth;
    }
  } catch (err) {
    console.error('Failed to read settings.json:', err);
  }

  return {
    host,
    port: parseInt(port) || 25565,
    username,
    version: false, // Force auto-detect version
    auth
  };
}

// Express Routes
app.post('/api/connect', (req, res) => {
  const config = getBotConfig();
  botManager.connect(config);
  res.json({ success: true, message: 'Connection sequence started.' });
});

app.post('/api/disconnect', (req, res) => {
  botManager.disconnect();
  res.json({ success: true, message: 'Bot disconnected.' });
});

app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }
  botManager.sendChat(message);
  res.json({ success: true });
});

app.post('/api/loop/start', (req, res) => {
  const { steps } = req.body;
  if (!steps || !Array.isArray(steps)) {
    return res.status(400).json({ error: 'Steps array is required.' });
  }
  botManager.startCustomLoop(steps);
  res.json({ success: true, message: 'Custom routine started.' });
});

app.post('/api/loop/stop', (req, res) => {
  botManager.stopCustomLoop();
  res.json({ success: true, message: 'Custom routine stopped.' });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: botManager.status,
    isLoopRunning: botManager.isLoopRunning,
    currentLoopIndex: botManager.currentLoopIndex,
    config: botManager.config,
    reconnectAttempts: botManager.reconnectAttempts
  });
});

app.get('/api/logs', (req, res) => {
  res.json({
    consoleLogs: botManager.consoleLogs,
    chatLogs: botManager.chatLogs
  });
});

// Serve frontend assets in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  // If dist/index.html doesn't exist, provide a message (useful in local dev)
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Vite Dev Server is running. Please open http://localhost:5173');
    }
  });
});

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log(`Web Client connected: ${socket.id}`);
  
  // Send initial data to client
  socket.emit('initial_data', {
    status: botManager.status,
    config: botManager.config,
    consoleLogs: botManager.consoleLogs,
    chatLogs: botManager.chatLogs,
    isLoopRunning: botManager.isLoopRunning,
    currentLoopIndex: botManager.currentLoopIndex,
    loopSteps: botManager.loopSteps,
    bot: botManager.bot && botManager.status === 'spawned' ? {
      username: botManager.bot.username,
      health: botManager.bot.health,
      food: botManager.bot.food,
      position: botManager.bot.entity?.position || { x: 0, y: 0, z: 0 },
      players: Object.keys(botManager.bot.players).map(name => ({
        name,
        ping: botManager.bot.players[name].ping
      }))
    } : null
  });

  socket.on('disconnect', () => {
    console.log(`Web Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`Backend Server running on port ${PORT}`);
  console.log(`========================================`);
  
  // Auto-connect on startup using settings.json config
  console.log('Auto-connecting bot on startup...');
  botManager.connect(getBotConfig());
});

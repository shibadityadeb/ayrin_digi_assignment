const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// In-memory store
const polls = {};

// --- REST API ---

// Get all polls
app.get('/api/polls', (req, res) => {
  res.json(Object.values(polls));
});

// Get a single poll
app.get('/api/polls/:id', (req, res) => {
  const poll = polls[req.params.id];
  if (!poll) return res.status(404).json({ error: 'Poll not found' });
  res.json(poll);
});

// Create a poll
app.post('/api/polls', (req, res) => {
  const { question, options } = req.body;

  if (!question || typeof question !== 'string' || question.trim() === '') {
    return res.status(400).json({ error: 'Question is required' });
  }
  if (!Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: 'At least 2 options are required' });
  }

  const sanitizedOptions = options.map((opt) => String(opt).trim()).filter(Boolean);
  if (sanitizedOptions.length < 2) {
    return res.status(400).json({ error: 'At least 2 non-empty options are required' });
  }

  const poll = {
    id: uuidv4(),
    question: question.trim(),
    options: sanitizedOptions.map((text) => ({ text, votes: 0 })),
    createdAt: new Date().toISOString(),
  };

  polls[poll.id] = poll;
  io.emit('poll:created', poll);
  res.status(201).json(poll);
});

// Vote on a poll option
app.post('/api/polls/:id/vote', (req, res) => {
  const poll = polls[req.params.id];
  if (!poll) return res.status(404).json({ error: 'Poll not found' });

  const { optionIndex } = req.body;
  if (
    typeof optionIndex !== 'number' ||
    optionIndex < 0 ||
    optionIndex >= poll.options.length
  ) {
    return res.status(400).json({ error: 'Invalid option index' });
  }

  poll.options[optionIndex].votes += 1;
  io.emit('poll:updated', poll);
  res.json(poll);
});

// Delete a poll
app.delete('/api/polls/:id', (req, res) => {
  const poll = polls[req.params.id];
  if (!poll) return res.status(404).json({ error: 'Poll not found' });

  delete polls[req.params.id];
  io.emit('poll:deleted', req.params.id);
  res.json({ message: 'Poll deleted' });
});

// --- WebSocket ---
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

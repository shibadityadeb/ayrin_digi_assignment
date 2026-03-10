require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { createPollRouter } = require('./polls');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const PORT = process.env.PORT || 5001;

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

app.use('/api/polls', createPollRouter(io));

io.on('connection', (socket) => {
  socket.on('disconnect', () => {});
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

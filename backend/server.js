require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { createPollRouter } = require('./polls');

const PORT = process.env.PORT || 5001;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow any Vercel deployment and localhost dev
    if (
      origin === 'http://localhost:3000' ||
      /^https:\/\/[\w-]+\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }
    callback(null, false);
  },
  methods: ['GET', 'POST'],
  credentials: true,
};

const app = express();
const server = http.createServer(app);

const io = new Server(server, { cors: corsOptions });

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/polls', createPollRouter(io));

io.on('connection', (socket) => {
  socket.on('disconnect', () => {});
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

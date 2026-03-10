require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { createPollRouter } = require('./polls');

const PORT = process.env.PORT || 5001;
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((u) => u.trim())
  : ['http://localhost:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST'],
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

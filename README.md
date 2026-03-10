# Poll Creator

A real-time polling application built with Express, Socket.io, React, and Tailwind CSS.

## Features

- Create polls with 2–6 options
- Vote with duplicate prevention (IP-based)
- Real-time vote updates via WebSocket
- Live bar chart visualization with Chart.js
- Poll expiration with automatic status change
- Shareable poll URLs
- Close polls manually

## Project Structure

```
poll-creator/
├── backend/
│   ├── server.js       # Express server, Socket.io setup
│   └── polls.js        # In-memory store, business logic, API routes
└── frontend/
    └── src/
        ├── App.jsx
        ├── api.js              # Axios client
        ├── socket.js           # Socket.io client singleton
        ├── pages/
        │   ├── CreatePoll.jsx  # / — poll creation form
        │   ├── PollVote.jsx    # /poll/:id — vote + results view
        │   └── PollResults.jsx # Results with Chart.js bar chart
        └── components/
            └── ResultBar.jsx   # Option row with progress bar
```

## Tech Stack

**Backend**
- [Express 5](https://expressjs.com/)
- [Socket.io 4](https://socket.io/)
- [uuid](https://github.com/uuidjs/uuid)
- [cors](https://github.com/expressjs/cors)

**Frontend**
- [React 19](https://react.dev/)
- [React Router v7](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
- [Socket.io Client](https://socket.io/)
- [Chart.js](https://www.chartjs.org/) + [react-chartjs-2](https://react-chartjs-2.js.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Vite](https://vite.dev/)

## Getting Started

### Prerequisites

- Node.js 20+

### Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### Configure environment variables

Copy the example files and edit values as needed:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**`backend/.env`**
```env
PORT=5001
CLIENT_URL=http://localhost:3000
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
VITE_APP_URL=http://localhost:3000
```

For production, set these to your deployed URLs, e.g.:
```env
# frontend/.env
VITE_API_URL=https://api.yourdomain.com/api
VITE_SOCKET_URL=https://api.yourdomain.com
VITE_APP_URL=https://yourdomain.com
```

### Run

Open two terminals:

```bash
# Terminal 1 — backend
cd backend
npm run dev
```

```bash
# Terminal 2 — frontend
cd frontend
npm run dev
```

- Backend: `http://localhost:5001`
- Frontend: `http://localhost:3000`

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/polls` | Create a new poll |
| `GET` | `/api/polls/:id` | Get poll by ID |
| `POST` | `/api/polls/:id/vote` | Submit a vote |
| `POST` | `/api/polls/:id/close` | Close a poll |

### POST /api/polls

**Request body:**
```json
{
  "question": "What is your favourite language?",
  "options": ["JavaScript", "Python", "Go"],
  "allowMultiple": false,
  "expiresAt": "2026-12-31T23:59:59.000Z"
}
```

**Response:**
```json
{
  "id": "poll_<uuid>",
  "question": "What is your favourite language?",
  "options": [
    { "id": "opt_1", "text": "JavaScript", "votes": 0, "percentage": 0 }
  ],
  "totalVotes": 0,
  "status": "active",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "expiresAt": "2026-12-31T23:59:59.000Z",
  "shareUrl": "http://localhost:3000/poll/poll_<uuid>"
}
```

### POST /api/polls/:id/vote

**Request body:**
```json
{ "optionId": "opt_1" }
```

**Response:**
```json
{ "success": true, "poll": { ...poll } }
```

## WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `poll:created` | Server → Client | Full poll object |
| `voteUpdate` | Server → Client | Full poll object |
| `poll:closed` | Server → Client | Full poll object |

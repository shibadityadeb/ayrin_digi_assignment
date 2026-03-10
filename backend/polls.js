const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');

const polls = {};

function createPollRouter(io) {
  const router = Router();

  router.post('/', (req, res) => {
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
      closed: false,
      createdAt: new Date().toISOString(),
    };

    polls[poll.id] = poll;
    io.emit('poll:created', poll);
    res.status(201).json(poll);
  });

  router.get('/:id', (req, res) => {
    const poll = polls[req.params.id];
    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    res.json(poll);
  });

  router.post('/:id/vote', (req, res) => {
    const poll = polls[req.params.id];
    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    if (poll.closed) return res.status(403).json({ error: 'Poll is closed' });

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

  router.post('/:id/close', (req, res) => {
    const poll = polls[req.params.id];
    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    if (poll.closed) return res.status(400).json({ error: 'Poll is already closed' });

    poll.closed = true;
    io.emit('poll:closed', poll);
    res.json(poll);
  });

  return router;
}

module.exports = { createPollRouter };

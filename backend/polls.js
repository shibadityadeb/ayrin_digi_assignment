const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');

const store = {};

function serializePoll(poll) {
  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
  return {
    id: poll.id,
    question: poll.question,
    allowMultiple: poll.allowMultiple,
    status: poll.status,
    totalVotes,
    createdAt: poll.createdAt,
    expiresAt: poll.expiresAt,
    options: poll.options.map((o) => ({
      id: o.id,
      text: o.text,
      votes: o.votes,
      percentage: totalVotes === 0 ? 0 : Math.round((o.votes / totalVotes) * 100),
    })),
  };
}

function createPoll(data) {
  const { question, options, allowMultiple = false, expiresAt = null } = data;

  if (!question || typeof question !== 'string' || question.trim() === '') {
    throw Object.assign(new Error('Question is required'), { status: 400 });
  }
  if (!Array.isArray(options) || options.length < 2) {
    throw Object.assign(new Error('At least 2 options are required'), { status: 400 });
  }

  const sanitized = options.map((o) => String(o).trim()).filter(Boolean);
  if (sanitized.length < 2) {
    throw Object.assign(new Error('At least 2 non-empty options are required'), { status: 400 });
  }

  const poll = {
    id: `poll_${uuidv4()}`,
    question: question.trim(),
    allowMultiple,
    status: 'active',
    totalVotes: 0,
    voters: new Set(),
    createdAt: new Date(),
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    options: sanitized.map((text, i) => ({ id: `opt_${i + 1}`, text, votes: 0 })),
  };

  store[poll.id] = poll;
  return serializePoll(poll);
}

function getPoll(id) {
  const poll = store[id];
  if (!poll) throw Object.assign(new Error('Poll not found'), { status: 404 });
  if (poll.expiresAt && new Date() > poll.expiresAt && poll.status === 'active') {
    poll.status = 'closed';
  }
  return serializePoll(poll);
}

function votePoll(id, optionIds, ip) {
  const poll = store[id];
  if (!poll) throw Object.assign(new Error('Poll not found'), { status: 404 });

  if (poll.expiresAt && new Date() > poll.expiresAt) {
    poll.status = 'closed';
  }
  if (poll.status === 'closed') {
    throw Object.assign(new Error('Poll is closed'), { status: 403 });
  }
  if (poll.voters.has(ip)) {
    throw Object.assign(new Error('You have already voted'), { status: 409 });
  }

  const ids = Array.isArray(optionIds) ? optionIds : [optionIds];

  if (!poll.allowMultiple && ids.length > 1) {
    throw Object.assign(new Error('This poll does not allow multiple choices'), { status: 400 });
  }

  const validIds = new Set(poll.options.map((o) => o.id));
  for (const oid of ids) {
    if (!validIds.has(oid)) {
      throw Object.assign(new Error(`Invalid option id: ${oid}`), { status: 400 });
    }
  }

  for (const oid of ids) {
    poll.options.find((o) => o.id === oid).votes += 1;
  }
  poll.voters.add(ip);

  return serializePoll(poll);
}

function closePoll(id) {
  const poll = store[id];
  if (!poll) throw Object.assign(new Error('Poll not found'), { status: 404 });
  if (poll.status === 'closed') {
    throw Object.assign(new Error('Poll is already closed'), { status: 400 });
  }

  poll.status = 'closed';
  return serializePoll(poll);
}

function createPollRouter(io) {
  const router = Router();

  router.post('/', (req, res) => {
    try {
      const poll = createPoll(req.body);
      io.emit('poll:created', poll);
      res.status(201).json({
        id: poll.id,
        question: poll.question,
        options: poll.options,
        totalVotes: poll.totalVotes,
        createdAt: poll.createdAt,
        expiresAt: poll.expiresAt,
        shareUrl: `http://localhost:3000/poll/${poll.id}`,
      });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  });

  router.get('/:id', (req, res) => {
    try {
      res.json(getPoll(req.params.id));
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  });

  router.post('/:id/vote', (req, res) => {
    try {
      const ip = req.ip || req.socket.remoteAddress;
      const { optionId } = req.body;
      const poll = votePoll(req.params.id, optionId, ip);
      io.emit('voteUpdate', poll);
      res.json({ success: true, poll });
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  });

  router.post('/:id/close', (req, res) => {
    try {
      const poll = closePoll(req.params.id);
      io.emit('poll:closed', poll);
      res.json(poll);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = { createPoll, getPoll, votePoll, closePoll, createPollRouter };

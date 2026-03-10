import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiArrowLeft, HiShare, HiCheckCircle, HiXCircle, HiClipboardDocument, HiClipboardDocumentCheck } from 'react-icons/hi2';
import { getPoll, votePoll } from '../api';
import socket from '../socket';
import PollResults from './PollResults';

const VOTED_KEY = 'poll_voted';

function getVotedPolls() {
  try {
    return JSON.parse(localStorage.getItem(VOTED_KEY) || '{}');
  } catch {
    return {};
  }
}

function markVoted(pollId) {
  const voted = getVotedPolls();
  voted[pollId] = true;
  localStorage.setItem(VOTED_KEY, JSON.stringify(voted));
}

export default function PollVote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [selected, setSelected] = useState('');
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/poll/${id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const fetchPoll = useCallback(async () => {
    try {
      const { data } = await getPoll(id);
      setPoll(data);
      if (getVotedPolls()[id] || data.status === 'closed') {
        setHasVoted(true);
      }
    } catch {
      setError('Poll not found.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPoll();

    function onVoteUpdate(updated) {
      if (updated.id === id) setPoll(updated);
    }
    function onPollClosed(updated) {
      if (updated.id === id) {
        setPoll(updated);
        setHasVoted(true);
      }
    }

    socket.on('voteUpdate', onVoteUpdate);
    socket.on('poll:closed', onPollClosed);

    return () => {
      socket.off('voteUpdate', onVoteUpdate);
      socket.off('poll:closed', onPollClosed);
    };
  }, [id, fetchPoll]);

  useEffect(() => {
    if (!poll?.expiresAt || poll.status === 'closed') return;
    const ms = new Date(poll.expiresAt) - Date.now();
    if (ms <= 0) {
      setPoll((p) => (p ? { ...p, status: 'closed' } : p));
      setHasVoted(true);
      return;
    }
    const t = setTimeout(() => {
      setPoll((p) => (p ? { ...p, status: 'closed' } : p));
      setHasVoted(true);
    }, ms);
    return () => clearTimeout(t);
  }, [poll?.expiresAt, poll?.status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected || hasVoted || voting) return;
    try {
      setVoting(true);
      setError('');
      const { data } = await votePoll(id, selected);
      setPoll(data.poll);
      markVoted(id);
      setHasVoted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit vote.');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto text-center"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-16">
          <div className="flex flex-col items-center gap-5">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <svg className="h-12 w-12 text-indigo-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </motion.div>
            <p className="text-gray-700 font-semibold text-lg">Loading poll...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error && !poll) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-16">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-7xl mb-6"
          >
            🔍
          </motion.div>
          <p className="text-red-500 text-xl font-bold mb-8">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <HiArrowLeft /> Create a new poll
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />
        
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-bold mb-6 transition-colors"
        >
          <HiArrowLeft className="text-lg" /> Create new poll
        </motion.button>

        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-8"
        >
          {poll.question}
        </motion.h1>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-100 rounded-2xl px-6 py-5 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HiShare className="text-indigo-600 text-xl" />
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Share this poll</p>
            </div>
            {poll.expiresAt && (
              <p className="text-xs text-gray-600 font-medium">
                Expires {new Date(poll.expiresAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 bg-white rounded-xl px-4 py-3 border-2 border-indigo-200 shadow-sm min-w-0">
              <span className="text-sm text-gray-700 truncate block font-medium">{shareUrl}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className="flex-shrink-0 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg whitespace-nowrap"
            >
              {copied ? (
                <span className="flex items-center justify-center gap-2">
                  <HiClipboardDocumentCheck className="w-5 h-5" />
                  <span>Copied!</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <HiClipboardDocument className="w-5 h-5" />
                  <span>Copy</span>
                </span>
              )}
            </motion.button>
          </div>
        </motion.div>

        {!hasVoted ? (
          <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit} 
            className="space-y-4"
          >
            <p className="text-sm font-bold text-gray-700 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">?</span>
              Choose your answer:
            </p>
            <AnimatePresence>
              {poll.options.map((option, idx) => (
                <motion.label
                  key={option.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`group flex items-center gap-4 border-2 rounded-2xl px-6 py-5 cursor-pointer transition-all shadow-sm hover:shadow-lg ${
                    selected === option.id
                      ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                  }`}
                >
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="option"
                      value={option.id}
                      checked={selected === option.id}
                      onChange={() => setSelected(option.id)}
                      className="w-6 h-6 text-indigo-600 border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                  <span className={`flex-1 font-semibold text-base transition-colors ${
                    selected === option.id ? 'text-indigo-700' : 'text-gray-700 group-hover:text-gray-900'
                  }`}>
                    {option.text}
                  </span>
                </motion.label>
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 border-2 border-red-200 rounded-2xl px-5 py-4 mt-4 shadow-sm"
                >
                  <p className="text-red-600 text-sm font-semibold">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!selected || voting}
              className="w-full mt-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl py-5 transition-all shadow-xl hover:shadow-2xl text-lg"
            >
              {voting ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Vote'
              )}
            </motion.button>
          </motion.form>
        ) : (
          <div>
            <AnimatePresence>
              {poll.status === 'closed' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border-2 border-red-200 rounded-2xl px-5 py-4 mb-8 shadow-lg"
                >
                  <p className="text-red-600 text-sm font-bold flex items-center gap-2">
                    <HiXCircle className="w-6 h-6" />
                    This poll is closed
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border-2 border-green-200 rounded-2xl px-5 py-4 mb-8 shadow-lg"
                >
                  <p className="text-green-600 text-sm font-bold flex items-center gap-2">
                    <HiCheckCircle className="w-6 h-6" />
                    Your vote was recorded successfully!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <PollResults poll={poll} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

    socket.on('voteUpdate', (updated) => {
      if (updated.id === id) setPoll(updated);
    });
    socket.on('poll:closed', (updated) => {
      if (updated.id === id) setPoll(updated);
    });

    return () => {
      socket.off('voteUpdate');
      socket.off('poll:closed');
    };
  }, [id, fetchPoll]);

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
    return <div className="max-w-xl mx-auto mt-16 text-center text-gray-500">Loading poll...</div>;
  }

  if (error && !poll) {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => navigate('/')} className="text-indigo-600 hover:underline text-sm">
          ← Back to home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white rounded-2xl shadow-lg p-8">
      <button
        onClick={() => navigate('/')}
        className="text-indigo-500 hover:text-indigo-700 text-sm mb-6 inline-block"
      >
        ← Create new poll
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-2">{poll.question}</h1>

      {poll.expiresAt && (
        <p className="text-xs text-gray-400 mb-6">
          Expires {new Date(poll.expiresAt).toLocaleString()}
        </p>
      )}

      {!hasVoted ? (
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          {poll.options.map((option) => (
            <label
              key={option.id}
              className={`flex items-center gap-3 border-2 rounded-xl px-5 py-3 cursor-pointer transition-colors ${
                selected === option.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <input
                type="radio"
                name="option"
                value={option.id}
                checked={selected === option.id}
                onChange={() => setSelected(option.id)}
                className="accent-indigo-600"
              />
              <span className="font-medium text-gray-700">{option.text}</span>
            </label>
          ))}

          {error && <p className="text-red-500 text-sm pt-1">{error}</p>}

          <button
            type="submit"
            disabled={!selected || voting}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl py-3 transition-colors"
          >
            {voting ? 'Submitting...' : 'Submit Vote'}
          </button>
        </form>
      ) : (
        <div className="mt-4">
          {poll.status === 'active' && (
            <p className="text-green-600 text-sm font-medium mb-4">✓ Your vote was recorded</p>
          )}
          <PollResults poll={poll} />
        </div>
      )}
    </div>
  );
}
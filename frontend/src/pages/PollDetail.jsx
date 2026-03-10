import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPoll, votePoll, deletePoll } from '../api';
import socket from '../socket';

export default function PollDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');

  const fetchPoll = useCallback(async () => {
    try {
      const { data } = await getPoll(id);
      setPoll(data);
    } catch {
      setError('Poll not found.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPoll();

    socket.on('poll:updated', (updated) => {
      if (updated.id === id) setPoll(updated);
    });
    socket.on('poll:deleted', (deletedId) => {
      if (deletedId === id) navigate('/');
    });

    return () => {
      socket.off('poll:updated');
      socket.off('poll:deleted');
    };
  }, [id, fetchPoll, navigate]);

  const handleVote = async (optionIndex) => {
    if (voted || voting) return;
    try {
      setVoting(true);
      const { data } = await votePoll(id, optionIndex);
      setPoll(data);
      setVoted(true);
    } catch {
      setError('Failed to submit vote.');
    } finally {
      setVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this poll?')) return;
    await deletePoll(id);
    navigate('/');
  };

  if (loading)
    return <p className="text-center mt-20 text-gray-400">Loading...</p>;
  if (error)
    return <p className="text-center mt-20 text-red-500">{error}</p>;

  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white rounded-2xl shadow-lg p-8">
      <button
        onClick={() => navigate('/')}
        className="text-indigo-500 hover:text-indigo-700 text-sm mb-4 inline-flex items-center gap-1"
      >
        ← Back to polls
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-2">{poll.question}</h1>
      <p className="text-sm text-gray-400 mb-6">{totalVotes} total votes</p>

      <div className="space-y-3">
        {poll.options.map((option, i) => {
          const pct = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          return (
            <div key={i}>
              <div className="flex justify-between text-sm text-gray-700 mb-1">
                <span>{option.text}</span>
                <span className="font-medium">{pct}% ({option.votes})</span>
              </div>
              <div className="relative h-8 bg-indigo-50 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-indigo-400 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
                {!voted && (
                  <button
                    onClick={() => handleVote(i)}
                    disabled={voting}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label={`Vote for ${option.text}`}
                  />
                )}
              </div>
              {!voted && (
                <button
                  onClick={() => handleVote(i)}
                  disabled={voting}
                  className="mt-1 text-xs text-indigo-500 hover:text-indigo-700 disabled:opacity-50"
                >
                  Vote
                </button>
              )}
            </div>
          );
        })}
      </div>

      {voted && (
        <p className="mt-6 text-center text-green-600 font-medium">
          Thanks for voting! Results update in real-time.
        </p>
      )}

      <button
        onClick={handleDelete}
        className="mt-8 w-full border border-red-300 text-red-400 hover:bg-red-50 rounded-lg py-2 text-sm transition-colors"
      >
        Delete Poll
      </button>
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPolls, deletePoll } from '../api';
import socket from '../socket';

export default function PollList() {
  const [polls, setPolls] = useState([]);
  const navigate = useNavigate();

  const fetchPolls = useCallback(async () => {
    const { data } = await getPolls();
    setPolls(data);
  }, []);

  useEffect(() => {
    fetchPolls();

    socket.on('poll:created', (poll) => setPolls((prev) => [poll, ...prev]));
    socket.on('poll:updated', (updated) =>
      setPolls((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    );
    socket.on('poll:deleted', (id) =>
      setPolls((prev) => prev.filter((p) => p.id !== id))
    );

    return () => {
      socket.off('poll:created');
      socket.off('poll:updated');
      socket.off('poll:deleted');
    };
  }, [fetchPolls]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this poll?')) return;
    await deletePoll(id);
  };

  const totalVotes = (poll) => poll.options.reduce((sum, o) => sum + o.votes, 0);

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">All Polls</h1>
        <button
          onClick={() => navigate('/create')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + New Poll
        </button>
      </div>

      {polls.length === 0 ? (
        <div className="text-center text-gray-400 mt-20 text-lg">
          No polls yet.{' '}
          <span
            className="text-indigo-500 cursor-pointer hover:underline"
            onClick={() => navigate('/create')}
          >
            Create one!
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <div
              key={poll.id}
              onClick={() => navigate(`/polls/${poll.id}`)}
              className="bg-white rounded-2xl shadow hover:shadow-md cursor-pointer p-5 flex items-center justify-between transition-shadow"
            >
              <div>
                <p className="text-lg font-semibold text-gray-800">{poll.question}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {poll.options.length} options · {totalVotes(poll)} votes
                </p>
              </div>
              <button
                onClick={(e) => handleDelete(e, poll.id)}
                className="text-gray-300 hover:text-red-500 text-2xl leading-none transition-colors ml-4"
                title="Delete poll"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

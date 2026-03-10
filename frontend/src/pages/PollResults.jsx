import ResultBar from '../components/ResultBar';

export default function PollResults({ poll }) {
  const maxVotes = Math.max(...poll.options.map((o) => o.votes));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Results</h2>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          poll.status === 'closed'
            ? 'bg-red-100 text-red-600'
            : 'bg-green-100 text-green-600'
        }`}>
          {poll.status === 'closed' ? 'Closed' : 'Live'}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        {poll.totalVotes} total vote{poll.totalVotes !== 1 ? 's' : ''}
      </p>
      {poll.options.map((option) => (
        <ResultBar
          key={option.id}
          option={option}
          isWinner={maxVotes > 0 && option.votes === maxVotes}
        />
      ))}
    </div>
  );
}

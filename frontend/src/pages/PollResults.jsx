import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ResultBar from '../components/ResultBar';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function PollResults({ poll }) {
  const maxVotes = Math.max(...poll.options.map((o) => o.votes));

  const chartData = {
    labels: poll.options.map((o) => o.text),
    datasets: [
      {
        label: 'Votes',
        data: poll.options.map((o) => o.votes),
        backgroundColor: poll.options.map((o) =>
          o.votes === maxVotes && maxVotes > 0
            ? 'rgba(99, 102, 241, 0.85)'
            : 'rgba(165, 180, 252, 0.7)'
        ),
        borderColor: poll.options.map((o) =>
          o.votes === maxVotes && maxVotes > 0 ? 'rgb(79, 70, 229)' : 'rgb(165, 180, 252)'
        ),
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    animation: { duration: 400 },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} vote${ctx.parsed.y !== 1 ? 's' : ''}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, precision: 0 },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: { grid: { display: false } },
    },
  };

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

      <div className="mb-6">
        <Bar data={chartData} options={chartOptions} />
      </div>

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


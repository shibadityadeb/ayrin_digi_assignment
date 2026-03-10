import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { HiChartBar, HiCheckBadge } from 'react-icons/hi2';
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
            ? 'rgba(99, 102, 241, 0.9)'
            : 'rgba(165, 180, 252, 0.7)'
        ),
        borderColor: poll.options.map((o) =>
          o.votes === maxVotes && maxVotes > 0 ? 'rgb(79, 70, 229)' : 'rgb(165, 180, 252)'
        ),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    animation: { duration: 600, easing: 'easeInOutQuart' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} vote${ctx.parsed.y !== 1 ? 's' : ''}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { 
          stepSize: 1, 
          precision: 0,
          font: { size: 12 },
          color: '#6b7280'
        },
        grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
        border: { display: false }
      },
      x: { 
        grid: { display: false },
        ticks: {
          font: { size: 12 },
          color: '#6b7280'
        },
        border: { display: false }
      },
    },
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-8"
    >
      <motion.div 
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-7 mb-8 shadow-lg border-2 border-indigo-100"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <HiChartBar className="text-white text-xl" />
            </div>
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Poll Results
            </h2>
          </div>
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className={`text-xs font-bold px-4 py-2 rounded-full shadow-md ${
              poll.status === 'closed'
                ? 'bg-red-100 text-red-600 border-2 border-red-200'
                : 'bg-green-100 text-green-600 border-2 border-green-200'
            }`}
          >
            {poll.status === 'closed' ? '⛔ CLOSED' : '✨ LIVE'}
          </motion.span>
        </div>
        <p className="text-base text-gray-700 font-bold flex items-center gap-2">
          <HiCheckBadge className="text-indigo-600 text-xl" />
          {poll.totalVotes} total vote{poll.totalVotes !== 1 ? 's' : ''} received
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-8 mb-8 shadow-xl border-2 border-gray-100"
      >
        <Bar data={chartData} options={chartOptions} />
      </motion.div>

      <div className="space-y-5">
        {poll.options.map((option, idx) => (
          <motion.div
            key={option.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 + idx * 0.1 }}
          >
            <ResultBar
              option={option}
              isWinner={maxVotes > 0 && option.votes === maxVotes}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}


import { motion } from 'framer-motion';
import { HiTrophy } from 'react-icons/hi2';

export default function ResultBar({ option, isWinner }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all relative overflow-hidden"
    >
      {isWinner && option.votes > 0 && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-2xl" />
      )}
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex-1">
          <span className={`font-bold text-lg block mb-2 ${
            isWinner ? 'text-indigo-700' : 'text-gray-800'
          }`}>
            {option.text}
            {isWinner && option.votes > 0 && (
              <motion.span 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="ml-3 inline-flex items-center gap-1.5 text-xs bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white px-3 py-1.5 rounded-full font-extrabold shadow-lg"
              >
                <HiTrophy className="text-base" />
                LEADING
              </motion.span>
            )}
          </span>
        </div>
        <div className="text-right ml-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
            className={`text-3xl font-extrabold ${
              isWinner ? 'text-indigo-600' : 'text-gray-700'
            }`}
          >
            {option.percentage}%
          </motion.div>
          <div className="text-xs text-gray-500 font-semibold mt-1">
            {option.votes} vote{option.votes !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
      
      <div className="relative w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${option.percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className={`absolute top-0 left-0 h-full rounded-full ${
            isWinner 
              ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg' 
              : 'bg-gradient-to-r from-indigo-300 to-purple-400'
          }`}
        >
          <motion.div 
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              x: ['-100%', '100%']
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}


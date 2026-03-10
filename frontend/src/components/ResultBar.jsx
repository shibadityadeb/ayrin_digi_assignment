export default function ResultBar({ option, isWinner }) {
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center text-sm mb-1">
        <span className={`font-medium ${isWinner ? 'text-indigo-700' : 'text-gray-700'}`}>
          {option.text}
        </span>
        <span className="text-gray-500 whitespace-nowrap ml-4">
          {option.votes} vote{option.votes !== 1 ? 's' : ''} &middot; {option.percentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className={`h-4 rounded-full transition-all duration-500 ${isWinner ? 'bg-indigo-600' : 'bg-indigo-300'}`}
          style={{ width: `${option.percentage}%` }}
        />
      </div>
    </div>
  );
}


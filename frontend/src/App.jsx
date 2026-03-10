import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import CreatePoll from './pages/CreatePoll';
import PollVote from './pages/PollVote';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-indigo-700 shadow">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <Link to="/" className="text-white text-xl font-bold tracking-tight">
              Poll Creator
            </Link>
          </div>
        </header>
        <main className="px-4 pb-12">
          <Routes>
            <Route path="/" element={<CreatePoll />} />
            <Route path="/poll/:id" element={<PollVote />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

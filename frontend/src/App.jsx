import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PollList from './pages/PollList';
import CreatePoll from './pages/CreatePoll';
import PollDetail from './pages/PollDetail';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-indigo-700 shadow">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <a href="/" className="text-white text-xl font-bold tracking-tight">
              Poll Creator
            </a>
          </div>
        </header>
        <main className="px-4 pb-12">
          <Routes>
            <Route path="/" element={<PollList />} />
            <Route path="/create" element={<CreatePoll />} />
            <Route path="/polls/:id" element={<PollDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

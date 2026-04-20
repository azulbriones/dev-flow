import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import { queryClient } from './lib/queryClient';
import { Dashboard } from './pages/Dashboard';
import { WorkflowDetail } from './pages/WorkflowDetail';
import './App.css';

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="app">
          <header className="p-4 border-b">
            <Link to="/" className="text-xl font-bold">
              DevFlow
            </Link>
          </header>
          <main className="p-4 max-w-4xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/workflows/:id" element={<WorkflowDetail />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
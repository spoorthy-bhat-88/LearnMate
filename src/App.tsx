import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import LearningSession from './components/LearningSession';

function App() {
  const [sessionKey, setSessionKey] = useState(0);

  const handleHomeClick = () => {
    setSessionKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button 
              onClick={handleHomeClick}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity focus:outline-none"
            >
              <BookOpen className="w-8 h-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">LearnMate</h1>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LearningSession key={sessionKey} />
      </main>
    </div>
  );
}

export default App;

import { Link } from 'react-router-dom';
import PredictionTool from '../components/PredictionTool';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LogIn, Music } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      
      {/* --- Navbar --- */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Music className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              MusicularAI
            </span>
          </div>

          {/* Login Button */}
          <div>
            {user ? (
              <Link 
                to="/dashboard" 
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 px-4 py-2 rounded-lg font-medium transition-all border border-slate-700"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg shadow-indigo-500/20"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <div className="py-20 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
          Will your song go <span className="text-indigo-500">Viral?</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto mb-12 text-lg leading-relaxed">
          Stop guessing. Use our advanced AI to analyze acoustic features and channel metadata to predict YouTube views before you even upload.
        </p>

        {/* --- The Prediction Tool --- */}
        <PredictionTool />
        
        <p className="mt-8 text-sm text-slate-500">
          Powered by Deep Learning & Librosa Audio Analysis
        </p>
      </div>
    </div>
  );
}
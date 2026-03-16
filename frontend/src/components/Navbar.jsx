import { Link, useNavigate } from 'react-router-dom';
import { Music, LayoutDashboard, History, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth(); // Get userr from context
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-500 hover:text-indigo-400 transition-colors">
          <Music className="w-8 h-8" />
          <span>Musicular AI</span>
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              
              <Link to="/history" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                <History className="w-4 h-4" /> History
              </Link>

              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors ml-4 border-l border-slate-700 pl-6"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="text-slate-300 hover:text-white px-4 py-2">Login</Link>
              <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
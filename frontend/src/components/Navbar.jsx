import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Music, LayoutDashboard, History, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-black border-b-4 border-indigo-500 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/" className="flex items-center gap-2.5 text-xl font-bold text-white hover:text-indigo-400 transition-colors">
          <div className="bg-indigo-500 p-1.5 rounded">
            <Music className="w-5 h-5 text-white" />
          </div>
          <span>Musicular<span className="text-indigo-400">AI</span></span>
        </Link>

        <div className="flex items-center gap-1">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/dashboard') || isActive('/')
                    ? 'text-white bg-white/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <Link
                to="/history"
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/history')
                    ? 'text-white bg-white/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </Link>

              <div className="w-px h-6 bg-gray-600 mx-1" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 hover:text-white hover:bg-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                className="text-sm text-gray-300 hover:text-white font-medium px-4 py-2 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-4 py-2 transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

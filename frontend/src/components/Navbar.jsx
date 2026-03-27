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
    <nav className="bg-slate-950/90 backdrop-blur-md border-b border-cyan-500/15 sticky top-0 z-50">
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />

      <div className="container mx-auto px-4 flex justify-between items-center h-16">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-xl font-bold text-white hover:text-cyan-400 transition-colors group"
        >
          <div
            className="bg-cyan-500/10 border border-cyan-500/40 p-1.5 rounded group-hover:border-cyan-400 transition-all"
            style={{ boxShadow: '0 0 10px rgba(6, 182, 212, 0.15)' }}
          >
            <Music className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="font-black tracking-tight">
            Musicular<span className="text-cyan-400">AI</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all rounded-sm ${
                  isActive('/dashboard') || isActive('/')
                    ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/5 border border-transparent'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <Link
                to="/history"
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all rounded-sm ${
                  isActive('/history')
                    ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/5 border border-transparent'
                }`}
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </Link>

              <div className="w-px h-6 bg-slate-700/60 mx-1" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/8 border border-transparent transition-all rounded-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                className="text-sm text-slate-400 hover:text-cyan-400 font-medium px-4 py-2 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 hover:border-cyan-400 text-cyan-400 font-bold px-4 py-2 transition-all"
                style={{ boxShadow: '0 0 12px rgba(6, 182, 212, 0.1)' }}
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

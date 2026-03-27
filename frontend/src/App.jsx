import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Login from './pages/Login';
import Register from './pages/Register';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-void">
      <div className="w-8 h-8 border-2 border-slate-700 border-t-cyan-400 rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-void font-sans relative overflow-x-hidden">

          {/* ── Ambient background orbs ── */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Primary cyan orb – top-left */}
            <div
              className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.07]"
              style={{
                background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
                animation: 'orbFloat 14s ease-in-out infinite',
              }}
            />
            {/* Violet orb – bottom-right */}
            <div
              className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full opacity-[0.07]"
              style={{
                background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
                animation: 'orbFloat2 18s ease-in-out infinite',
              }}
            />
            {/* Subtle mid orb */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-[0.03]"
              style={{
                background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
                animation: 'orbFloat 22s ease-in-out infinite reverse',
              }}
            />
          </div>

          {/* ── App content ── */}
          <div className="relative z-10">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 py-8">
              <Routes>
                {/* PUBLIC ROUTES */}
                <Route path="/"          element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/login"     element={<Login />} />
                <Route path="/register"  element={<Register />} />

                {/* PROTECTED ROUTES */}
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <History />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </div>

        </div>
      </Router>
    </AuthProvider>
  );
}

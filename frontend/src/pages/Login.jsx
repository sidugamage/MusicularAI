import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Music, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      toast.success("Welcome back!");
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div
        className="w-full max-w-md mx-auto bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 overflow-hidden mt-8 bracket-corner"
        style={{ boxShadow: '0 0 50px rgba(6, 182, 212, 0.08), 0 4px 30px rgba(0,0,0,0.6)' }}
      >

        {/* Header */}
        <div className="bg-slate-950/60 p-8 text-center border-b border-cyan-500/15">
          {/* Top accent line */}
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mb-6 -mx-8" />

          <div
            className="mx-auto bg-cyan-500/10 border border-cyan-500/35 w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ boxShadow: '0 0 25px rgba(6, 182, 212, 0.2)' }}
          >
            <Music className="w-7 h-7 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-black text-white">
            Musicular<span className="text-cyan-400" style={{ textShadow: '0 0 15px rgba(6,182,212,0.5)' }}>AI</span>
          </h2>
          <p className="text-xs mt-1.5 text-slate-500 font-mono tracking-wider uppercase">Predict your song's viral potential</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block section-label mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-600" />
                <input
                  type="email" required
                  className="input-cyber pl-10"
                  placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block section-label mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-600" />
                <input
                  type="password" required
                  className="input-cyber pl-10"
                  placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="btn-cyber-primary w-full py-4 flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {loading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <>Sign In <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm font-mono">
              Don't have an account?{' '}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-bold ml-1 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

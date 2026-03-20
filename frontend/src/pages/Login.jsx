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
      <div className="w-full max-w-md mx-auto bg-grey border-2 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] mt-8">
        
        {/* Header */}
        <div className="bg-black p-8 text-center">
          <div className="mx-auto bg-white w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <Music className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">MusicularAI</h2>
          <p className="text-sm mt-1 text-white">Predict your song's success</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input 
                  type="email" required
                  className="w-full border-2 border-black py-2.5 pl-10 pr-4 text-white focus:ring-1 focus:ring-black outline-none transition-all"
                  placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input 
                  type="password" required
                  className="w-full border-2 border-black py-2.5 pl-10 pr-4 text-white focus:ring-1 focus:ring-black outline-none transition-all"
                  placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-black hover:bg-white hover:text-black text-white font-bold py-4 transition-all flex items-center justify-center gap-2 shadow-lg mt-6
            border border-black"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          {/* Link to Register Page */}
          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              Don't have an account? 
              <Link to="/register" className="text-black hover:text-gray-400 font-bold ml-1">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, ArrowRight, Loader2, Music } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        email: formData.email,
        password: formData.password
      });

      toast.success("Account created successfully! Please log in.");
      navigate('/login');

    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.detail || "Registration failed. Try a different email.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div
        className="w-full max-w-md mx-auto bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 overflow-hidden mt-8 bracket-corner"
        style={{ boxShadow: '0 0 50px rgba(6, 182, 212, 0.08), 0 4px 30px rgba(0,0,0,0.6)' }}
      >

        {/* Header */}
        <div className="bg-slate-950/60 p-8 text-center border-b border-cyan-500/15">
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mb-6 -mx-8" />

          <div
            className="mx-auto bg-violet-500/10 border border-violet-500/35 w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ boxShadow: '0 0 25px rgba(139, 92, 246, 0.2)' }}
          >
            <UserPlus className="w-7 h-7 text-violet-400" />
          </div>
          <h2 className="text-2xl font-black text-white">
            Join Musicular<span className="text-cyan-400" style={{ textShadow: '0 0 15px rgba(6,182,212,0.5)' }}>AI</span>
          </h2>
          <p className="text-xs mt-1.5 text-slate-500 font-mono tracking-wider uppercase">Create your free account</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block section-label mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-600" />
                <input
                  type="email" required placeholder="you@example.com"
                  className="input-cyber pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block section-label mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-600" />
                <input
                  type="password" required placeholder="••••••••"
                  className="input-cyber pl-10"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block section-label mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-600" />
                <input
                  type="password" required placeholder="••••••••"
                  className="input-cyber pl-10"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="btn-cyber-primary w-full py-4 flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {loading
                ? <Loader2 className="animate-spin w-5 h-5" />
                : <>Create Account <ArrowRight className="w-5 h-5" /></>
              }
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm font-mono">
              Already have an account?{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold ml-1 transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

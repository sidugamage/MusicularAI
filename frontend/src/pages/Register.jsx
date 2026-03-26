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
    // validate
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
      <div className="w-full max-w-md mx-auto bg-white border-2 border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-8">
        
        {/* Header */}
        <div className="bg-black p-8 text-center border-b-4 border-indigo-500">
          <div className="mx-auto bg-indigo-500 w-14 h-14 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white">Join Musicular<span className="text-indigo-400">AI</span></h2>
          <p className="text-sm mt-1 text-gray-400">Create your free account</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input 
                  type="email" required placeholder="you@example.com"
                  className="w-full border-2 border-black py-2.5 pl-10 pr-4 focus:ring-1 focus:ring-black outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input 
                  type="password" required placeholder="••••••••"
                  className="w-full border-2 border-black py-2.5 pl-10 pr-4 focus:ring-1 focus:ring-black outline-none transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input 
                  type="password" required placeholder="••••••••"
                  className="w-full border-2 border-black py-2.5 pl-10 pr-4 focus:ring-1 focus:ring-black outline-none transition-all"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit" disabled={loading}
              className="w-full bg-black hover:bg-indigo-500 text-white font-bold py-4 transition-all flex items-center justify-center gap-2 mt-6 border-2 border-black disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Create Account <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          {/* Toggle Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-500 hover:text-indigo-700 font-bold ml-1">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
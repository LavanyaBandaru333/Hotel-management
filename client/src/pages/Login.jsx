import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL, safeFetchJson } from '../utils/api';

export const Login = ({ setActivePage, setAuthUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { ok, data } = await safeFetchJson(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (ok && data.success) {
        toast.success(`Welcome back, ${data.name}!`);
        localStorage.setItem('userInfo', JSON.stringify(data));
        if (setAuthUser) setAuthUser(data);
        setActivePage('dashboard');
      } else {
        toast.error(data.message || 'Invalid email or password');
      }
    } catch (error) {
      toast.error('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-12 px-6 max-w-md mx-auto min-h-screen flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-stone-900/60 border border-stone-800/80 p-8 md:p-12 rounded-2xl backdrop-blur-md shadow-2xl"
      >
        <div className="text-center mb-10">
          <h2 className="text-4xl font-serif text-gold-500 mb-3">Welcome Back</h2>
          <p className="text-stone-400">Sign in to manage your bookings</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-medium tracking-wider text-stone-400 uppercase">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-stone-500" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-stone-800/50 border border-stone-700 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-white rounded-xl py-3 pl-11 pr-4 outline-none transition-all"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium tracking-wider text-stone-400 uppercase">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-stone-500" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-800/50 border border-stone-700 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-white rounded-xl py-3 pl-11 pr-4 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gold-500 hover:bg-gold-600 text-stone-900 font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? 'Authenticating...' : (
              <>Sign In <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>

        <p className="text-center text-stone-400 mt-8 text-sm">
          Don't have an account?{' '}
          <button onClick={() => setActivePage('register')} className="text-gold-500 hover:text-gold-400 transition-colors font-medium">
            Register Here
          </button>
        </p>
      </motion.div>
    </div>
  );
};

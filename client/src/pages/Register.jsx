import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL, safeFetchJson } from '../utils/api';

export const Register = ({ setActivePage, setAuthUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { ok, data } = await safeFetchJson(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });
      
      if (ok && data.success) {
        toast.success(`Account created successfully! Welcome, ${data.name}!`);
        localStorage.setItem('userInfo', JSON.stringify(data));
        if (setAuthUser) setAuthUser(data);
        setActivePage('dashboard');
      } else {
        toast.error(data.message || 'Error creating account');
      }
    } catch (error) {
      toast.error('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-20 pb-8 px-6 max-w-md mx-auto min-h-screen flex flex-col justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-stone-900/60 border border-stone-800/80 p-6 md:p-10 rounded-2xl backdrop-blur-md shadow-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif text-gold-500 mb-2">Create Account</h2>
          <p className="text-stone-400 text-sm">Join us to manage your bookings effortlessly</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium tracking-wider text-stone-400 uppercase">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-stone-500" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-stone-800/50 border border-stone-700 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-white rounded-xl py-2.5 pl-10 pr-4 outline-none transition-all text-sm"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-medium tracking-wider text-stone-400 uppercase">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-stone-500" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-stone-800/50 border border-stone-700 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-white rounded-xl py-2.5 pl-10 pr-4 outline-none transition-all text-sm"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-medium tracking-wider text-stone-400 uppercase">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-stone-500" />
              </div>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-stone-800/50 border border-stone-700 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-white rounded-xl py-2.5 pl-10 pr-4 outline-none transition-all text-sm"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-medium tracking-wider text-stone-400 uppercase">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-stone-500" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-800/50 border border-stone-700 focus:border-gold-500 focus:ring-1 focus:ring-gold-500 text-white rounded-xl py-2.5 pl-10 pr-4 outline-none transition-all text-sm"
                placeholder="••••••••"
                minLength="6"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gold-500 hover:bg-gold-600 text-stone-950 font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 mt-4 text-sm"
          >
            {isLoading ? 'Creating Account...' : (
              <>Register <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <p className="text-center text-stone-400 mt-8 text-sm">
          Already have an account?{' '}
          <button onClick={() => setActivePage('login')} className="text-gold-500 hover:text-gold-400 transition-colors font-medium">
            Sign In Here
          </button>
        </p>
      </motion.div>
    </div>
  );
};

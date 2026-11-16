import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam === 'admin') {
      setEmail('admin@medblock.edu');
      setPassword('Admin@12345');
    } else if (roleParam === 'provider') {
      setEmail('doctor@cityhospital.org');
      setPassword('Doctor@12345');
    } else if (roleParam === 'patient') {
      setEmail('patient@gmail.com');
      setPassword('Patient@12345');
    }
  }, [location]);

  useEffect(() => {
    if (user) {
      if (user.role === 'provider') navigate('/provider');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/patient');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'provider') navigate('/provider');
      else if (loggedUser.role === 'admin') navigate('/admin');
      else navigate('/patient');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoAccount = (role) => {
    if (role === 'admin') {
      setEmail('admin@medblock.edu');
      setPassword('Admin@12345');
    } else if (role === 'provider') {
      setEmail('doctor@cityhospital.org');
      setPassword('Doctor@12345');
    } else {
      setEmail('patient@gmail.com');
      setPassword('Patient@12345');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="glass-panel p-8 rounded-2xl border-slate-800 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Sign In to MedBlock</h2>
          <p className="text-xs text-slate-400">Access authorized medical record registry</p>
        </div>

        {/* Quick 1-Click Demo Accounts */}
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
            ⚡ Quick Demo Accounts
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDemoAccount('admin')}
              className="px-2 py-1.5 rounded-lg text-xs font-medium bg-purple-950/60 text-purple-300 border border-purple-800/60 hover:bg-purple-900/60 transition"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('provider')}
              className="px-2 py-1.5 rounded-lg text-xs font-medium bg-sky-950/60 text-sky-300 border border-sky-800/60 hover:bg-sky-900/60 transition"
            >
              Provider
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount('patient')}
              className="px-2 py-1.5 rounded-lg text-xs font-medium bg-teal-950/60 text-teal-300 border border-teal-800/60 hover:bg-teal-900/60 transition"
            >
              Patient
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold text-sm transition shadow-md shadow-sky-500/20 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Don't have an account?{' '}
          <Link to="/register" className="text-sky-400 hover:underline font-semibold">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}

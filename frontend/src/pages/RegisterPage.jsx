import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, User, Mail, Lock, Building, CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    walletAddress: '',
    hospitalName: '',
    licenseNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { account } = useWeb3();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const autofillWallet = () => {
    if (account) {
      setFormData({ ...formData, walletAddress: account });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(formData);
      if (user.role === 'provider') navigate('/provider');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/patient');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <div className="glass-panel p-8 rounded-2xl border-slate-800 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Create MedBlock Account</h2>
          <p className="text-xs text-slate-400">Join the decentralized medical integrity network</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Account Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'patient' })}
                className={`py-2 rounded-lg text-xs font-medium border transition ${
                  formData.role === 'patient'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'provider' })}
                className={`py-2 rounded-lg text-xs font-medium border transition ${
                  formData.role === 'provider'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                Healthcare Provider
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder={formData.role === 'provider' ? 'Dr. John Doe' : 'Jane Smith'}
              className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          {formData.role === 'provider' && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Hospital / Clinic Name</label>
                <input
                  type="text"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  placeholder="St. Jude Memorial Hospital"
                  className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Medical License ID</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="MED-123456"
                  className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 transition"
                />
              </div>
            </>
          )}

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Ethereum Wallet Address {formData.role === 'provider' && <span className="text-red-400">*</span>}
              </label>
              {account && (
                <button
                  type="button"
                  onClick={autofillWallet}
                  className="text-[11px] text-sky-400 hover:underline font-mono"
                >
                  Use Connected Wallet
                </button>
              )}
            </div>
            <input
              type="text"
              name="walletAddress"
              value={formData.walletAddress}
              onChange={handleChange}
              placeholder="0x..."
              className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold text-sm transition shadow-md shadow-sky-500/20 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Already registered?{' '}
          <Link to="/login" className="text-sky-400 hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

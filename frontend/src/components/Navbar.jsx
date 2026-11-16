import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, ShieldCheck, User, LogOut, Wallet, Activity, Database, KeyRound, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWeb3 } from '../context/Web3Context';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { account, connectWallet, isContractLoaded } = useWeb3();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 p-0.5 shadow-lg shadow-sky-500/20 group-hover:scale-105 transition">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-sky-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  MedBlock
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-sky-950/80 text-sky-300 border border-sky-800/60 rounded">
                  SHA-256
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Medical Record Integrity</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/verify"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                isActive('/verify')
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Verify Record
            </Link>

            <Link
              to="/tamper-demo"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                isActive('/tamper-demo')
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Tamper Demo Lab</span>
            </Link>

            {user?.role === 'provider' && (
              <Link
                to="/provider"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive('/provider')
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Provider Portal
              </Link>
            )}

            {user?.role === 'patient' && (
              <Link
                to="/patient"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive('/patient')
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                My Records
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  isActive('/admin')
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Admin Panel
              </Link>
            )}

            <Link
              to="/explorer"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                isActive('/explorer')
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Ledger Explorer
            </Link>
          </div>

          {/* Right Actions: MetaMask & User */}
          <div className="flex items-center space-x-3">
            {/* MetaMask Wallet Connect */}
            <button
              onClick={connectWallet}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
                account
                  ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:border-sky-500 hover:text-sky-300'
              }`}
              title={account ? `Connected: ${account}` : 'Connect MetaMask Wallet'}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>
                {account
                  ? `${account.slice(0, 6)}...${account.slice(-4)}`
                  : 'Connect Wallet'}
              </span>
            </button>

            {/* User Auth state */}
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-medium text-slate-200">{user.name}</span>
                  <span className="text-[10px] text-sky-400 capitalize font-mono">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-sky-300 bg-sky-950/60 hover:bg-sky-900/80 border border-sky-800 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 rounded-lg shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

import React, { useState, useEffect } from 'react';
import { ShieldAlert, UserCheck, ShieldCheck, Lock, Activity, RefreshCw, CheckCircle2, XCircle, AlertCircle, Trash2 } from 'lucide-react';
import { providerService, recordService, authService } from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function AdminDashboard() {
  const [providers, setProviders] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State for Authorizing Provider
  const [walletAddress, setWalletAddress] = useState('');
  const [providerName, setProviderName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [provRes, usersRes, logsRes] = await Promise.all([
        providerService.getProviders(),
        authService.getAllUsers().catch(() => ({ data: { users: [] } })),
        recordService.getVerificationHistory().catch(() => ({ data: { logs: [] } }))
      ]);

      if (provRes.data.success) setProviders(provRes.data.providers);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (logsRes.data.success) setAuditLogs(logsRes.data.logs);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorize = async (e) => {
    e.preventDefault();
    if (!walletAddress.trim()) return;

    setSubmitting(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const res = await providerService.authorizeProvider({
        walletAddress: walletAddress.trim(),
        providerName,
        hospitalName
      });

      if (res.data.success) {
        setStatusMessage({ type: 'success', text: res.data.message });
        setWalletAddress('');
        setProviderName('');
        setHospitalName('');
        loadAllData();
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to authorize provider on blockchain'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (providerId, address) => {
    if (!window.confirm(`Are you sure you want to revoke provider authorization for ${address}?`)) {
      return;
    }

    try {
      const res = await providerService.revokeProvider({
        providerId,
        walletAddress: address
      });
      if (res.data.success) {
        setStatusMessage({ type: 'success', text: res.data.message });
        loadAllData();
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to revoke provider'
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white">System Administration & Access Control</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Contract Admin
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage authorized healthcare provider wallets, inspect system users, and audit verification history.
          </p>
        </div>

        <button
          onClick={loadAllData}
          className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center gap-1.5 transition self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Ledger Data</span>
        </button>
      </div>

      {statusMessage.text && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border border-red-800 text-red-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Admin Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="text-xs text-slate-400">Authorized Healthcare Providers</div>
          <div className="text-2xl font-bold text-purple-400 mt-1">{providers.length}</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="text-xs text-slate-400">Total Verification Audit Records</div>
          <div className="text-2xl font-bold text-sky-400 mt-1">{auditLogs.length}</div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="text-xs text-slate-400">Smart Contract Admin Address</div>
          <div className="text-xs font-mono text-emerald-400 mt-2 truncate">
            0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
          </div>
        </div>
      </div>

      {/* Main Admin Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Authorize New Provider Form */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
            <UserCheck className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">Authorize Healthcare Provider</h2>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Only authorized Ethereum wallet addresses can execute the <code>registerRecord()</code> function on the smart contract.
          </p>

          <form onSubmit={handleAuthorize} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Provider Wallet Address *</label>
              <input
                type="text"
                required
                placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Doctor / Provider Name</label>
              <input
                type="text"
                placeholder="Dr. Sarah Jenkins, MD"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Hospital / Clinic</label>
              <input
                type="text"
                placeholder="Metropolitan General Hospital"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-xs transition shadow-md shadow-purple-500/20 disabled:opacity-50"
            >
              {submitting ? 'Authorizing on-chain...' : 'Authorize Provider Wallet'}
            </button>
          </form>
        </div>

        {/* Authorized Providers List */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Authorized Healthcare Providers</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">{providers.length} registered</span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[400px]">
            {providers.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No providers found.</div>
            ) : (
              providers.map((p) => (
                <div
                  key={p.id || p._id || p.walletAddress}
                  className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{p.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                        {p.hospitalName || 'Clinical Provider'}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 truncate max-w-[280px]">
                      {p.walletAddress}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevoke(p.id || p._id, p.walletAddress)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                    title="Revoke On-Chain Access"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Verification Audit Logs */}
      <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white">Verification Audit Trail Logs</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">{auditLogs.length} audit logs</span>
        </div>

        {auditLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No verification events recorded yet. Run a verification check to generate audit trails.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                <tr>
                  <th className="py-2.5 px-3">Record ID</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Verifier Role</th>
                  <th className="py-2.5 px-3">Calculated Hash Checked</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {auditLogs.map((log, idx) => (
                  <tr key={log.id || log._id || idx} className="hover:bg-slate-900/50">
                    <td className="py-2.5 px-3 font-bold text-sky-400">{log.recordId}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={log.isValid ? 'VALID' : 'TAMPERED'} isValid={log.isValid} />
                    </td>
                    <td className="py-2.5 px-3 capitalize text-slate-300">{log.verifierRole}</td>
                    <td className="py-2.5 px-3 text-slate-400 truncate max-w-[200px]" title={log.calculatedHash}>
                      {log.calculatedHash?.slice(0, 16)}...
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

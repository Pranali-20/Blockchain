import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, Download, CheckCircle2, AlertCircle, Search, RefreshCw, Sparkles, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { recordService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await recordService.getAllRecords();
      if (res.data.success) {
        setRecords(res.data.records);
      }
    } catch (err) {
      console.error('Error fetching patient records:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(
    (r) =>
      r.recordId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white">Patient Health Records</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Patient Portal
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Welcome back, <span className="text-slate-200 font-semibold">{user?.name}</span>. You can inspect and independently verify all authorized medical records below.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/verify"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-sky-500/20 transition"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Any Document</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Record ID or Category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
          />
        </div>

        <button
          onClick={fetchRecords}
          className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1.5 transition self-end sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Record Cards List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading your medical records...</div>
      ) : filteredRecords.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border-slate-800 space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No Medical Records Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your registered healthcare provider will upload and register your diagnostic documents on the blockchain.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRecords.map((rec) => (
            <div
              key={rec.recordId}
              className="glass-panel p-6 rounded-2xl border-slate-800 hover:border-sky-800/60 transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-sky-400">{rec.recordId}</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">{rec.category}</h3>
                  </div>
                  <StatusBadge status={rec.status} isValid={true} />
                </div>

                <p className="text-xs text-slate-300">
                  {rec.description || 'Clinical diagnostic documentation issued by authorized hospital.'}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Provider:</span>
                    <span className="text-slate-200 font-medium">{rec.providerName || 'Hospital Clinic'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Registered Date:</span>
                    <span className="text-slate-200">{new Date(rec.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* On-chain SHA-256 fingerprint */}
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-900 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                    Blockchain Hash Fingerprint (SHA-256)
                  </div>
                  <div className="font-mono text-[11px] text-sky-300 break-all select-all">
                    {rec.sha256Hash}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <Link
                  to={`/verify?recordId=${rec.recordId}&hash=${rec.sha256Hash}`}
                  className="w-full py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify Record Integrity</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

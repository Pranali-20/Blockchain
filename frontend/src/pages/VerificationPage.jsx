import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, Upload, Hash, CheckCircle2, XCircle, Sparkles, FileText, AlertTriangle, ArrowRight, ShieldAlert, Layers } from 'lucide-react';
import { recordService } from '../services/api';
import { useWeb3 } from '../context/Web3Context';
import StatusBadge from '../components/StatusBadge';
import HashViewer from '../components/HashViewer';

export default function VerificationPage() {
  const location = useLocation();
  const { verifyOnChain, isContractLoaded } = useWeb3();

  const [recordId, setRecordId] = useState('');
  const [directHash, setDirectHash] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileHashPreview, setFileHashPreview] = useState('');
  const [verificationMode, setVerificationMode] = useState('file'); // 'file' or 'hash'

  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idParam = params.get('recordId');
    const hashParam = params.get('hash');
    if (idParam) setRecordId(idParam);
    if (hashParam) {
      setDirectHash(hashParam);
      setVerificationMode('hash');
    }
  }, [location]);

  // Client-side SHA-256 hash generator using Web Crypto API
  const calculateClientSHA256 = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return '0x' + hashHex;
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setError('');
    setResult(null);

    try {
      const computed = await calculateClientSHA256(file);
      setFileHashPreview(computed);
    } catch (err) {
      console.warn('Browser crypto calculation failed, will fallback to server:', err);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!recordId.trim()) {
      setError('Please provide the Record ID to verify against the blockchain.');
      return;
    }

    if (verificationMode === 'file' && !selectedFile) {
      setError('Please upload a medical document to calculate its SHA-256 hash.');
      return;
    }

    if (verificationMode === 'hash' && !directHash.trim()) {
      setError('Please enter the SHA-256 hash string.');
      return;
    }

    setVerifying(true);
    setError('');
    setResult(null);

    try {
      let res;
      if (verificationMode === 'file') {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('recordId', recordId.trim());
        res = await recordService.verifyRecord(formData);
      } else {
        res = await recordService.verifyRecord({
          recordId: recordId.trim(),
          directHash: directHash.trim()
        });
      }

      if (res.data.success) {
        setResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Make sure the backend and blockchain node are active.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800 text-sky-300 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Trustless Cryptographic Verification</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Medical Record Verification Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Authenticate any medical document by recalculating its SHA-256 fingerprint and cross-referencing it against the immutable Ethereum Smart Contract.
        </p>
      </div>

      {/* Verification Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border-slate-800 space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          {/* Record ID Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Step 1: Record ID to Verify
            </label>
            <input
              type="text"
              required
              placeholder="e.g. MR-DEMO-2026-001"
              value={recordId}
              onChange={(e) => setRecordId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          {/* Verification Mode Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Step 2: Provide Document or Hash
              </label>
              <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setVerificationMode('file')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                    verificationMode === 'file'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setVerificationMode('hash')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                    verificationMode === 'hash'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Direct Hash
                </button>
              </div>
            </div>

            {verificationMode === 'file' ? (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-slate-700 hover:border-sky-500/70 rounded-xl p-6 text-center transition bg-slate-900/40 relative">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-xs text-slate-300 font-medium">
                      {selectedFile ? selectedFile.name : 'Select or drop the medical document to verify'}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Calculates client-side SHA-256 fingerprint instant hash
                    </p>
                  </div>
                </div>

                {fileHashPreview && (
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                    <span className="text-slate-400 text-[10px] font-semibold uppercase">
                      Calculated Document Hash:
                    </span>
                    <div className="font-mono text-xs text-sky-300 break-all">{fileHashPreview}</div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="0x..."
                  value={directHash}
                  onChange={(e) => setDirectHash(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-sky-500 transition"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={verifying}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>{verifying ? 'Querying Blockchain Registry...' : 'Perform Blockchain Verification'}</span>
          </button>
        </form>
      </div>

      {/* Verification Result Showcase */}
      {result && (
        <div
          className={`glass-panel p-6 sm:p-8 rounded-2xl border-2 transition ${
            result.isValid
              ? 'border-emerald-500/60 bg-emerald-950/15 shadow-2xl shadow-emerald-500/10'
              : 'border-red-500/60 bg-red-950/15 shadow-2xl shadow-red-500/10'
          } space-y-6`}
        >
          {/* Main Verification Banner */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left pb-4 border-b border-slate-800">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                result.isValid
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
              }`}
            >
              {result.isValid ? (
                <CheckCircle2 className="w-10 h-10" />
              ) : (
                <ShieldAlert className="w-10 h-10" />
              )}
            </div>
            <div>
              <h2
                className={`text-2xl font-extrabold tracking-tight ${
                  result.isValid ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {result.isValid ? '✓ RECORD VERIFIED' : '✗ RECORD TAMPERED'}
              </h2>
              <p className="text-xs text-slate-300 mt-1">{result.message}</p>
            </div>
          </div>

          {/* Side by Side Hash Comparison */}
          <HashViewer
            hashA={result.details.blockchainHash}
            hashB={result.details.calculatedHash}
            labelA="Original Hash on Blockchain"
            labelB="Recalculated Document Hash"
          />

          {/* Audit Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Record Identifier:</span>
              <span className="font-mono font-bold text-white">{result.details.recordId}</span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Verification Status:</span>
              <span
                className={`font-mono font-bold ${
                  result.isValid ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {result.status}
              </span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Registering Provider:</span>
              <span className="font-mono text-sky-400 truncate block" title={result.details.registeredByProvider}>
                {result.details.registeredByProvider}
              </span>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Timestamp:</span>
              <span className="text-slate-200">{new Date(result.details.verifiedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

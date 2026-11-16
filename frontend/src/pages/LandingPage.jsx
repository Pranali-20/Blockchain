import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Cpu, FileCheck, ArrowRight, EyeOff, CheckCircle, XCircle, AlertTriangle, Sparkles, Layers, UserCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
        {/* Background glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-sky-500/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-950/70 border border-sky-800 text-sky-300 text-xs font-semibold tracking-wide shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Decentralized Healthcare Integrity</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Blockchain-Based Medical Record <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Verification System
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Ensure complete medical document integrity and detect unauthorized alterations using 
            <span className="text-sky-300 font-semibold"> SHA-256 cryptographic fingerprints</span> and 
            <span className="text-teal-300 font-semibold"> Ethereum Smart Contracts</span> — while keeping 100% of sensitive patient health information private and off-chain.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/verify"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold text-sm shadow-lg shadow-sky-500/25 transition transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Verify Medical Record</span>
            </Link>

            <Link
              to="/tamper-demo"
              className="px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-amber-500/40 text-amber-300 font-semibold text-sm transition transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Tamper Demo Lab</span>
            </Link>

            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition flex items-center space-x-2"
            >
              <span>Portal Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick stats ticker */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 max-w-4xl mx-auto text-left">
            <div className="glass-card p-4 rounded-xl">
              <div className="text-2xl font-bold text-sky-400">256-Bit</div>
              <div className="text-xs text-slate-400 mt-0.5">SHA-256 Hash Fingerprint</div>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <div className="text-2xl font-bold text-teal-400">0 Bytes</div>
              <div className="text-xs text-slate-400 mt-0.5">Patient PII On Blockchain</div>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <div className="text-2xl font-bold text-cyan-400">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Tamper Detection Accuracy</div>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <div className="text-2xl font-bold text-indigo-400">Instant</div>
              <div className="text-xs text-slate-400 mt-0.5">Smart Contract Verification</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">System Architecture & Workflow</h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            A privacy-first two-tier architecture separating high-volume sensitive medical documents from on-chain cryptographic proofs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Provider Flow Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border-sky-900/40 relative overflow-hidden">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">1. Healthcare Provider Registration</h3>
                <p className="text-xs text-slate-400">Authorized clinic or hospital workflow</p>
              </div>
            </div>

            <ol className="space-y-4 text-xs text-slate-300">
              <li className="flex items-start space-x-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-sky-950 text-sky-400 flex items-center justify-center font-bold text-[11px] shrink-0 border border-sky-800">1</span>
                <span>Doctor uploads lab report / clinical PDF (off-chain storage).</span>
              </li>
              <li className="flex items-start space-x-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-sky-950 text-sky-400 flex items-center justify-center font-bold text-[11px] shrink-0 border border-sky-800">2</span>
                <span>Client & server calculate 64-character SHA-256 cryptographic hash.</span>
              </li>
              <li className="flex items-start space-x-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-sky-950 text-sky-400 flex items-center justify-center font-bold text-[11px] shrink-0 border border-sky-800">3</span>
                <span>Smart contract registers <code>bytes32 recordHash</code> + timestamp + provider address.</span>
              </li>
              <li className="flex items-start space-x-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-sky-950 text-sky-400 flex items-center justify-center font-bold text-[11px] shrink-0 border border-sky-800">4</span>
                <span>Ethereum transaction is mined and emitted as <code>RecordRegistered</code> event.</span>
              </li>
            </ol>
          </div>

          {/* Patient Verification Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border-teal-900/40 relative overflow-hidden">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">2. Patient & Third-Party Verification</h3>
                <p className="text-xs text-slate-400">Trustless integrity check</p>
              </div>
            </div>

            <ol className="space-y-4 text-xs text-slate-300">
              <li className="flex items-start space-x-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-teal-950 text-teal-400 flex items-center justify-center font-bold text-[11px] shrink-0 border border-teal-800">1</span>
                <span>Patient or insurance auditor selects medical record to verify.</span>
              </li>
              <li className="flex items-start space-x-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-teal-950 text-teal-400 flex items-center justify-center font-bold text-[11px] shrink-0 border border-teal-800">2</span>
                <span>Browser or backend recalculates fresh SHA-256 hash of the presented file.</span>
              </li>
              <li className="flex items-start space-x-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-teal-950 text-teal-400 flex items-center justify-center font-bold text-[11px] shrink-0 border border-teal-800">3</span>
                <span>System reads immutable hash from Smart Contract for the given Record ID.</span>
              </li>
              <li className="flex items-start space-x-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-teal-950 text-teal-400 flex items-center justify-center font-bold text-[11px] shrink-0 border border-teal-800">4</span>
                <span className="font-semibold text-emerald-300">Match = Authentic & Unmodified | Mismatch = Tampered</span>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Privacy Guarantee Matrix */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="glass-panel p-8 rounded-2xl border-slate-800 space-y-6">
          <div className="flex items-center space-x-3">
            <EyeOff className="w-6 h-6 text-sky-400" />
            <div>
              <h3 className="text-xl font-bold text-white">Strict Healthcare Privacy Architecture</h3>
              <p className="text-xs text-slate-400">Zero Protected Health Information (PHI) is committed to the blockchain</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-slate-900/80 p-5 rounded-xl border border-emerald-900/40 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Stored On Blockchain (Public Proofs)</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 font-mono">
                <li className="flex items-center gap-2">✓ Record ID (e.g. MR-2026-001)</li>
                <li className="flex items-center gap-2">✓ SHA-256 Hash (bytes32 cryptographic root)</li>
                <li className="flex items-center gap-2">✓ Provider Wallet Address (Ethereum 0x...)</li>
                <li className="flex items-center gap-2">✓ Block Timestamp (Unix epoch)</li>
                <li className="flex items-center gap-2">✓ Off-chain Document Reference URI</li>
              </ul>
            </div>

            <div className="bg-slate-900/80 p-5 rounded-xl border border-red-900/40 space-y-3">
              <div className="flex items-center space-x-2 text-red-400 font-semibold text-sm">
                <XCircle className="w-4 h-4" />
                <span>NEVER Stored On Blockchain (Strictly Off-Chain)</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="flex items-center gap-2 text-red-300/90">✗ Patient Names, DOB, Phone & Address</li>
                <li className="flex items-center gap-2 text-red-300/90">✗ Clinical Diagnoses & Medical History</li>
                <li className="flex items-center gap-2 text-red-300/90">✗ Prescriptions & Dosages</li>
                <li className="flex items-center gap-2 text-red-300/90">✗ Blood test numbers & Lab reports</li>
                <li className="flex items-center gap-2 text-red-300/90">✗ Radiology, MRI & X-Ray Images</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Role Navigation Tiles */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <h3 className="text-xl font-bold text-white text-center">Select Role to Test System</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            to="/login?role=admin"
            className="glass-card p-6 rounded-2xl hover:border-sky-500/50 transition group flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-sky-300 transition">Administrator</h4>
              <p className="text-xs text-slate-400 mt-2">
                Authorize hospital wallet addresses on-chain, manage user roles, and audit blockchain transactions.
              </p>
            </div>
            <div className="text-xs font-semibold text-purple-400 flex items-center gap-1">
              <span>Admin Login</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to="/login?role=provider"
            className="glass-card p-6 rounded-2xl hover:border-sky-500/50 transition group flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-sky-300 transition">Healthcare Provider</h4>
              <p className="text-xs text-slate-400 mt-2">
                Upload medical records, compute SHA-256 hashes, sign blockchain transactions, and register records.
              </p>
            </div>
            <div className="text-xs font-semibold text-sky-400 flex items-center gap-1">
              <span>Doctor / Provider Portal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to="/login?role=patient"
            className="glass-card p-6 rounded-2xl hover:border-sky-500/50 transition group flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-400 flex items-center justify-center mb-4">
                <UserCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-sky-300 transition">Patient Portal</h4>
              <p className="text-xs text-slate-400 mt-2">
                View personal medical records, verify document integrity, download reports, and inspect verification history.
              </p>
            </div>
            <div className="text-xs font-semibold text-teal-400 flex items-center gap-1">
              <span>Patient Login</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

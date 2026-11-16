import React, { useState, useEffect } from 'react';
import { AlertTriangle, Sparkles, RefreshCw, CheckCircle2, XCircle, ShieldAlert, Cpu, Layers, ArrowRight } from 'lucide-react';
import { demoService, recordService } from '../services/api';
import HashViewer from '../components/HashViewer';

export default function TamperDemoLab() {
  const [samples, setSamples] = useState([]);
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);

  const [originalText, setOriginalText] = useState('');
  const [modifiedText, setModifiedText] = useState('');
  const [activeRecordId, setActiveRecordId] = useState('');

  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSamples();
  }, []);

  const loadSamples = async () => {
    try {
      setLoading(true);
      const res = await demoService.getSamples();
      if (res.data.success && res.data.samples.length > 0) {
        setSamples(res.data.samples);
        applySample(res.data.samples[0]);
      }
    } catch (err) {
      console.error('Failed to load demo samples:', err);
    } finally {
      setLoading(false);
    }
  };

  const applySample = (sample) => {
    setOriginalText(sample.originalContent);
    setModifiedText(sample.tamperedContent);
    setActiveRecordId(sample.recordId);
    runComparison(sample.originalContent, sample.tamperedContent);
  };

  const runComparison = async (orig, mod) => {
    try {
      const res = await demoService.simulateTamper({
        originalText: orig,
        modifiedText: mod
      });
      if (res.data.success) {
        setSimulationResult(res.data);
      }
    } catch (err) {
      console.error('Comparison error:', err);
    }
  };

  const handleOriginalChange = (e) => {
    const val = e.target.value;
    setOriginalText(val);
    runComparison(val, modifiedText);
  };

  const handleModifiedChange = (e) => {
    const val = e.target.value;
    setModifiedText(val);
    runComparison(originalText, val);
  };

  const handleResetToMatch = () => {
    setModifiedText(originalText);
    runComparison(originalText, originalText);
  };

  const handleIntroduceTamper = () => {
    if (samples[selectedSampleIndex]) {
      setModifiedText(samples[selectedSampleIndex].tamperedContent);
      runComparison(originalText, samples[selectedSampleIndex].tamperedContent);
    } else {
      const tampered = originalText + "\n[UNAUTHORIZED MODIFICATION]";
      setModifiedText(tampered);
      runComparison(originalText, tampered);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-semibold">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Interactive Cryptographic Tamper Demonstration</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Tampering Demonstration Lab
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
          Experience firsthand how modifying even a single character in a medical record completely changes its SHA-256 fingerprint, triggering instant rejection by the blockchain.
        </p>
      </div>

      {/* Preset Selector */}
      <div className="glass-panel p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Choose Scenario:</span>
          {samples.map((s, idx) => (
            <button
              key={s.recordId}
              onClick={() => {
                setSelectedSampleIndex(idx);
                applySample(s);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedSampleIndex === idx
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {s.recordId} ({s.category.split('-')[0].trim()})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToMatch}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60 transition flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Restore Match (Valid)</span>
          </button>
          <button
            onClick={handleIntroduceTamper}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-950/60 text-red-300 border border-red-800/60 hover:bg-red-900/60 transition flex items-center gap-1"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Apply Tamper (Invalid)</span>
          </button>
        </div>
      </div>

      {/* Dual Document Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Document Panel */}
        <div className="glass-panel p-6 rounded-2xl border-emerald-900/40 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h3 className="text-sm font-bold text-white">Original Medical Record (Registered On-Chain)</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              {activeRecordId}
            </span>
          </div>

          <textarea
            rows={12}
            value={originalText}
            onChange={handleOriginalChange}
            className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition leading-relaxed resize-none"
          />

          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Hash A (Stored On Blockchain):
            </div>
            <div className="font-mono text-xs break-all bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-emerald-400 select-all">
              {simulationResult?.originalHash || 'Calculating...'}
            </div>
          </div>
        </div>

        {/* Modified/Tampered Document Panel */}
        <div className="glass-panel p-6 rounded-2xl border-red-900/40 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className={`w-2.5 h-2.5 rounded-full ${simulationResult?.isMatch ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
              <h3 className="text-sm font-bold text-white">Presented / Potentially Altered Document</h3>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                simulationResult?.isMatch
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : 'bg-red-950 text-red-400 border-red-800 animate-pulse'
              }`}
            >
              {simulationResult?.isMatch ? 'MATCHES' : 'ALTERED'}
            </span>
          </div>

          <textarea
            rows={12}
            value={modifiedText}
            onChange={handleModifiedChange}
            placeholder="Modify any character or number here to see the hash change instantly..."
            className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:border-red-500 transition leading-relaxed resize-none"
          />

          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Hash B (Recalculated Fingerprint):
            </div>
            <div
              className={`font-mono text-xs break-all p-2.5 rounded-lg border select-all ${
                simulationResult?.isMatch
                  ? 'bg-slate-900 border-slate-800 text-emerald-400'
                  : 'bg-red-950/40 border-red-800/80 text-red-300'
              }`}
            >
              {simulationResult?.modifiedHash || 'Calculating...'}
            </div>
          </div>
        </div>
      </div>

      {/* Verification Verdict Display */}
      {simulationResult && (
        <div
          className={`glass-panel p-6 sm:p-8 rounded-2xl border-2 transition ${
            simulationResult.isMatch
              ? 'border-emerald-500/60 bg-emerald-950/20'
              : 'border-red-500/60 bg-red-950/20'
          } space-y-4`}
        >
          <div className="flex items-center space-x-3">
            {simulationResult.isMatch ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-8 h-8 text-red-400 shrink-0" />
            )}
            <div>
              <h4
                className={`text-xl font-extrabold ${
                  simulationResult.isMatch ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {simulationResult.isMatch
                  ? '✓ RECORD INTEGRITY CONFIRMED (Hash A == Hash B)'
                  : '✗ TAMPERING DETECTED BY BLOCKCHAIN (Hash A != Hash B)'}
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">{simulationResult.analysis}</p>
            </div>
          </div>

          {!simulationResult.isMatch && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs">
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Mismatched Hex Chars</span>
                <span className="font-mono font-bold text-red-400 text-lg">
                  {simulationResult.differingHexChars} / 64
                </span>
              </div>
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Avalanche Ratio</span>
                <span className="font-mono font-bold text-amber-400 text-lg">
                  {simulationResult.avalancheEffectPercentage}
                </span>
              </div>
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Smart Contract Verdict</span>
                <span className="font-mono font-bold text-red-400 text-base">REVERT / INVALID</span>
              </div>
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Blockchain Immutability</span>
                <span className="font-mono font-bold text-sky-400 text-base">PRESERVED</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Copy, Check, Hash, Sparkles } from 'lucide-react';

export default function HashViewer({ hashA, hashB, labelA = "Blockchain Hash", labelB = "Calculated Hash" }) {
  const [copiedA, setCopiedA] = useState(false);
  const [copiedB, setCopiedB] = useState(false);

  const cleanA = hashA ? (hashA.startsWith('0x') ? hashA.slice(2) : hashA) : '';
  const cleanB = hashB ? (hashB.startsWith('0x') ? hashB.slice(2) : hashB) : '';

  const isMatch = cleanA && cleanB && cleanA.toLowerCase() === cleanB.toLowerCase();

  const handleCopy = (text, setCopied) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Hash A */}
      <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{labelA}</span>
            <span className="text-[10px] text-slate-500 font-mono">(SHA-256 bytes32)</span>
          </div>
          {hashA && (
            <button
              onClick={() => handleCopy(hashA, setCopiedA)}
              className="text-xs text-slate-400 hover:text-sky-300 flex items-center gap-1 transition"
            >
              {copiedA ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedA ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
        <div className="font-mono text-xs break-all bg-slate-900/90 p-3 rounded-lg border border-slate-800/80 text-sky-300 select-all">
          {hashA || 'No hash recorded'}
        </div>
      </div>

      {/* Hash B (if provided for comparison) */}
      {hashB && (
        <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isMatch ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{labelB}</span>
              <span className="text-[10px] text-slate-500 font-mono">(Computed from file)</span>
            </div>
            <button
              onClick={() => handleCopy(hashB, setCopiedB)}
              className="text-xs text-slate-400 hover:text-sky-300 flex items-center gap-1 transition"
            >
              {copiedB ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedB ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div
            className={`font-mono text-xs break-all p-3 rounded-lg border select-all ${
              isMatch
                ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                : 'bg-red-950/30 border-red-800/60 text-red-300'
            }`}
          >
            {hashB}
          </div>
        </div>
      )}

      {/* Side-by-side character level comparison when mismatched */}
      {hashA && hashB && !isMatch && (
        <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl text-xs space-y-2">
          <div className="flex items-center space-x-2 text-red-400 font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Cryptographic Avalanche Effect Observed:</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            SHA-256 is designed such that changing even a single byte or character in the medical document results in a completely pseudo-random, uncorrelated 256-bit output hash.
          </p>
        </div>
      )}
    </div>
  );
}

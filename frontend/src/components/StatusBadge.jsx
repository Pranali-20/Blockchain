import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';

export default function StatusBadge({ status, isValid }) {
  if (isValid === true || status === 'VALID' || status === 'RECORD_VERIFIED' || status === 'registered_on_chain') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {status === 'registered_on_chain' ? 'On-Chain' : 'VERIFIED (Match)'}
      </span>
    );
  }

  if (isValid === false || status === 'TAMPERED' || status === 'RECORD_TAMPERED' || status === 'tampered') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/40 animate-pulse">
        <XCircle className="w-3.5 h-3.5" />
        TAMPERED (Mismatch)
      </span>
    );
  }

  if (status === 'NOT_FOUND') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
        <AlertCircle className="w-3.5 h-3.5" />
        Not Found On-Chain
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-300 border border-slate-600">
      <Clock className="w-3.5 h-3.5" />
      {status || 'Pending'}
    </span>
  );
}

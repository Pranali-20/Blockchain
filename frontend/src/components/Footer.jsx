import React from 'react';
import { ShieldCheck, Lock, Cpu, FileCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              <span className="font-bold text-white">MedBlock System</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Decentralized application implementing tamper-evident medical record verification using Solidity smart contracts and SHA-256 cryptographic hashing.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Privacy Design</h4>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li>• Zero PII stored on-chain</li>
              <li>• 32-Byte SHA-256 Hashes Only</li>
              <li>• Encrypted off-chain storage</li>
              <li>• Tamper-proof timestamping</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Smart Contract</h4>
            <ul className="text-xs text-slate-400 space-y-1.5 font-mono">
              <li>• MedicalRecordVerification.sol</li>
              <li>• Solidity ^0.8.24</li>
              <li>• Hardhat Local Node (31337)</li>
              <li>• Ethers.js v6 integration</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-sky-400">Security & Integrity</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Cryptographic hash verification ensures that any modification to a medical record is detected instantly through Ethereum smart contracts.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© 2026 MedBlock: Blockchain-Based Medical Record Verification System</p>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Smart Contract Active
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

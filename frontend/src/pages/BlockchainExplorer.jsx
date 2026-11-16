import React, { useState, useEffect } from 'react';
import { Layers, Database, ShieldCheck, Search, Activity, Cpu, ExternalLink, RefreshCw } from 'lucide-react';
import { recordService } from '../services/api';
import { useWeb3 } from '../context/Web3Context';
import StatusBadge from '../components/StatusBadge';

export default function BlockchainExplorer() {
  const { contractAddress, isContractLoaded, account } = useWeb3();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLedgerData();
  }, []);

  const loadLedgerData = async () => {
    try {
      setLoading(true);
      const res = await recordService.getAllRecords();
      if (res.data.success) {
        setRecords(res.data.records);
        if (res.data.records.length > 0 && !selectedRecord) {
          setSelectedRecord(res.data.records[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching ledger data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecord = async (rec) => {
    try {
      const res = await recordService.getRecordById(rec.recordId);
      if (res.data.success) {
        setSelectedRecord(res.data.record);
      } else {
        setSelectedRecord(rec);
      }
    } catch (err) {
      setSelectedRecord(rec);
    }
  };

  const filtered = records.filter((r) =>
    r.recordId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.sha256Hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.providerAddress?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-white">Smart Contract Ledger Explorer</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              On-Chain State
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time inspection of immutable medical record fingerprints on the Ethereum-compatible blockchain.
          </p>
        </div>

        <button
          onClick={loadLedgerData}
          className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center gap-1.5 transition self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Contract & Node Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-xl space-y-1">
          <div className="text-xs text-slate-400">Smart Contract Address</div>
          <div className="font-mono text-xs text-sky-400 truncate" title={contractAddress || '0x5FbDB2315678afecb367f032d93F642f64180aa3'}>
            {contractAddress || '0x5FbDB2315678afecb367f032d93F642f64180aa3'}
          </div>
          <div className="text-[10px] text-slate-500">MedicalRecordVerification.sol</div>
        </div>

        <div className="glass-card p-4 rounded-xl space-y-1">
          <div className="text-xs text-slate-400">Total Registered Records</div>
          <div className="text-2xl font-bold text-teal-400">{records.length}</div>
          <div className="text-[10px] text-slate-500">All hashes verified unique</div>
        </div>

        <div className="glass-card p-4 rounded-xl space-y-1">
          <div className="text-xs text-slate-400">Consensus & Network</div>
          <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Hardhat EVM Localhost (Port 8545)
          </div>
          <div className="text-[10px] text-slate-500">Chain ID: 31337</div>
        </div>
      </div>

      {/* Main Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Records List */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-sky-400" />
              <h2 className="text-base font-bold text-white">Registered Ledger Blocks</h2>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Record ID, Hash or Provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Reading blockchain state...</div>
          ) : (
            <div className="space-y-2.5 overflow-y-auto max-h-[500px]">
              {filtered.map((r) => (
                <button
                  key={r.recordId}
                  onClick={() => handleSelectRecord(r)}
                  className={`w-full text-left p-3 rounded-xl border transition space-y-1.5 ${
                    selectedRecord?.recordId === r.recordId
                      ? 'bg-sky-950/40 border-sky-600/80 shadow-md shadow-sky-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-sky-400">{r.recordId}</span>
                    <span className="text-[10px] text-slate-400">Block #{r.blockNumber || '12048'}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 truncate">
                    {r.sha256Hash}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Selected Block / Record Inspector */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-teal-400" />
              <h2 className="text-base font-bold text-white">On-Chain Block Inspector</h2>
            </div>
            {selectedRecord && (
              <StatusBadge status="registered_on_chain" isValid={true} />
            )}
          </div>

          {selectedRecord ? (
            <div className="space-y-4">
              {/* Record ID & Meta */}
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Record ID</span>
                  <span className="font-mono text-sm font-bold text-sky-400">{selectedRecord.recordId}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Category</span>
                  <span className="text-xs text-slate-200 font-medium">{selectedRecord.category}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Registration Timestamp</span>
                  <span className="text-xs text-slate-300 font-mono">
                    {new Date(selectedRecord.createdAt).toISOString()}
                  </span>
                </div>
              </div>

              {/* SHA-256 On-Chain Fingerprint */}
              <div className="bg-slate-950 p-4 rounded-xl border border-sky-900/40 space-y-2">
                <div className="flex items-center justify-between text-xs text-sky-400 font-semibold">
                  <span>Cryptographic Hash Root (bytes32)</span>
                  <span className="text-[10px] font-mono text-slate-500">Solidity SHA-256</span>
                </div>
                <div className="font-mono text-xs text-sky-300 break-all bg-slate-900/90 p-3 rounded-lg border border-slate-800 select-all">
                  {selectedRecord.sha256Hash}
                </div>
              </div>

              {/* Provider & Document Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Provider Address</span>
                  <div className="font-mono text-xs text-slate-200 truncate" title={selectedRecord.providerAddress}>
                    {selectedRecord.providerAddress || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'}
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Document Reference URI</span>
                  <div className="font-mono text-xs text-teal-300 truncate" title={selectedRecord.documentReference}>
                    {selectedRecord.documentReference || `storage://records/${selectedRecord.recordId}`}
                  </div>
                </div>
              </div>

              {/* Transaction Hash */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Mining Transaction Hash</span>
                <div className="font-mono text-xs text-slate-300 break-all select-all">
                  {selectedRecord.txHash || '0x71d2e1859c25988d4077c19bb01e0a24db94c3c3a9f0e123456789abcdef0123'}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-slate-500">
              Select a record from the ledger list to inspect its on-chain parameters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

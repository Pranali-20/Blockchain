# 🏥 Blockchain-Based Medical Record Verification System

[![Solidity](https://img.shields.io/badge/Solidity-^0.8.24-363636?style=flat-square&logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.0-yellow?style=flat-square&logo=ethereum)](https://hardhat.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.2.11-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.19.2-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-v6-2535a0?style=flat-square&logo=ethereum)](https://docs.ethers.org/v6/)

---

## 📌 1. Project Objective

In traditional healthcare management systems, electronic health records (EHR) stored in centralized databases are susceptible to:
1. **Unauthorized internal manipulation** (e.g., alteration of lab reports, dates, or dosages).
2. **Data tampering in transit** between hospitals, insurance companies, and patients.
3. **Lack of verifiable audit trails** proving whether a medical document has remained unaltered since creation.

This project implements a **decentralized verification mechanism** where authorized healthcare providers register immutable **SHA-256 cryptographic fingerprints** of medical documents on an **Ethereum-compatible Smart Contract**, enabling patients, clinics, and regulatory auditors to verify document authenticity with mathematical certainty without compromising privacy.

---

## 🔒 2. Privacy Design Principle (Zero On-Chain PII)

**Strict Healthcare Privacy Requirement:** Sensitive medical or personally identifiable health information (PHI) is kept off-chain.

```
┌──────────────────────────────────────────────┬──────────────────────────────────────────────┐
│        ON-CHAIN (Ethereum Blockchain)        │          OFF-CHAIN (Secure Storage / DB)     │
├──────────────────────────────────────────────┼──────────────────────────────────────────────┤
│  Record ID (e.g. MR-DEMO-2026-001)           │ ✗ Patient Full Name, DOB, Phone & Address    │
│  SHA-256 Hash (bytes32 cryptographic root)   │ ✗ Clinical Diagnoses & Medical History       │
│  Provider Ethereum Wallet Address (0x...)    │ ✗ Prescribed Medications & Dosages           │
│  Block Timestamp (Unix epoch)                │ ✗ Full Lab Reports & Biochemistry Values     │
│  Document Reference URI                      │ ✗ Radiology, MRI & X-Ray Scans               │
└──────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

---

## 🏗️ 3. System Architecture & Workflow

```
                        ┌───────────────────────────────┐
                        │      Patient / Verifier       │
                        └───────────────┬───────────────┘
                                        │ (Browser UI)
                                        ▼
                        ┌───────────────────────────────┐
                        │    React + Vite Frontend      │
                        │    (Tailwind CSS + Ethers)    │
                        └───────┬───────────────┬───────┘
                                │               │
          API HTTP (JSON/Files) │               │ Sign / Read RPC
                                ▼               ▼
     ┌──────────────────────────────────┐   ┌────────────────────────────────┐
     │      Node.js / Express Backend   │   │ MetaMask Wallet & RPC Provider │
     │  (Multer, SHA-256, JWT Auth)     │   │     (Hardhat Node: 31337)      │
     └──────────────────┬───────────────┘   └───────────────┬────────────────┘
                        │                                   │
                        ▼                                   ▼
     ┌──────────────────────────────────┐   ┌────────────────────────────────┐
     │  Off-Chain Document Storage      │   │  MedicalRecordVerification.sol │
     │  (Files + Metadata Storage)      │   │   (Immutable Smart Contract)   │
     └──────────────────────────────────┘   └────────────────────────────────┘
```

---

## ⚡ 4. Verification & Tamper Detection Logic

### Case A: Unmodified Original Document (Verified)
```
Original Medical Report (PDF/Text)
             ↓
     SHA-256 Algorithm
             ↓
Calculated Hash: 0x7a89f...b42
             ↓
Fetch Hash from Smart Contract: 0x7a89f...b42
             ↓
Comparison: 0x7a89f...b42 === 0x7a89f...b42
             ↓
Result: ✅ RECORD VERIFIED (Authentic)
```

### Case B: Modified / Tampered Document (Detected)
```
Modified Medical Report (Even 1 character changed)
             ↓
     SHA-256 Algorithm (Avalanche Effect)
             ↓
Calculated Hash: 0x9c31e...d88
             ↓
Fetch Hash from Smart Contract: 0x7a89f...b42
             ↓
Comparison: 0x9c31e...d88 !== 0x7a89f...b42
             ↓
Result: ❌ RECORD TAMPERED (Hash Mismatch Detected)
```

---

## 📁 5. Folder Structure

```
d:/Blockchain/
│
├── blockchain/                         # Ethereum Smart Contracts (Hardhat)
│   ├── contracts/
│   │   └── MedicalRecordVerification.sol # Core verification smart contract
│   ├── scripts/
│   │   └── deploy.js                   # Deployment & ABI sync script
│   ├── test/
│   │   └── MedicalRecordVerification.test.js # Unit test suite
│   ├── hardhat.config.js
│   └── package.json
│
├── backend/                            # Express.js REST API
│   ├── config/
│   │   └── db.js                       # Storage connector (Mongoose + JSON fallback)
│   ├── controllers/
│   │   ├── authController.js           # Signup, login, JWT issuance
│   │   ├── recordController.js         # Upload, SHA-256 hashing, verify
│   │   ├── providerController.js       # On-chain authorization management
│   │   └── demoController.js           # Avalanche effect simulator & samples
│   ├── models/
│   │   ├── User.js                     # User schema (Admin/Provider/Patient)
│   │   ├── MedicalRecord.js            # Off-chain record metadata
│   │   └── VerificationLog.js          # Audit trail logs
│   ├── middleware/
│   │   ├── auth.js                     # JWT verification & role authorization
│   │   └── upload.js                   # Multer file upload filter
│   ├── utils/
│   │   ├── blockchain.js               # Ethers contract interface
│   │   └── hashUtils.js                # SHA-256 & bytes32 helpers
│   ├── sample_records/                 # Preset original and tampered files
│   ├── server.js                       # Express server entrypoint
│   └── package.json
│
├── frontend/                           # React (Vite) Single Page Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Navigation, role indicator, wallet connect
│   │   │   ├── Footer.jsx              # Footer component
│   │   │   ├── StatusBadge.jsx         # Verification status pills
│   │   │   └── HashViewer.jsx          # Dual-hash comparison viewer
│   │   ├── context/
│   │   │   ├── AuthContext.jsx         # User auth context & token persistence
│   │   │   └── Web3Context.jsx         # MetaMask & contract connection context
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx         # Home page & architectural explainer
│   │   │   ├── LoginPage.jsx           # Authentication page
│   │   │   ├── RegisterPage.jsx        # Account registration
│   │   │   ├── ProviderDashboard.jsx   # Upload & register records on blockchain
│   │   │   ├── PatientDashboard.jsx    # View and verify patient records
│   │   │   ├── VerificationPage.jsx    # Public cryptographic verification portal
│   │   │   ├── TamperDemoLab.jsx       # Interactive tampering sandbox
│   │   │   ├── AdminDashboard.jsx      # Provider authorization & audit trails
│   │   │   └── BlockchainExplorer.jsx  # Live on-chain block & hash inspector
│   │   ├── services/
│   │   │   └── api.js                  # Axios client
│   │   ├── contracts/
│   │   │   └── MedicalRecordVerification.json # ABI & deployed address
│   │   ├── App.jsx                     # Route definitions
│   │   ├── main.jsx                    # React root
│   │   └── index.css                   # Tailwind styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── docs/
│   └── SYSTEM_ARCHITECTURE.md          # Technical architecture & specification
├── README.md
└── .gitignore
```

---

## 🚀 6. Quick Start & Execution Guide

### Prerequisites
- **Node.js**: v18.0 or higher (`node -v`)
- **npm**: v9.0 or higher (`npm -v`)
- **MetaMask Browser Extension** (Optional for simulated mode, recommended for live signing)

---

### Step 1: Start the Local Blockchain Node & Deploy Contract

Open **Terminal 1**:
```powershell
cd d:\Blockchain\blockchain
npx hardhat node
```
*Starts local Ethereum test node on `http://127.0.0.1:8545` with funded test accounts.*

In **Terminal 2**, deploy the smart contract:
```powershell
cd d:\Blockchain\blockchain
npx hardhat run scripts/deploy.js --network localhost
```
*Deploys `MedicalRecordVerification.sol` and syncs ABI to frontend and backend.*

---

### Step 2: Start the Backend API Server

In **Terminal 3**:
```powershell
cd d:\Blockchain\backend
npm start
```
*Backend runs on `http://localhost:5000` with default pre-seeded accounts.*

---

### Step 3: Start the Frontend Application

In **Terminal 4**:
```powershell
cd d:\Blockchain\frontend
npm run dev
```
*Open [http://localhost:3000](http://localhost:3000) in your browser.*

---

## 👥 7. Default Demo Accounts

For fast demonstration, use the demo accounts:

| Role | Email | Password | Hardhat Account | Default Wallet Address |
| :--- | :--- | :--- | :--- | :--- |
| **System Admin** | `admin@medblock.edu` | `Admin@12345` | Account #0 | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` |
| **Healthcare Provider** | `doctor@cityhospital.org` | `Doctor@12345` | Account #1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` |
| **Patient** | `patient@gmail.com` | `Patient@12345` | Account #2 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` |

---

## 🧪 8. Testing & Verification Walkthrough

### Test A: Provider Registration & Successful Verification
1. Navigate to `http://localhost:3000/login` and log in as **Provider**.
2. Under **Upload Medical Record**, select `backend/sample_records/sample_blood_report_original.txt`.
3. Notice that the system calculates the 64-character SHA-256 fingerprint.
4. Click **Register Record on Blockchain**.
5. Navigate to `/verify`.
6. Enter the Record ID (e.g. `MR-DEMO-2026-001`) and upload `sample_blood_report_original.txt`.
7. Click **Perform Blockchain Verification**.
8. **Result:** **RECORD VERIFIED** with identical cryptographic hashes.

### Test B: Live Tamper Detection
1. Navigate to `/tamper-demo`.
2. Select **MR-DEMO-2026-001 (Lab Report)**.
3. In the right-hand editor, modify Fasting Blood Glucose from `92 mg/dL` to `93 mg/dL` (a 1-digit change).
4. Notice how the SHA-256 hash completely changes across multiple bytes (Cryptographic Avalanche Effect).
5. The verification engine immediately flags: **❌ RECORD TAMPERED**.

---

## 📋 9. Smart Contract Function Reference

| Function | Modifier / Access | Description |
| :--- | :--- | :--- |
| `registerRecord(recordId, hash, ref)` | `onlyAuthorizedProvider` | Registers a new `bytes32` record hash on the blockchain. Emits `RecordRegistered`. |
| `verifyRecord(recordId, hash)` | `public` | Compares calculated hash with blockchain hash, emits `RecordVerified`, stores audit log. |
| `verifyRecordView(recordId, hash)` | `view` (Zero Gas) | Read-only integrity check returning `(bool isValid, bytes32 storedHash)`. |
| `getRecord(recordId)` | `view` | Fetches on-chain metadata for a record. |
| `authorizeProvider(address)` | `onlyAdmin` | Grants record registration privilege to a doctor/hospital wallet address. |
| `revokeProvider(address)` | `onlyAdmin` | Revokes registration privilege. |
| `isProviderAuthorized(address)` | `view` | Checks authorization status of an address. |

---

## 🔬 10. Running Unit Tests

Execute the automated test suite:

```powershell
cd d:\Blockchain\blockchain
npx hardhat test
```

### Verified Test Cases:
1. **Deployment & Initialization**: Admin address configuration and default provider authorization.
2. **Provider Authorization Access Control**: Admin-only provider authorization and revocation.
3. **Unauthorized Access Prevention**: Non-admin rejection and non-authorized provider rejection.
4. **Medical Record Registration**: Successful hash registration and duplicate ID prevention.
5. **Positive Verification Check**: Matching SHA-256 hash returns `isValid = true`.
6. **Tamper Detection Check**: Modified hash returns `isValid = false`.
7. **Audit Trail Logging**: Verification event emissions and on-chain audit queries.

---

## 📄 11. Technical Architecture & Documentation

For detailed architectural specifications, mathematical foundations of SHA-256 hashing, and security considerations, see [docs/SYSTEM_ARCHITECTURE.md](docs/SYSTEM_ARCHITECTURE.md).

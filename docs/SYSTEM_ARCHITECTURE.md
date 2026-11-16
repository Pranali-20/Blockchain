# System Architecture & Technical Specification
## Blockchain-Based Medical Record Verification System

---

## 1. Abstract
The rapid digitization of healthcare records has elevated concerns regarding data integrity, unauthorized alteration, and unauthorized disclosure of Protected Health Information (PHI). Traditional centralized databases are susceptible to single-point-of-failure vulnerabilities and insider tampering. This project implements a decentralized verification system combining **SHA-256 cryptographic hashing** with **Ethereum Smart Contracts**. Sensitive medical data remains strictly off-chain, while immutable 32-byte cryptographic fingerprints are registered on-chain by authenticated healthcare providers. Patients, insurance underwriters, and medical reviewers can verify document authenticity and detect single-bit tampering with mathematical certainty.

---

## 2. Problem Statement
- **Vulnerability to Manipulation:** Medical records, lab reports, and prescriptions can be maliciously altered for insurance fraud, malpractice coverups, or illegal prescription drug acquisition.
- **Privacy Trade-offs in Public Ledgers:** Storing patient health records directly on a blockchain violates HIPAA/GDPR regulations due to the immutable and transparent nature of distributed ledgers.
- **Verification Bottlenecks:** Manual verification of paper or PDF medical reports between institutions is slow, unstandardized, and error-prone.

---

## 3. Mathematical & Cryptographic Foundation

### 3.1 SHA-256 Hash Function
Let $M$ be the medical document of arbitrary bit length $L$.
The SHA-256 algorithm processes 512-bit message blocks through 64 rounds of logical functions, producing a fixed 256-bit (32-byte) message digest:
$$H(M) = \text{SHA-256}(M) \in \{0, 1\}^{256}$$

Key Properties:
1. **Pre-image Resistance (One-Way):** Given hash $h$, it is computationally infeasible to find $M$ such that $H(M) = h$.
2. **Second Pre-image Resistance:** Given $M_1$, it is infeasible to find $M_2 \neq M_1$ such that $H(M_1) = H(M_2)$.
3. **Collision Resistance:** It is infeasible to find any pair $(M_1, M_2)$ such that $H(M_1) = H(M_2)$.
4. **Avalanche Effect:** If input $M$ is modified by a single bit to $M'$, the probability that any given bit in $H(M')$ differs from $H(M)$ is $\approx 0.5$:
$$P(H(M)_i \neq H(M')_i) \approx \frac{1}{2} \quad \forall i \in \{1, \dots, 256\}$$

---

## 4. Smart Contract Data Structures (Solidity)

```solidity
struct MedicalRecord {
    string recordId;            // Unique alphanumeric record code (e.g. MR-2026-001)
    bytes32 recordHash;         // 32-byte SHA-256 fingerprint
    address provider;           // Ethereum wallet of healthcare provider
    uint256 timestamp;          // Block timestamp
    string documentReference;   // Storage URI (e.g. IPFS / Off-chain URI)
    bool exists;                // Existence indicator
}
```

---

## 5. Security Analysis

| Threat Vector | Mitigation in Proposed System |
| :--- | :--- |
| **Data Alteration by Malicious Actor** | Any modification changes the SHA-256 hash. Smart contract verification fails immediately. |
| **Unauthorized Record Injection** | Contract modifier `onlyAuthorizedProvider` restricts `registerRecord()` to whitelisted addresses approved by the Admin. |
| **Patient Privacy Violation** | Zero patient PII (name, diagnoses, prescriptions) is sent to the blockchain. |
| **Replay / Duplicate Attacks** | Contract enforces `require(!records[_recordId].exists)` to prevent overwriting existing registered records. |

---

## 6. Technical Design Considerations (FAQ & Trade-offs)

### Why Ethereum/Solidity?
Ethereum provides a Turing-complete smart contract execution environment (EVM). Using Solidity, we can write immutable access control logic (`onlyAdmin`, `onlyAuthorizedProvider`) and permanent event logs that cannot be altered even by server administrators.

### Why SHA-256 over MD5 or SHA-1?
MD5 and SHA-1 have proven collision vulnerabilities where attackers can generate two different documents with the same hash. SHA-256 is an industry-standard, NIST-approved cryptographic hash with $2^{256}$ possible outputs, offering robust security against collision and birthday paradox attacks.

### How does the system handle off-chain file storage?
Medical documents are stored off-chain in encrypted local servers or decentralized IPFS nodes. The blockchain only stores the SHA-256 hash and the document URI reference.

### What is the gas cost consideration of this design?
Storing 1 KB of raw data on Ethereum costs approximately 640,000 gas. In contrast, storing a fixed 32-byte `bytes32` hash uses only 20,000 gas for the SSTORE opcode, reducing transaction fees by over 95%.

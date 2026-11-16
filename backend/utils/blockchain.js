const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

let contractInstance = null;
let provider = null;
let contractConfig = null;

function loadContractConfig() {
  const configPath = path.join(__dirname, '../contracts/MedicalRecordVerification.json');
  if (fs.existsSync(configPath)) {
    try {
      const data = fs.readFileSync(configPath, 'utf8');
      contractConfig = JSON.parse(data);
      return contractConfig;
    } catch (e) {
      console.warn('[Blockchain] Could not parse contract config file.');
    }
  }
  return null;
}

function getProvider() {
  if (!provider) {
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
    provider = new ethers.JsonRpcProvider(rpcUrl);
  }
  return provider;
}

function getContract(signerOrProvider = null) {
  const config = loadContractConfig();
  if (!config || !config.contractAddress || !config.abi) {
    throw new Error('Contract ABI/Address not found. Please deploy the smart contract first via hardhat.');
  }

  const p = signerOrProvider || getProvider();
  return new ethers.Contract(config.contractAddress, config.abi, p);
}

/**
 * Get contract with an admin/provider signer from private key
 * @param {string} privateKey
 */
function getContractWithSigner(privateKey) {
  const p = getProvider();
  const wallet = new ethers.Wallet(privateKey, p);
  return getContract(wallet);
}

/**
 * Read a record directly from the blockchain
 * @param {string} recordId
 */
async function fetchRecordFromBlockchain(recordId) {
  try {
    const contract = getContract();
    const record = await contract.getRecord(recordId);
    return {
      recordId: record.recordId,
      recordHash: record.recordHash,
      provider: record.provider,
      timestamp: Number(record.timestamp),
      documentReference: record.documentReference,
      exists: record.exists
    };
  } catch (error) {
    console.error(`[Blockchain] Error fetching record ${recordId}:`, error.message);
    throw error;
  }
}

/**
 * Verify record against blockchain
 * @param {string} recordId
 * @param {string} calculatedHash - 0x prefixed bytes32
 */
async function verifyRecordOnBlockchain(recordId, calculatedHash) {
  try {
    const contract = getContract();
    const result = await contract.verifyRecordView(recordId, calculatedHash);
    return {
      isValid: result.isValid,
      storedHash: result.storedHash,
      timestamp: Number(result.timestamp),
      provider: result.provider,
      documentReference: result.documentReference
    };
  } catch (error) {
    console.error(`[Blockchain] Error verifying record ${recordId}:`, error.message);
    throw error;
  }
}

module.exports = {
  getProvider,
  getContract,
  getContractWithSigner,
  fetchRecordFromBlockchain,
  verifyRecordOnBlockchain,
  loadContractConfig
};

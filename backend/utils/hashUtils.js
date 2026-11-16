const crypto = require('crypto');
const fs = require('fs');

/**
 * Compute SHA-256 hash of a file at the given path
 * @param {string} filePath - Absolute or relative path to file
 * @returns {string} 64-character lowercase hex string
 */
function calculateFileSHA256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return calculateBufferSHA256(fileBuffer);
}

/**
 * Compute SHA-256 hash of a Buffer
 * @param {Buffer} buffer
 * @returns {string} 64-character lowercase hex string
 */
function calculateBufferSHA256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Compute SHA-256 hash of a string
 * @param {string} text
 * @returns {string} 64-character lowercase hex string
 */
function calculateStringSHA256(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

/**
 * Format 64-character hex hash into Solidity bytes32 format (with 0x prefix)
 * @param {string} hexHash
 * @returns {string} 0x prefixed hex string (66 chars)
 */
function toBytes32(hexHash) {
  if (!hexHash) return '0x' + '0'.repeat(64);
  const clean = hexHash.startsWith('0x') ? hexHash.slice(2) : hexHash;
  return '0x' + clean.toLowerCase().padStart(64, '0');
}

/**
 * Compare two SHA-256 hashes (case-insensitive, handles 0x prefix)
 * @param {string} hashA
 * @param {string} hashB
 * @returns {boolean}
 */
function compareHashes(hashA, hashB) {
  if (!hashA || !hashB) return false;
  const cleanA = hashA.startsWith('0x') ? hashA.slice(2).toLowerCase() : hashA.toLowerCase();
  const cleanB = hashB.startsWith('0x') ? hashB.slice(2).toLowerCase() : hashB.toLowerCase();
  return cleanA === cleanB;
}

module.exports = {
  calculateFileSHA256,
  calculateBufferSHA256,
  calculateStringSHA256,
  toBytes32,
  compareHashes
};

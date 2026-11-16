const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isMongooseConnected = false;
const fallbackStorePath = path.join(__dirname, '../sample_data/local_db.json');

// In-memory / File-backed fallback store when MongoDB is unreachable
let localStore = {
  users: [],
  records: [],
  verificationLogs: []
};

// Load existing local store if available
if (fs.existsSync(fallbackStorePath)) {
  try {
    localStore = JSON.parse(fs.readFileSync(fallbackStorePath, 'utf8'));
  } catch (e) {
    console.warn('[DB] Initializing fresh local fallback store');
  }
}

function saveLocalStore() {
  try {
    const dir = path.dirname(fallbackStorePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fallbackStorePath, JSON.stringify(localStore, null, 2));
  } catch (e) {
    console.error('[DB] Failed saving local fallback store:', e.message);
  }
}

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medical_records_db';
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongooseConnected = true;
    console.log(` MongoDB Connected successfully to: ${mongoUri}`);
  } catch (err) {
    isMongooseConnected = false;
    console.log(`\n  MongoDB server not detected at ${mongoUri}.`);
    console.log(` Activating robust embedded JSON storage engine for metadata...`);
    console.log(` (The core record integrity remains strictly verified on the Ethereum Smart Contract)\n`);
  }
}

function getStore() {
  return localStore;
}

function isMongo() {
  return isMongooseConnected;
}

module.exports = {
  connectDB,
  isMongo,
  getStore,
  saveLocalStore
};

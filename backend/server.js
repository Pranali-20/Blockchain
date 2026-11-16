const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

const { connectDB, isMongo, getStore, saveLocalStore } = require('./config/db');
const User = require('./models/User');
const MedicalRecord = require('./models/MedicalRecord');
const { SAMPLE_RECORDS } = require('./controllers/demoController');
const { calculateStringSHA256, toBytes32 } = require('./utils/hashUtils');

// Routes
const authRoutes = require('./routes/authRoutes');
const recordRoutes = require('./routes/recordRoutes');
const providerRoutes = require('./routes/providerRoutes');
const demoRoutes = require('./routes/demoRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static directory for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/demo', demoRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Medical Record Blockchain Verification Backend',
    database: isMongo() ? 'MongoDB (Active)' : 'Embedded JSON Engine (Active)',
    timestamp: new Date().toISOString()
  });
});

// Seed default demo accounts
async function seedDefaultData() {
  const defaultAdmin = {
    name: 'Dr. System Administrator',
    email: 'admin@medblock.edu',
    password: 'Admin@12345',
    role: 'admin',
    walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Hardhat Account #0
    hospitalName: 'MedBlock University Medical Center',
    licenseNumber: 'ADMIN-ROOT-001',
    isAuthorizedOnChain: true
  };

  const defaultProvider = {
    name: 'Dr. Sarah Jenkins, MD',
    email: 'doctor@cityhospital.org',
    password: 'Doctor@12345',
    role: 'provider',
    walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Hardhat Account #1
    hospitalName: 'Metropolitan General Hospital',
    licenseNumber: 'MD-99482-NY',
    isAuthorizedOnChain: true
  };

  const defaultPatient = {
    name: 'John Doe',
    email: 'patient@gmail.com',
    password: 'Patient@12345',
    role: 'patient',
    walletAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', // Hardhat Account #2
    hospitalName: '',
    licenseNumber: '',
    isAuthorizedOnChain: false
  };

  if (isMongo()) {
    const adminExists = await User.findOne({ email: defaultAdmin.email });
    if (!adminExists) {
      await User.create(defaultAdmin);
      await User.create(defaultProvider);
      await User.create(defaultPatient);
      console.log(' [Seed] MongoDB populated with default demo accounts.');
    }
  } else {
    const store = getStore();
    if (!store.users || store.users.length === 0) {
      const salt = await bcrypt.genSalt(10);

      const usersToSeed = [defaultAdmin, defaultProvider, defaultPatient];
      for (let i = 0; i < usersToSeed.length; i++) {
        const u = usersToSeed[i];
        const hashPass = await bcrypt.hash(u.password, salt);
        store.users.push({
          _id: `seed_user_${i + 1}`,
          id: `seed_user_${i + 1}`,
          ...u,
          password: hashPass,
          createdAt: new Date()
        });
      }

      // Seed sample medical records
      SAMPLE_RECORDS.forEach((sample, idx) => {
        const docHash = '0x' + calculateStringSHA256(sample.originalContent);
        store.records.push({
          _id: `seed_rec_${idx + 1}`,
          id: `seed_rec_${idx + 1}`,
          recordId: sample.recordId,
          originalFileName: `${sample.recordId}.txt`,
          fileMimeType: 'text/plain',
          fileSize: Buffer.byteLength(sample.originalContent, 'utf8'),
          filePath: '',
          sha256Hash: docHash,
          patientId: 'seed_user_3',
          patientName: sample.patientName,
          patientEmail: 'patient@gmail.com',
          providerId: 'seed_user_2',
          providerName: sample.providerName,
          providerAddress: sample.providerAddress,
          documentReference: `storage://records/${sample.recordId}`,
          txHash: '0x71d2e' + Array(59).fill(0).map(() => Math.floor(Math.random()*16).toString(16)).join(''),
          blockNumber: 12045 + idx,
          status: 'registered_on_chain',
          category: sample.category,
          description: `Verified clinical document for ${sample.patientName}`,
          createdAt: new Date(Date.now() - (idx + 1) * 86400000)
        });
      });

      saveLocalStore();
      console.log(' [Seed] Embedded JSON store populated with default demo users & sample records.');
    }
  }
}

// Start Server
const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  await seedDefaultData();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` Medical Record Verification API Server`);
    console.log(` Running on: http://localhost:${PORT}`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

start();

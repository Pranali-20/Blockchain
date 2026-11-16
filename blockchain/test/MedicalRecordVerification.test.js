const { expect } = require("chai");
const { ethers } = require("hardhat");
const crypto = require("crypto");

describe("MedicalRecordVerification Smart Contract", function () {
  let MedicalRecordVerification;
  let contract;
  let admin;
  let hospitalProvider;
  let clinicProvider;
  let patient;
  let attacker;

  // Helper to compute SHA-256 hash as bytes32
  function sha256Hex(content) {
    const hash = crypto.createHash("sha256").update(content).digest("hex");
    return "0x" + hash;
  }

  beforeEach(async function () {
    [admin, hospitalProvider, clinicProvider, patient, attacker] = await ethers.getSigners();

    MedicalRecordVerification = await ethers.getContractFactory("MedicalRecordVerification");
    contract = await MedicalRecordVerification.deploy();
    await contract.waitForDeployment();

    // Admin authorizes hospitalProvider
    await contract.connect(admin).authorizeProvider(hospitalProvider.address);
  });

  describe("1. Deployment & Initialization", function () {
    it("Should set the deployer as the admin", async function () {
      expect(await contract.admin()).to.equal(admin.address);
    });

    it("Should automatically authorize the deployer as a provider", async function () {
      expect(await contract.isProviderAuthorized(admin.address)).to.be.true;
    });

    it("Should have 0 records initially", async function () {
      expect(await contract.getRecordCount()).to.equal(0);
    });
  });

  describe("2. Provider Authorization Access Control", function () {
    it("Admin should be able to authorize a new healthcare provider", async function () {
      await expect(contract.connect(admin).authorizeProvider(clinicProvider.address))
        .to.emit(contract, "ProviderAuthorized")
        .withArgs(clinicProvider.address, admin.address, (val) => val > 0);

      expect(await contract.isProviderAuthorized(clinicProvider.address)).to.be.true;
    });

    it("Non-admin should NOT be able to authorize a provider", async function () {
      await expect(
        contract.connect(attacker).authorizeProvider(clinicProvider.address)
      ).to.be.revertedWith("Access Denied: Only Admin can perform this action");
    });

    it("Admin can revoke an authorized provider", async function () {
      await contract.connect(admin).revokeProvider(hospitalProvider.address);
      expect(await contract.isProviderAuthorized(hospitalProvider.address)).to.be.false;
    });

    it("Revoked provider cannot register records", async function () {
      await contract.connect(admin).revokeProvider(hospitalProvider.address);

      const sampleDoc = "Patient Blood Test Report: Normal";
      const docHash = sha256Hex(sampleDoc);

      await expect(
        contract.connect(hospitalProvider).registerRecord("MR-TEST-01", docHash, "DOC-REF-01")
      ).to.be.revertedWith("Access Denied: Caller is not an authorized Healthcare Provider");
    });
  });

  describe("3. Medical Record Registration", function () {
    it("Authorized provider can register a medical record hash", async function () {
      const sampleReport = "Patient ID: P-101 | RBC: 4.8 | WBC: 7500 | Glucose: 95 mg/dL";
      const docHash = sha256Hex(sampleReport);
      const recordId = "MR-2026-001";
      const docRef = "ipfs://QmSampleHashOrLocalRef001";

      await expect(
        contract.connect(hospitalProvider).registerRecord(recordId, docHash, docRef)
      )
        .to.emit(contract, "RecordRegistered")
        .withArgs(recordId, docHash, hospitalProvider.address, (val) => val > 0, docRef);

      expect(await contract.getRecordCount()).to.equal(1);

      const record = await contract.getRecord(recordId);
      expect(record.recordId).to.equal(recordId);
      expect(record.recordHash).to.equal(docHash);
      expect(record.provider).to.equal(hospitalProvider.address);
      expect(record.documentReference).to.equal(docRef);
      expect(record.exists).to.be.true;
    });

    it("Cannot register the same Record ID twice", async function () {
      const docHash = sha256Hex("Report 1");
      await contract.connect(hospitalProvider).registerRecord("MR-DUPLICATE", docHash, "REF-1");

      await expect(
        contract.connect(hospitalProvider).registerRecord("MR-DUPLICATE", docHash, "REF-2")
      ).to.be.revertedWith("Record ID already exists on blockchain");
    });

    it("Unauthorized account (attacker / patient) cannot register records", async function () {
      const docHash = sha256Hex("Fake Report");
      await expect(
        contract.connect(attacker).registerRecord("MR-FAKE", docHash, "REF-FAKE")
      ).to.be.revertedWith("Access Denied: Caller is not an authorized Healthcare Provider");
    });
  });

  describe("4. Record Verification & Tamper Detection", function () {
    const originalDocument = "Original Clinical Diagnosis: Acute Bronchitis. Prescribed Amoxicillin 500mg.";
    const tamperedDocument = "TAMPERED Clinical Diagnosis: Chronic Asthma. Prescribed Steroids 1000mg.";
    const recordId = "MR-VERIFY-001";
    let originalHash;
    let tamperedHash;

    beforeEach(async function () {
      originalHash = sha256Hex(originalDocument);
      tamperedHash = sha256Hex(tamperedDocument);

      // Register original document hash on-chain
      await contract.connect(hospitalProvider).registerRecord(
        recordId,
        originalHash,
        "secure-storage/MR-VERIFY-001.pdf"
      );
    });

    it("Should successfully verify unmodified original record (Match -> Valid)", async function () {
      // Patient calculates hash of original file and verifies
      const result = await contract.connect(patient).verifyRecord.staticCall(
        recordId,
        originalHash
      );

      expect(result.isValid).to.be.true;
      expect(result.storedHash).to.equal(originalHash);
      expect(result.provider).to.equal(hospitalProvider.address);

      // Execute transaction to emit event
      await expect(contract.connect(patient).verifyRecord(recordId, originalHash))
        .to.emit(contract, "RecordVerified")
        .withArgs(recordId, patient.address, originalHash, originalHash, true, (val) => val > 0);
    });

    it("Should detect tampering when modified record is presented (Mismatch -> Invalid)", async function () {
      // Patient or reviewer checks a modified document
      const result = await contract.connect(patient).verifyRecord.staticCall(
        recordId,
        tamperedHash
      );

      expect(result.isValid).to.be.false;
      expect(result.storedHash).to.equal(originalHash);
      expect(originalHash).to.not.equal(tamperedHash);

      // Execute transaction to emit event
      await expect(contract.connect(patient).verifyRecord(recordId, tamperedHash))
        .to.emit(contract, "RecordVerified")
        .withArgs(recordId, patient.address, originalHash, tamperedHash, false, (val) => val > 0);
    });

    it("Read-only verifyRecordView works without gas transaction", async function () {
      const validCheck = await contract.verifyRecordView(recordId, originalHash);
      expect(validCheck.isValid).to.be.true;

      const invalidCheck = await contract.verifyRecordView(recordId, tamperedHash);
      expect(invalidCheck.isValid).to.be.false;
    });

    it("Reverts verification if Record ID does not exist", async function () {
      await expect(
        contract.verifyRecordView("NON-EXISTENT-ID", originalHash)
      ).to.be.revertedWith("Record ID not found on blockchain");
    });
  });
});

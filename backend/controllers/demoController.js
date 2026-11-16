const { calculateStringSHA256, toBytes32 } = require('../utils/hashUtils');

const SAMPLE_RECORDS = [
  {
    recordId: 'MR-DEMO-2026-001',
    patientName: 'John Doe (DOB: 1985-04-12)',
    category: 'Lab Report - Comprehensive Metabolic Panel',
    originalContent: `=====================================================
METROPOLITAN GENERAL HOSPITAL - CLINICAL LAB REPORT
Record ID: MR-DEMO-2026-001
Date of Examination: 2026-03-15
Department: Clinical Biochemistry
-----------------------------------------------------
TEST NAME                 RESULT      REFERENCE RANGE
Fasting Blood Glucose     92 mg/dL    (70 - 99 mg/dL)
Blood Urea Nitrogen (BUN) 14 mg/dL    (7 - 20 mg/dL)
Serum Creatinine          0.9 mg/dL   (0.6 - 1.2 mg/dL)
Total Cholesterol         185 mg/dL   (< 200 mg/dL)
HDL Cholesterol           55 mg/dL    (> 40 mg/dL)
LDL Cholesterol           110 mg/dL   (< 100 mg/dL)
Hemoglobin A1c            5.4 %       (< 5.7 %)
-----------------------------------------------------
Physician Diagnosis: Normal metabolic profile. No acute abnormalities.
Attending Physician: Dr. Sarah Jenkins, MD (Lic #MD-99482)
=====================================================`,
    tamperedContent: `=====================================================
METROPOLITAN GENERAL HOSPITAL - CLINICAL LAB REPORT
Record ID: MR-DEMO-2026-001
Date of Examination: 2026-03-15
Department: Clinical Biochemistry
-----------------------------------------------------
TEST NAME                 RESULT      REFERENCE RANGE
Fasting Blood Glucose     188 mg/dL   (70 - 99 mg/dL) [TAMPERED]
Blood Urea Nitrogen (BUN) 38 mg/dL    (7 - 20 mg/dL)  [TAMPERED]
Serum Creatinine          2.4 mg/dL   (0.6 - 1.2 mg/dL)[TAMPERED]
Total Cholesterol         295 mg/dL   (< 200 mg/dL)   [TAMPERED]
HDL Cholesterol           28 mg/dL    (> 40 mg/dL)    [TAMPERED]
LDL Cholesterol           220 mg/dL   (< 100 mg/dL)   [TAMPERED]
Hemoglobin A1c            9.8 %       (< 5.7 %)       [TAMPERED]
-----------------------------------------------------
Physician Diagnosis: Severe Diabetic Ketoacidosis and Renal Impairment!
Attending Physician: Dr. Sarah Jenkins, MD (Lic #MD-99482)
=====================================================`,
    providerName: 'Metropolitan General Hospital',
    providerAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
  },
  {
    recordId: 'MR-DEMO-2026-002',
    patientName: 'Emma Watson',
    category: 'Prescription & Treatment Plan',
    originalContent: `=====================================================
APEX CARDIOLOGY CLINIC - OFFICIAL PRESCRIPTION
Record ID: MR-DEMO-2026-002
Date: 2026-03-20
-----------------------------------------------------
Rx:
1. Lisinopril 10 mg Tablet - Take 1 tablet daily every morning.
2. Atorvastatin 20 mg Tablet - Take 1 tablet daily at bedtime.
3. Aspirin 81 mg Tablet - Take 1 tablet daily with lunch.

Special Instructions: Low sodium diet, 30 min daily walking.
Next Follow-up: 4 Weeks.
Authorized by: Dr. Marcus Vance, MD (Cardiology)
=====================================================`,
    tamperedContent: `=====================================================
APEX CARDIOLOGY CLINIC - OFFICIAL PRESCRIPTION
Record ID: MR-DEMO-2026-002
Date: 2026-03-20
-----------------------------------------------------
Rx:
1. Oxycodone 80 mg Tablet - Take 3 tablets every 4 hours. [ILLEGALLY ALTERED]
2. Lisinopril 50 mg Tablet - Take 2 tablets daily.       [ALTERED]
3. Xanax 2 mg Tablet - Take as needed.                   [FRAUDULENT ENTRY]

Special Instructions: Unlimited refills authorized.
Next Follow-up: Not required.
Authorized by: Dr. Marcus Vance, MD (Cardiology)
=====================================================`,
    providerName: 'Apex Cardiology Clinic',
    providerAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
  }
];

/**
 * @desc    Get sample records for instant demonstration
 * @route   GET /api/demo/samples
 * @access  Public
 */
function getSampleRecords(req, res) {
  const enriched = SAMPLE_RECORDS.map((sample) => {
    const originalHash = calculateStringSHA256(sample.originalContent);
    const tamperedHash = calculateStringSHA256(sample.tamperedContent);
    return {
      ...sample,
      originalHash: '0x' + originalHash,
      tamperedHash: '0x' + tamperedHash,
      originalBytes32: toBytes32(originalHash),
      tamperedBytes32: toBytes32(tamperedHash)
    };
  });

  res.json({ success: true, samples: enriched });
}

/**
 * @desc    Simulate tampering on custom text and compare SHA-256 hashes
 * @route   POST /api/demo/tamper-compare
 * @access  Public
 */
function simulateTamper(req, res) {
  try {
    const { originalText, modifiedText } = req.body;

    if (!originalText || !modifiedText) {
      return res.status(400).json({ success: false, message: 'Please provide both originalText and modifiedText' });
    }

    const originalHash = calculateStringSHA256(originalText);
    const modifiedHash = calculateStringSHA256(modifiedText);
    const isMatch = originalHash.toLowerCase() === modifiedHash.toLowerCase();

    // Calculate differing character count in SHA-256 (Avalanche Effect visualization)
    let differingBits = 0;
    for (let i = 0; i < originalHash.length; i++) {
      if (originalHash[i] !== modifiedHash[i]) differingBits++;
    }

    return res.json({
      success: true,
      originalHash: '0x' + originalHash,
      modifiedHash: '0x' + modifiedHash,
      isMatch,
      status: isMatch ? 'VALID' : 'TAMPERED',
      differingHexChars: differingBits,
      avalancheEffectPercentage: ((differingBits / 64) * 100).toFixed(1) + '%',
      analysis: isMatch
        ? 'Both texts are cryptographically identical.'
        : `Even a minor alteration caused ${differingBits} out of 64 hex characters (${((differingBits/64)*100).toFixed(1)}%) in the SHA-256 hash to completely change. Blockchain verification will detect this instantly!`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getSampleRecords,
  simulateTamper,
  SAMPLE_RECORDS
};

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MedicalRecordVerification
 * @dev Smart contract for registering and verifying medical record integrity on Ethereum-compatible blockchains.
 *
 * PRIVACY DESIGN PRINCIPLE:
 * Only SHA-256 cryptographic hashes and metadata references are stored on-chain.
 * Sensitive patient data (names, diagnoses, prescriptions, lab results) is NEVER stored directly on the blockchain.
 */
contract MedicalRecordVerification {
    // Contract Owner / System Admin
    address public admin;

    // Struct definition for on-chain medical record reference
    struct MedicalRecord {
        string recordId;
        bytes32 recordHash;         // SHA-256 hash (32 bytes)
        address provider;           // Wallet address of registering healthcare provider
        uint256 timestamp;          // Block timestamp of registration
        string documentReference;   // Off-chain document identifier or URI
        bool exists;                // Existence check
    }

    // Mapping from recordId to MedicalRecord
    mapping(string => MedicalRecord) private records;

    // List of all registered record IDs for querying/auditing
    string[] private recordIds;

    // Mapping of authorized healthcare provider wallet addresses
    mapping(address => bool) public authorizedProviders;

    // List of authorized provider addresses
    address[] private providerList;

    // Verification audit log struct
    struct VerificationAudit {
        string recordId;
        address verifier;
        bytes32 queryHash;
        bool isValid;
        uint256 timestamp;
    }

    VerificationAudit[] private verificationAudits;

    // --- EVENTS ---
    event RecordRegistered(
        string indexed recordId,
        bytes32 recordHash,
        address indexed provider,
        uint256 timestamp,
        string documentReference
    );

    event RecordVerified(
        string indexed recordId,
        address indexed verifier,
        bytes32 expectedHash,
        bytes32 providedHash,
        bool isValid,
        uint256 timestamp
    );

    event ProviderAuthorized(
        address indexed provider,
        address indexed authorizedBy,
        uint256 timestamp
    );

    event ProviderRevoked(
        address indexed provider,
        address indexed revokedBy,
        uint256 timestamp
    );

    event AdminTransferred(
        address indexed previousAdmin,
        address indexed newAdmin,
        uint256 timestamp
    );

    // --- MODIFIERS ---
    modifier onlyAdmin() {
        require(msg.sender == admin, "Access Denied: Only Admin can perform this action");
        _;
    }

    modifier onlyAuthorizedProvider() {
        require(
            authorizedProviders[msg.sender] || msg.sender == admin,
            "Access Denied: Caller is not an authorized Healthcare Provider"
        );
        _;
    }

    /**
     * @dev Contract constructor sets deployer as admin and automatically authorizes deployer
     */
    constructor() {
        admin = msg.sender;
        authorizedProviders[msg.sender] = true;
        providerList.push(msg.sender);
        emit ProviderAuthorized(msg.sender, msg.sender, block.timestamp);
    }

    // --- PROVIDER MANAGEMENT ---

    /**
     * @dev Authorize a healthcare provider's wallet address to register records.
     * @param _provider Wallet address of the healthcare provider.
     */
    function authorizeProvider(address _provider) external onlyAdmin {
        require(_provider != address(0), "Invalid provider address");
        require(!authorizedProviders[_provider], "Provider is already authorized");

        authorizedProviders[_provider] = true;
        providerList.push(_provider);
        emit ProviderAuthorized(_provider, msg.sender, block.timestamp);
    }

    /**
     * @dev Revoke an authorized healthcare provider.
     * @param _provider Wallet address to revoke.
     */
    function revokeProvider(address _provider) external onlyAdmin {
        require(authorizedProviders[_provider], "Provider is not currently authorized");
        require(_provider != admin, "Cannot revoke contract admin");

        authorizedProviders[_provider] = false;
        emit ProviderRevoked(_provider, msg.sender, block.timestamp);
    }

    /**
     * @dev Check if a given address is an authorized provider.
     */
    function isProviderAuthorized(address _provider) external view returns (bool) {
        return authorizedProviders[_provider];
    }

    /**
     * @dev Get total count of authorized provider entries.
     */
    function getProviders() external view returns (address[] memory) {
        return providerList;
    }

    // --- RECORD REGISTRATION & VERIFICATION ---

    /**
     * @dev Register a new medical record hash on the blockchain.
     * @param _recordId Unique string identifier for the record (e.g. "MR-2026-001").
     * @param _recordHash SHA-256 hash of the medical document as bytes32.
     * @param _documentReference Off-chain document reference ID or secure storage pointer.
     */
    function registerRecord(
        string memory _recordId,
        bytes32 _recordHash,
        string memory _documentReference
    ) external onlyAuthorizedProvider {
        require(bytes(_recordId).length > 0, "Record ID cannot be empty");
        require(_recordHash != bytes32(0), "Record hash cannot be zero");
        require(!records[_recordId].exists, "Record ID already exists on blockchain");

        records[_recordId] = MedicalRecord({
            recordId: _recordId,
            recordHash: _recordHash,
            provider: msg.sender,
            timestamp: block.timestamp,
            documentReference: _documentReference,
            exists: true
        });

        recordIds.push(_recordId);

        emit RecordRegistered(
            _recordId,
            _recordHash,
            msg.sender,
            block.timestamp,
            _documentReference
        );
    }

    /**
     * @dev Verify a medical record by comparing its calculated SHA-256 hash with the blockchain hash.
     * Emits a RecordVerified event and stores an audit trail.
     * @param _recordId Unique identifier of the record to verify.
     * @param _calculatedHash SHA-256 hash of the file being verified.
     */
    function verifyRecord(
        string memory _recordId,
        bytes32 _calculatedHash
    ) external returns (
        bool isValid,
        bytes32 storedHash,
        uint256 timestamp,
        address provider,
        string memory documentReference
    ) {
        require(records[_recordId].exists, "Record ID not found on blockchain");

        MedicalRecord memory record = records[_recordId];
        isValid = (record.recordHash == _calculatedHash);

        verificationAudits.push(VerificationAudit({
            recordId: _recordId,
            verifier: msg.sender,
            queryHash: _calculatedHash,
            isValid: isValid,
            timestamp: block.timestamp
        }));

        emit RecordVerified(
            _recordId,
            msg.sender,
            record.recordHash,
            _calculatedHash,
            isValid,
            block.timestamp
        );

        return (
            isValid,
            record.recordHash,
            record.timestamp,
            record.provider,
            record.documentReference
        );
    }

    /**
     * @dev Read-only verification function without spending gas or emitting events.
     */
    function verifyRecordView(
        string memory _recordId,
        bytes32 _calculatedHash
    ) external view returns (
        bool isValid,
        bytes32 storedHash,
        uint256 timestamp,
        address provider,
        string memory documentReference
    ) {
        require(records[_recordId].exists, "Record ID not found on blockchain");

        MedicalRecord memory record = records[_recordId];
        isValid = (record.recordHash == _calculatedHash);

        return (
            isValid,
            record.recordHash,
            record.timestamp,
            record.provider,
            record.documentReference
        );
    }

    /**
     * @dev Retrieve record details by Record ID.
     */
    function getRecord(
        string memory _recordId
    ) external view returns (
        string memory recordId,
        bytes32 recordHash,
        address provider,
        uint256 timestamp,
        string memory documentReference,
        bool exists
    ) {
        MedicalRecord memory record = records[_recordId];
        return (
            record.recordId,
            record.recordHash,
            record.provider,
            record.timestamp,
            record.documentReference,
            record.exists
        );
    }

    /**
     * @dev Get total count of registered records.
     */
    function getRecordCount() external view returns (uint256) {
        return recordIds.length;
    }

    /**
     * @dev Get all registered record IDs.
     */
    function getAllRecordIds() external view returns (string[] memory) {
        return recordIds;
    }

    /**
     * @dev Get recent verification audit logs.
     */
    function getVerificationAudits() external view returns (VerificationAudit[] memory) {
        return verificationAudits;
    }

    /**
     * @dev Transfer admin role to a new address.
     */
    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid new admin address");
        address oldAdmin = admin;
        admin = _newAdmin;
        authorizedProviders[_newAdmin] = true;
        emit AdminTransferred(oldAdmin, _newAdmin, block.timestamp);
    }
}

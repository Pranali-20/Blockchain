const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("==================================================");
  console.log("Deploying MedicalRecordVerification Smart Contract");
  console.log("==================================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying contract with account: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${hre.ethers.formatEther(balance)} ETH`);

  // Deploy MedicalRecordVerification
  const MedicalRecordVerification = await hre.ethers.getContractFactory("MedicalRecordVerification");
  const contract = await MedicalRecordVerification.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`\n Contract successfully deployed to: ${contractAddress}`);
  console.log(`Admin address: ${deployer.address}`);

  // Prepare deployment info
  const network = await hre.ethers.provider.getNetwork();
  const deploymentData = {
    contractAddress: contractAddress,
    adminAddress: deployer.address,
    networkName: network.name || "localhost",
    chainId: Number(network.chainId),
    deployedAt: new Date().toISOString(),
    abi: JSON.parse(contract.interface.formatJson())
  };

  // Directories to sync contract ABI and address
  const targets = [
    path.join(__dirname, "../../frontend/src/contracts"),
    path.join(__dirname, "../../backend/contracts"),
    path.join(__dirname, "../build-info")
  ];

  targets.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = path.join(dir, "MedicalRecordVerification.json");
    fs.writeFileSync(filePath, JSON.stringify(deploymentData, null, 2));
    console.log(`Saved deployment info to: ${filePath}`);
  });

  console.log("\n==================================================");
  console.log("Deployment and ABI synchronization complete!");
  console.log("==================================================");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});

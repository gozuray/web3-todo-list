// scripts/whoami.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const bal = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance (ETH):", hre.ethers.formatEther(bal));
}

main().catch((e) => { console.error(e); process.exit(1); });

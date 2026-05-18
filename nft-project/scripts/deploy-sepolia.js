const hre = require("hardhat");

async function main() {
  const mintPrice = hre.ethers.parseEther("0.01"); // 0.01 ETH
  const maxSupply = 1000n;

  console.log("Deploying NFTMarket to Sepolia...");
  
  const nftMarket = await hre.ethers.deployContract("NFTMarket", [mintPrice, maxSupply]);

  await nftMarket.waitForDeployment();

  console.log(`NFTMarket deployed to: ${nftMarket.target}`);
  
  console.log("Wait for a few block confirmations before verifying...");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

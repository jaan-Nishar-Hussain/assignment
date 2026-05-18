const hre = require("hardhat");

async function main() {
  const mintPrice = hre.ethers.parseEther("0.01"); // 0.01 ETH
  const maxSupply = 1000n;

  const nftMarket = await hre.ethers.deployContract("NFTMarket", [mintPrice, maxSupply]);

  await nftMarket.waitForDeployment();

  console.log(`NFTMarket deployed to: ${nftMarket.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

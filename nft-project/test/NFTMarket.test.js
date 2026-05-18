const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarket", function () {
  let nftMarket;
  let owner, addr1, addr2;

  const mintPrice = ethers.parseEther("0.01");
  const maxSupply = 100;

  beforeEach(async function () {
    const NFTMarket = await ethers.getContractFactory("NFTMarket");
    [owner, addr1, addr2] = await ethers.getSigners();
    nftMarket = await NFTMarket.deploy(mintPrice, maxSupply);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await nftMarket.owner()).to.equal(owner.address);
    });

    it("Should set the correct mint price and max supply", async function () {
      expect(await nftMarket.mintPrice()).to.equal(mintPrice);
      expect(await nftMarket.maxSupply()).to.equal(maxSupply);
    });
  });

  describe("Minting", function () {
    it("Should mint a new NFT and set token URI", async function () {
      const tokenURI = "ipfs://QmTest";
      await nftMarket.connect(addr1).mintNFT(tokenURI, { value: mintPrice });

      expect(await nftMarket.ownerOf(1)).to.equal(addr1.address);
      expect(await nftMarket.tokenURI(1)).to.equal(tokenURI);
      expect(await nftMarket.totalSupply()).to.equal(1);
    });

    it("Should fail if not enough ETH is sent", async function () {
      const tokenURI = "ipfs://QmTest";
      await expect(
        nftMarket.connect(addr1).mintNFT(tokenURI, { value: ethers.parseEther("0.005") })
      ).to.be.revertedWith("Not enough ETH sent");
    });

    it("Should return the token ID on mint", async function () {
      const tokenURI = "ipfs://QmTest";
      const tx = await nftMarket.connect(addr1).mintNFT(tokenURI, { value: mintPrice });
      const receipt = await tx.wait();
      const log = receipt.logs.find(l => l.fragment?.name === "Transfer");
      expect(log.args.tokenId).to.equal(1n);
    });
  });

  describe("Marketplace Listings", function () {
    beforeEach(async function () {
      await nftMarket.connect(addr1).mintNFT("ipfs://QmTest1", { value: mintPrice });
    });

    it("Should list an NFT and transfer to contract escrow", async function () {
      const price = ethers.parseEther("0.1");
      await nftMarket.connect(addr1).listNFT(1, price);

      expect(await nftMarket.ownerOf(1)).to.equal(await nftMarket.getAddress());
      expect(await nftMarket.isListed(1)).to.be.true;
      expect(await nftMarket.getListingPrice(1)).to.equal(price);
    });

    it("Should fail if not the owner tries to list", async function () {
      const price = ethers.parseEther("0.1");
      await expect(
        nftMarket.connect(addr2).listNFT(1, price)
      ).to.be.revertedWith("Not the owner");
    });

    it("Should fail if price is zero", async function () {
      await expect(
        nftMarket.connect(addr1).listNFT(1, 0)
      ).to.be.revertedWith("Price must be greater than 0");
    });

    it("Should fail if already listed", async function () {
      const price = ethers.parseEther("0.1");
      await nftMarket.connect(addr1).listNFT(1, price);
      await expect(
        nftMarket.connect(addr1).listNFT(1, price)
      ).to.be.revertedWith("Already listed");
    });

    it("Should track listed token IDs", async function () {
      await nftMarket.connect(addr1).listNFT(1, ethers.parseEther("0.1"));

      const listed = await nftMarket.getListedNFTs();
      expect(listed.length).to.equal(1);
      expect(listed[0]).to.equal(1n);
    });
  });

  describe("Buying NFTs", function () {
    beforeEach(async function () {
      await nftMarket.connect(addr1).mintNFT("ipfs://QmTest1", { value: mintPrice });
      await nftMarket.connect(addr1).listNFT(1, ethers.parseEther("0.1"));
    });

    it("Should transfer NFT to buyer and pay seller", async function () {
      const sellerBalanceBefore = await ethers.provider.getBalance(addr1.address);
      const buyerBalanceBefore = await ethers.provider.getBalance(addr2.address);

      const tx = await nftMarket.connect(addr2).buyNFT(1, { value: ethers.parseEther("0.1") });
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;

      expect(await nftMarket.ownerOf(1)).to.equal(addr2.address);
      expect(await nftMarket.isListed(1)).to.be.false;

      const sellerBalanceAfter = await ethers.provider.getBalance(addr1.address);
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(ethers.parseEther("0.1"));

      const buyerBalanceAfter = await ethers.provider.getBalance(addr2.address);
      expect(buyerBalanceBefore - buyerBalanceAfter - gasCost).to.equal(ethers.parseEther("0.1"));
    });

    it("Should fail if not enough ETH sent", async function () {
      await expect(
        nftMarket.connect(addr2).buyNFT(1, { value: ethers.parseEther("0.05") })
      ).to.be.revertedWith("Insufficient funds sent");
    });

    it("Should fail if seller tries to buy own NFT", async function () {
      await expect(
        nftMarket.connect(addr1).buyNFT(1, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWith("Seller cannot buy own NFT");
    });

    it("Should refund excess ETH", async function () {
      const balanceBefore = await ethers.provider.getBalance(addr2.address);
      const tx = await nftMarket.connect(addr2).buyNFT(1, { value: ethers.parseEther("0.2") });
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(addr2.address);
      const netSpent = balanceBefore - balanceAfter - gasCost;
      expect(netSpent).to.equal(ethers.parseEther("0.1"));
    });

    it("Should remove from listed array after sale", async function () {
      await nftMarket.connect(addr2).buyNFT(1, { value: ethers.parseEther("0.1") });
      const listed = await nftMarket.getListedNFTs();
      expect(listed.length).to.equal(0);
    });
  });

  describe("Canceling Listings", function () {
    beforeEach(async function () {
      await nftMarket.connect(addr1).mintNFT("ipfs://QmTest1", { value: mintPrice });
      await nftMarket.connect(addr1).listNFT(1, ethers.parseEther("0.1"));
    });

    it("Should return NFT to seller", async function () {
      await nftMarket.connect(addr1).cancelListing(1);
      expect(await nftMarket.ownerOf(1)).to.equal(addr1.address);
      expect(await nftMarket.isListed(1)).to.be.false;
    });

    it("Should fail if not the seller tries to cancel", async function () {
      await expect(
        nftMarket.connect(addr2).cancelListing(1)
      ).to.be.revertedWith("Not the seller");
    });

    it("Should remove from listed array", async function () {
      await nftMarket.connect(addr1).cancelListing(1);
      const listed = await nftMarket.getListedNFTs();
      expect(listed.length).to.equal(0);
    });
  });

  describe("Tokens of Owner", function () {
    it("Should exclude listed NFTs from owner tokens", async function () {
      await nftMarket.connect(addr1).mintNFT("ipfs://QmTest1", { value: mintPrice });
      await nftMarket.connect(addr1).mintNFT("ipfs://QmTest2", { value: mintPrice });

      await nftMarket.connect(addr1).listNFT(1, ethers.parseEther("0.1"));

      const tokens = await nftMarket.tokensOfOwner(addr1.address);
      expect(tokens.length).to.equal(1);
      expect(tokens[0]).to.equal(2n);
    });

    it("Should still show bought NFTs for buyer", async function () {
      await nftMarket.connect(addr1).mintNFT("ipfs://QmTest1", { value: mintPrice });
      await nftMarket.connect(addr1).listNFT(1, ethers.parseEther("0.1"));
      await nftMarket.connect(addr2).buyNFT(1, { value: ethers.parseEther("0.1") });

      const tokens = await nftMarket.tokensOfOwner(addr2.address);
      expect(tokens.length).to.equal(1);
      expect(tokens[0]).to.equal(1n);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update mint price", async function () {
      const newPrice = ethers.parseEther("0.05");
      await nftMarket.setMintPrice(newPrice);
      expect(await nftMarket.mintPrice()).to.equal(newPrice);
    });

    it("Should allow owner to withdraw ETH from minting only", async function () {
      await nftMarket.connect(addr1).mintNFT("ipfs://QmTest1", { value: mintPrice });

      const initialBalance = await ethers.provider.getBalance(owner.address);
      const tx = await nftMarket.withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(owner.address);
      expect(finalBalance).to.equal(initialBalance + mintPrice - gasUsed);
    });

    it("Should not include sale proceeds in withdrawable balance", async function () {
      await nftMarket.connect(addr1).mintNFT("ipfs://QmTest1", { value: mintPrice });
      await nftMarket.connect(addr1).listNFT(1, ethers.parseEther("0.1"));

      const contractBalance = await ethers.provider.getBalance(await nftMarket.getAddress());
      expect(contractBalance).to.equal(mintPrice);
    });
  });
});

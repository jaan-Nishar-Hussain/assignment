# Arcen NFT Minting & Marketplace MVP

This is an end-to-end NFT minting application and simple gallery running on the Ethereum Sepolia Testnet. It demonstrates full on-chain minting, IPFS metadata storage using Pinata, and displaying user-owned NFTs.

## Project Structure

- `nft-project/`: Hardhat workspace containing the ERC-721 smart contract, tests, and deployment scripts.
- `nft-frontend/`: React + Vite single page application that integrates with MetaMask and the deployed smart contract.

## Prerequisites

- Node.js v18+
- MetaMask browser extension installed
- Sepolia testnet ETH (for deployment and minting)

## Environment Variables Setup

### 1. Smart Contract (.env in `nft-project/`)
```env
PRIVATE_KEY=your_metamask_private_key
ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/your_alchemy_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 2. Frontend (.env in `nft-frontend/`)
```env
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET=your_pinata_secret_key
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
```

## Smart Contract Setup

1. Navigate to the contract workspace:
   ```bash
   cd nft-project
   npm install
   ```

2. Run the tests:
   ```bash
   npx hardhat test
   ```

3. Deploy to Sepolia:
   ```bash
   npx hardhat run scripts/deploy-sepolia.js --network sepolia
   ```
   *Copy the deployed contract address and add it to the frontend's `.env` file.*

## Frontend Setup

1. Navigate to the frontend workspace:
   ```bash
   cd nft-frontend
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser.

## Features Completed
- ERC-721 implementation with `ERC721URIStorage`
- Full IPFS integration via Pinata (Images & Metadata)
- Web3 wallet connection and network detection
- Minting interface with attributes and direct upload
- Gallery of "My NFTs" fetching from the contract and resolving IPFS endpoints
- Explore page displaying all minted NFTs by querying Transfer events

## Tech Stack
- Solidity ^0.8.24
- OpenZeppelin Contracts v5
- Hardhat + Ethers.js
- React 18 + Vite
- Web3.js
- Pinata IPFS

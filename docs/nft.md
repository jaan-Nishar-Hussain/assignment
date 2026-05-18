NFT Minting & Marketplace
MVP Product Requirements Document
Ethereum Sepolia Testnet · ERC-721 · Hardhat · React + web3.js
v1.0 MVP Sepolia Testnet ~5–6 weeks 3 Engineers
Contents
01 Overview & Goals 02 Tech Stack
03 System Architecture 04 Smart Contract Specification
05 Front-End Specification 06 User Flows
07 Build Phases 08 Feature Matrix
09 Risks & Mitigations 10 Deliverables
NFT Minting & Marketplace — MVP PRD · Ethereum Sepolia Testnet Page 1
01 Overview & Goals
This document defines the end-to-end requirements for building an NFT minting and marketplace prototype on the
Ethereum Sepolia testnet. The MVP demonstrates a complete on-chain minting flow with a React front-end —
usable as a portfolio piece, hackathon submission, or foundation for a production dApp.
CONTRACT STANDARD
ERC-721 (OpenZeppelin)
NETWORK
Ethereum Sepolia
FRONT-END
React + web3.js
DEV ENVIRONMENT
Hardhat + Sepolia
NOTE
Scope boundary: This MVP covers minting and display only. Secondary-market trading (buy/sell listings with ETH
transfers between users) is a post-MVP feature.
02 Tech Stack
Technology Solidity 0.8.x OpenZeppelin 5.x Hardhat Ethers.js / web3.js IPFS via Pinata React 18 + Vite MetaMask Alchemy / Infura Hardhat + Chai Purpose
ERC-721 implementation with URI storage and access control
ERC721URIStorage, Ownable, Counters — audited base contracts
Compile, test, local node, deploy scripts
Hardhat scripts use Ethers.js; React uses web3.js for wallet integration
Upload image + JSON metadata; store ipfs:// URI on-chain
SPA with component-based UI, hooks for wallet state
Browser extension; injects window.ethereum for web3.js
Free-tier Sepolia RPC endpoint for deployment and reads
Unit tests for all contract functions before Sepolia deploy
Layer Contract Contract Dev tooling Dev tooling Metadata Front-end Wallet RPC Testing 03 System Architecture
Three independent layers communicate through standard interfaces. No backend server is required for the MVP —
all reads go through the RPC node and all writes through MetaMask-signed transactions.
NFT Minting & Marketplace — MVP PRD · Ethereum Sepolia Testnet Page 2
DESIGN DECISION
Key design decision: Metadata is stored on IPFS (not on-chain) to keep gas costs low. Only the tokenURI string (an
ipfs:// URI) is written to the EVM. This is the industry standard (OpenSea, Rarible).
User / MetaMask Signs transactions, provides ETH for gas
React SPA Minting form, gallery, wallet UI
Alchemy RPC Sepolia node access via JSON-RPC
Pinata IPFS Metadata + image hosting
Sepolia chain NFTMarket.sol state (owners, tokenURIs)
↓
↓
↓
↓
04 Smart Contract Specification
Contract name: NFTMarket.sol — inherits ERC721URIStorage and Ownable from OpenZeppelin.
State Variables
Variable Type Purpose
_tokenIds Counters.Counter Auto-incrementing token ID (starts at 1)
mintPrice uint256 ETH price per mint in wei (owner-settable)
maxSupply uint256 Hard cap on total tokens
Public Functions
Function Visibility Description
mintNFT(tokenURI) public payable Mint 1 NFT to msg.sender; requires msg.value >= mintPrice; emits
Transfer
tokenURI(tokenId) public view Returns ipfs:// metadata URI (inherited, overridden)
tokensOfOwner(addr) public view Returns array of token IDs owned by address
totalSupply() public view Returns current minted count
setMintPrice(wei) onlyOwner Update mint price
withdraw() onlyOwner Send contract ETH balance to owner
NFT Minting & Marketplace — MVP PRD · Ethereum Sepolia Testnet Page 3
WARNING
Gas note: tokensOfOwner is an O(n) loop — acceptable at MVP scale. For mainnet, replace with an event-indexed
approach or use The Graph.
Metadata Schema (stored on IPFS)
{ "name": "My NFT #1", "description": "...", "image": "ipfs://Qm.../image.png",
"attributes": [{ "trait_type": "Creator", "value": "0xabc..." }] }
Hardhat Project Structure
nft-project/
contracts/
NFTMarket.sol
scripts/
deploy.js # deploy to hardhat local
deploy-sepolia.js # deploy to Sepolia
test/
NFTMarket.test.js
hardhat.config.js
.env # PRIVATE_KEY, ALCHEMY_URL
05 Front-End Specification
A single-page React application with three main views. State is managed with React hooks; wallet connection state
is lifted to a top-level context.
Component Tree
App
<WalletContext> # account, chainId, web3 instance
<Navbar> # connect wallet button, address badge
<MintPage>
<ImageUpload> # drag-drop, preview, Pinata upload
<MetadataForm> # name, description, attributes
<MintButton> # calls mintNFT(), shows tx status
<GalleryPage>
<NFTCard> x n # image, name, token ID, owner
Pages & Routes
Page Description
Upload image, fill metadata, mint. Shows gas estimate and transaction status.
Displays all tokens owned by connected wallet. Fetches and resolves IPFS tokenURIs.
Shows all minted tokens by querying Transfer events (optional MVP page).
Route / Mint /gallery My NFTs /explore All NFTs NFT Minting & Marketplace — MVP PRD · Ethereum Sepolia Testnet Page 4
Key Front-End Implementation
Implementation
window.ethereum.request({ method: 'eth_requestAccounts' }); detect Sepolia (chainId
11155111); prompt switch if wrong network
POST image to Pinata → get IpfsHash → build metadata JSON → POST JSON → construct
ipfs://Qm... URI
Instantiate contract with ABI + address; call contract.methods.mintNFT(tokenURI).send({ from,
value: mintPrice })
Listen to .on('transactionHash'), .on('receipt'), .on('error'); show pending / success / failed states
Call tokensOfOwner(account); for each tokenId call tokenURI(id); fetch JSON from IPFS
gateway; render cards
Feature Connect wallet Upload to IPFS Mint transaction Transaction status Gallery load 06 User Flows
Flow A — Mint an NFT
1 Connect wallet User clicks 'Connect MetaMask'. App requests accounts. If not on Sepolia, prompts network
2 Upload image 3 Fill metadata 4 Confirm mint ✓ Confirmation switch.
User drags/selects image file. App previews it and uploads to Pinata via API. Returns IPFS image
URI.
User enters NFT name, description, optional trait attributes. App builds ERC-721 JSON and
uploads to IPFS.
App shows estimated gas + mint price. User clicks 'Mint'. MetaMask pops up for signature.
App shows 'Pending...' → 'Minted! Token ID #N'. Link to Sepolia Etherscan. Token appears in
gallery.
Flow B — Browse Owned NFTs
1 Navigate to My NFTs 2 Resolve metadata ✓ Display gallery Wallet must be connected. App calls tokensOfOwner(account) on-chain.
For each tokenId, app fetches tokenURI then resolves IPFS JSON via public gateway.
Grid of NFT cards with image thumbnail, name, token ID, and Etherscan link.
07 Build Phases
Total estimated timeline: 5–6 weeks for a 2–3 person team.
NFT Minting & Marketplace — MVP PRD · Ethereum Sepolia Testnet Page 5
01 Environment Setup & Local Contract • Initialise Hardhat project: npx hardhat init (choose TypeScript or JS)
• Install OpenZeppelin: npm install @openzeppelin/contracts
• Write NFTMarket.sol inheriting ERC721URIStorage, Ownable
• Implement mintNFT, tokensOfOwner, setMintPrice, withdraw
• Write Chai unit tests: mint, ownership check, URI retrieval, onlyOwner guards
• Write deploy.js for Hardhat local network; test with npx hardhat node
• Get SepoliaETH from Sepolia faucet; set up Alchemy for Sepolia RPC
• Add Sepolia network to hardhat.config.js using env vars
• Run npx hardhat run scripts/deploy-sepolia.js --network sepolia
• Verify contract on Etherscan using hardhat-etherscan plugin
02 IPFS & Metadata Pipeline • Create Pinata account; generate API key and secret for uploads
• Write pinataService.js: uploadImage(file) → ipfs hash, uploadMetadata(json) → hash
• Define and validate the metadata JSON schema (name, description, image, attributes)
• Test upload pipeline in isolation before integrating into React
• Configure IPFS gateway fallback: ipfs.io → gateway.pinata.cloud → dweb.link
• Store Pinata API keys in .env, access via import.meta.env (Vite)
03 React Front-End — Wallet & Minting • Scaffold React app: npm create vite@latest nft-frontend -- --template react
• Install web3.js: npm install web3
• Create WalletContext: expose account, web3, contract, connectWallet()
• Implement wallet connection; detect wrong network and prompt switch to Sepolia (chainId 0xaa36a7)
• Import deployed contract ABI (from Hardhat artifacts) and address into React
• Build ImageUpload component: file input, drag-drop, preview, call pinataService.uploadImage
• Build MetadataForm: controlled inputs for name, description, attribute pairs
• Build MintButton: assemble metadata, upload JSON to IPFS, call mintNFT with correct value
• Show transaction lifecycle: pending hash → block confirmation → success with token ID
NFT Minting & Marketplace — MVP PRD · Ethereum Sepolia Testnet Week 1 · 4–5 days
Week 2 · 3–4 days
Week 3–4 · 7–8
days
Page 6
• Add Etherscan link: https://sepolia.etherscan.io/tx/{txHash}
Week 5–6 · 5–6
days
Build GalleryPage: call tokensOfOwner → map over IDs → resolve each tokenURI
Fetch IPFS metadata JSON for each token; handle loading skeleton and error states
Build NFTCard: thumbnail image, name, token ID badge, Etherscan link
Add 'All NFTs' explore page using getPastEvents('Transfer', {fromBlock: deployBlock})
Error handling: no MetaMask installed, user rejects transaction, IPFS gateway timeout
Responsive layout for mobile viewports
Deploy React app to Vercel or Netlify with env vars configured
Write README.md with setup instructions, env var list, and demo GIF
04 Gallery, Polish & Deployment • • • • • • • • • Final end-to-end test on Sepolia: mint → confirm on Etherscan → verify gallery
08 Feature Matrix
Status Notes
Feature ERC-721 mint with tokenURI Required Core MVP feature
IPFS metadata + image upload Required Via Pinata API
MetaMask wallet connect Required Sepolia network detection
Minting UI with tx status Required Pending → confirmed flow
My NFTs gallery Required Filter by connected wallet
Hardhat unit tests Required mintNFT, URIs, access control
Etherscan contract verification Nice to have Adds credibility; 1 hour effort
Explore all NFTs page Nice to have Uses getPastEvents; can be slow
Trait/attribute display on card Nice to have Parse attributes[] from metadata
Mint price in ETH display Nice to have Read mintPrice from contract
P2P marketplace listings Post-MVP Requires Marketplace contract + escrow
NFT Minting & Marketplace — MVP PRD · Ethereum Sepolia Testnet Page 7
Royalties (ERC-2981) Post-MVP Add after marketplace is live
WalletConnect / Rainbow Kit Post-MVP Swap web3.js for wagmi + viem
The Graph indexing Post-MVP Replace getPastEvents for scale
09 Risks & Mitigations
Risk & Mitigation Impact
Sepolia faucet dry / rate-limited
Use multiple faucets: Alchemy, Chainlink, Infura. Request early in the project.
IPFS gateway unavailability
Implement fallback: ipfs.io → gateway.pinata.cloud → dweb.link. Cache resolved URLs.
Pinata API key exposed in client bundle
Use Pinata dedicated gateway or add a lightweight Node proxy (Vercel serverless fn) for
uploads.
web3.js v4 breaking API changes
Pin to web3@4.x. If blockers arise, switch to Contract bug post-deploy
only gas.
Likelihood Medium Low
Medium Medium
High Medium
ethers.js v6 (near-identical patterns).
Low Low
Write unit tests before Sepolia deploy. Deploy to hardhat local first. Sepolia redeploy costs
High Low
10 Deliverables
Smart Contract
→ NFTMarket.sol source file
→ Hardhat config for local + Sepolia
→ deploy.js and deploy-sepolia.js scripts
→ NFTMarket.test.js with full coverage
→ Verified on Sepolia Etherscan
→ Deployed contract address in README
Front-End App
→ React SPA (Vite) source code
→ WalletContext + MetaMask integration
→ Mint page with IPFS upload
→ My NFTs gallery page
→ Contract ABI + address config
→ Deployed to Vercel / Netlify
NFT Minting & Marketplace — MVP PRD · Ethereum Sepolia Testnet Page 8
Documentation
→ README with local setup steps
→ .env.example with all required vars
→ Architecture diagram
→ Demo video or GIF of full flow
Environment Vars
→ PRIVATE_KEY (deployer wallet)
→ ALCHEMY_SEPOLIA_URL
→ ETHERSCAN_API_KEY
→ VITE_PINATA_API_KEY
→ VITE_PINATA_SECRET
→ VITE_CONTRACT_ADDRESS
DONE CRITERIA
Definition of done: A user can open the deployed React app, connect MetaMask on Sepolia, upload an image, mint
an NFT with one click, see the transaction confirmed on Etherscan, and view the minted token in their gallery.
NFT Minting & Marketplace — MVP PRD · Ethereum Sepolia Testnet Page 9
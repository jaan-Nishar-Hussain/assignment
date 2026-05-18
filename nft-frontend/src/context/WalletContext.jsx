import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useAccount, useWalletClient } from "wagmi";
import NFTMarketABI from "../contracts/NFTMarket.json";

const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const initContract = (signer) => {
  if (!CONTRACT_ADDRESS) return null;
  return new ethers.Contract(CONTRACT_ADDRESS, NFTMarketABI.abi, signer);
};

export const WalletProvider = ({ children }) => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [error, setError] = useState("");

  // When wagmi detects a connected wallet, bridge to ethers.js for contract interactions
  const initEthers = useCallback(async () => {
    if (!isConnected || !walletClient) {
      setProvider(null);
      setSigner(null);
      setContract(null);
      return;
    }

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signerInstance = await browserProvider.getSigner();
      setProvider(browserProvider);
      setSigner(signerInstance);
      setContract(initContract(signerInstance));
      setError("");
    } catch (err) {
      console.error("Failed to init ethers:", err);
      setError(err.message || "Failed to initialize wallet");
    }
  }, [isConnected, walletClient]);

  useEffect(() => {
    initEthers();
  }, [initEthers]);

  return (
    <WalletContext.Provider
      value={{
        account: isConnected ? address : "",
        provider,
        signer,
        contract,
        error,
        // connectWallet and disconnectWallet are now handled by RainbowKit's ConnectButton
        connectWallet: () => {},
        disconnectWallet: () => {},
        switchNetwork: () => {},
        isWrongNetwork: false,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

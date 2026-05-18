import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import NFTMarketABI from "../contracts/NFTMarket.json";

const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";
const SEPOLIA_CHAIN_ID_DEC = 11155111;
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const SEPOLIA_NETWORK_PARAMS = {
  chainId: SEPOLIA_CHAIN_ID_HEX,
  chainName: "Sepolia Testnet",
  nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://rpc.sepolia.org"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
};

const parseChainId = (chainId) => {
  if (typeof chainId === "string") {
    return Number(chainId);
  }
  return Number(chainId);
};

const initContract = (signer) => {
  if (!CONTRACT_ADDRESS) return null;
  return new ethers.Contract(CONTRACT_ADDRESS, NFTMarketABI.abi, signer);
};

const STORAGE_KEY = "nftasign_wallet";

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  const checkNetwork = async () => {
    if (!window.ethereum) return;
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      const onSepolia = parseChainId(chainId) === SEPOLIA_CHAIN_ID_DEC;
      setIsWrongNetwork(!onSepolia);
      if (onSepolia) return;

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
        });
        setIsWrongNetwork(false);
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [SEPOLIA_NETWORK_PARAMS],
            });
            setIsWrongNetwork(false);
          } catch {
            setIsWrongNetwork(true);
          }
        } else {
          setIsWrongNetwork(true);
        }
      }
    } catch {
      setIsWrongNetwork(true);
    }
  };

  const switchNetwork = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
      });
      setIsWrongNetwork(false);
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [SEPOLIA_NETWORK_PARAMS],
          });
          setIsWrongNetwork(false);
        } catch {
          setIsWrongNetwork(true);
        }
      }
    }
  };

  const connectWallet = async () => {
    if (isConnecting) return;
    try {
      setIsConnecting(true);
      setError("");

      if (window.ethereum) {
        await checkNetwork();
        const browserProvider = new ethers.BrowserProvider(window.ethereum);

        await browserProvider.send("eth_requestAccounts", []);
        const signerInstance = await browserProvider.getSigner();
        const address = await signerInstance.getAddress();

        setProvider(browserProvider);
        setSigner(signerInstance);
        setAccount(address);
        setContract(initContract(signerInstance));
        localStorage.setItem(STORAGE_KEY, address);
      } else {
        setError("MetaMask not detected. Please install it.");
      }
    } catch (err) {
      if (err.code === -32002) {
        setError("Connection request already pending. Please open MetaMask to approve.");
      } else if (err.message) {
        setError(err.message);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAccount("");
    setSigner(null);
    setContract(null);
    setProvider(null);
    setError("");
  };

  const reinitialize = useCallback(async () => {
    if (!window.ethereum) {
      localStorage.removeItem(STORAGE_KEY);
      setAccount("");
      setSigner(null);
      setContract(null);
      return;
    }
    try {
      // Use eth_accounts (silent) instead of eth_requestAccounts (prompts MetaMask)
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (!accounts || accounts.length === 0) {
        // No connected account — clear saved state, don't prompt
        localStorage.removeItem(STORAGE_KEY);
        setAccount("");
        setSigner(null);
        setContract(null);
        return;
      }
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signerInstance = await browserProvider.getSigner();
      const actualAddress = await signerInstance.getAddress();
      setProvider(browserProvider);
      setSigner(signerInstance);
      setAccount(actualAddress);
      setContract(initContract(signerInstance));
      localStorage.setItem(STORAGE_KEY, actualAddress);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setAccount("");
      setSigner(null);
      setContract(null);
    }
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        reinitialize();
      }

      window.ethereum.on("accountsChanged", () => {
        reinitialize();
      });
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, [reinitialize]);

  return (
    <WalletContext.Provider value={{ account, provider, signer, contract, error, connectWallet, disconnectWallet, switchNetwork, isWrongNetwork }}>
      {children}
    </WalletContext.Provider>
  );
};

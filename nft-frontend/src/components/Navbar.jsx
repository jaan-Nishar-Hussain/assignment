import { Link } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { Wallet, LogOut, AlertTriangle } from "lucide-react";

export default function Navbar() {
  const { account, connectWallet, disconnectWallet, switchNetwork, isWrongNetwork, error } = useWallet();

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white">
      <div className="mx-auto flex h-11 max-w-[980px] items-center justify-between px-4 text-xs text-[#1d1d1f]">
        <Link to="/" className="flex items-center opacity-80 hover:opacity-100 transition-opacity font-semibold text-sm">
          Arcen NFT
        </Link>
        <div className="flex items-center gap-8">
          <Link to="/" className="opacity-80 hover:opacity-100 transition-opacity">Home</Link>
          <Link to="/mint" className="opacity-80 hover:opacity-100 transition-opacity">Mint</Link>
          <Link to="/gallery" className="opacity-80 hover:opacity-100 transition-opacity">My NFTs</Link>
          <Link to="/explore" className="opacity-80 hover:opacity-100 transition-opacity">Explore</Link>
        </div>
        <div className="flex items-center gap-4">
          {account ? (
            <div className="flex items-center gap-2">
              {isWrongNetwork && (
                <button
                  onClick={switchNetwork}
                  className="flex items-center gap-1 text-xs font-semibold text-[#ef4444] bg-[rgba(239,68,68,0.1)] border border-[#ef4444] px-2.5 py-1.5 rounded-full whitespace-nowrap"
                >
                  <AlertTriangle size={12} />
                  Wrong Network
                </button>
              )}
              <div className="flex items-center gap-1.5 bg-[#f5f5f7] px-3 py-1.5 rounded-full border border-[#e5e5e5] font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-[#ff007a]" />
                {formatAddress(account)}
              </div>
              <button
                onClick={disconnectWallet}
                className="opacity-60 hover:opacity-100 hover:text-[#ef4444] transition-all p-1.5 rounded-full border border-[#e5e5e5]"
                title="Disconnect"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="flex items-center gap-1.5 bg-[#0071e3] text-white px-4 py-1.5 rounded-full text-xs font-medium hover:bg-[#0077ed] transition-colors"
            >
              <Wallet size={14} />
              Connect Wallet
            </button>
          )}
        </div>
      </div>
      {error && !isWrongNetwork && (
        <div className="absolute top-full right-4 bg-[#ef4444] text-white px-3 py-1.5 rounded-b-lg text-xs">
          {error}
        </div>
      )}
    </nav>
  );
}

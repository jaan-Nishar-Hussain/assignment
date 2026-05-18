import { Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
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
        <div className="flex items-center">
          <ConnectButton
            chainStatus="icon"
            showBalance={false}
            accountStatus="avatar"
          />
        </div>
      </div>
    </nav>
  );
}

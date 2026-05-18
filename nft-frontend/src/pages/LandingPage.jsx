import React, { useState, useRef } from "react";
import { Search, ShoppingBag, Pause, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const dropdownMenus = {
  Explore: {
    sections: [
      {
        title: "Marketplace",
        items: ["All NFTs", "Art", "Collectibles", "Photography", "Domain Names", "Sports", "Music", "Virtual Worlds"],
      },
      {
        title: "Trending",
        items: ["Top Collections", "Top Creators", "Hot Bids", "Recently Added", "Live Auctions"],
      },
      {
        title: "Resources",
        items: ["Learn", "Help Center", "Platform Status", "Partners", "Taxes"],
      },
    ],
  },
  Mint: {
    sections: [
      {
        title: "Create",
        items: ["Create Collection", "Mint NFT", "Batch Minting", "Lazy Minting"],
      },
      {
        title: "Creator Tools",
        items: ["Creator Studio", "Analytics", "Earnings", "Royalties", "Gas Optimization"],
      },
      {
        title: "Support",
        items: ["Creator Guidelines", "Verification Process", "Copyright FAQ"],
      },
    ],
  },
  Gallery: {
    sections: [
      {
        title: "My Profile",
        items: ["Collected", "Created", "Favorited", "Activity", "Offers Made", "Offers Received"],
      },
      {
        title: "Settings",
        items: ["Profile Settings", "Notifications", "Wallets", "Account Security"],
      },
    ],
  },
  Community: {
    sections: [
      {
        title: "Connect",
        items: ["Twitter", "Discord", "Instagram", "Reddit", "YouTube"],
      },
      {
        title: "Events",
        items: ["Virtual Events", "Meetups", "Hackathons", "Conferences"],
      },
      {
        title: "Governance",
        items: ["DAO", "Proposals", "Voting", "Forum"],
      },
    ],
  },
};

export default function LandingPage() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const videoRef = useRef(null);
  const dropdownTimeoutRef = useRef(null);
  const { account } = useWallet();

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMouseEnter = (menu) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-white">
          <div className="mx-auto flex h-11 max-w-[980px] items-center justify-between px-4 text-xs text-[#1d1d1f]">
            <Link to="/" className="flex items-center opacity-80 hover:opacity-100 transition-opacity font-bold text-lg tracking-tight">
              Arcen NFT
            </Link>
            <div className="flex items-center gap-8">
              {Object.keys(dropdownMenus).map((menu) => (
                <Link
                  key={menu}
                  to={`/${menu.toLowerCase()}`}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                  onMouseEnter={() => handleMouseEnter(menu)}
                  onMouseLeave={handleMouseLeave}
                >
                  {menu}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <button className="opacity-80 hover:opacity-100 transition-opacity">
                <Search className="h-4 w-4" />
              </button>
              <button className="opacity-80 hover:opacity-100 transition-opacity">
                <ShoppingBag className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          className={`absolute left-0 right-0 bg-[#f5f5f7] transition-all duration-200 ease-in-out overflow-hidden ${
            activeDropdown ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
          onMouseEnter={() => {
            if (dropdownTimeoutRef.current) {
              clearTimeout(dropdownTimeoutRef.current);
            }
          }}
          onMouseLeave={handleMouseLeave}
        >
          {activeDropdown && dropdownMenus[activeDropdown]?.sections && (
            <div className="mx-auto max-w-[980px] px-8 py-12">
              <div className="grid grid-cols-3 gap-16">
                {dropdownMenus[activeDropdown].sections.map((section, idx) => (
                  <div key={idx}>
                    <h3 className="text-xs font-semibold text-[#6e6e73] mb-3">{section?.title}</h3>
                    <ul className="space-y-2.5">
                      {section?.items?.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <a
                            href="#"
                            className="text-2xl font-semibold text-[#1d1d1f] hover:text-[#0066cc] transition-colors"
                          >
                            {item}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen pt-11 snap-start snap-always">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted loop playsInline>
            <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/airpod-max-WbDUTEVA7cOgSLowVoY2R0MCH4D8NY.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="absolute right-8 top-20 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(0,0,0,0.5)] backdrop-blur-md text-white hover:bg-[rgba(0,0,0,0.7)] transition-colors"
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </button>

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-end px-8 pb-16">
          <div className="max-w-[980px] mx-auto w-full">
            <p className="text-[17px] font-semibold text-[#1d1d1f] mb-1">Arcen NFT Marketplace</p>
            <h1 className="text-[80px] font-semibold leading-[1.05] tracking-tight text-[#1d1d1f] mb-8">
              Mint, collect,<br />and trade NFTs.
            </h1>
            <div className="flex items-center gap-4">
              {account ? (
                <Link
                  to="/mint"
                  className="inline-flex items-center justify-center rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white px-5 h-11 text-[17px] font-normal transition-colors"
                >
                  Start Minting
                </Link>
              ) : (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button
                      onClick={openConnectModal}
                      className="inline-flex items-center justify-center rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white px-5 h-11 text-[17px] font-normal transition-colors cursor-pointer"
                    >
                      Connect to Mint
                    </button>
                  )}
                </ConnectButton.Custom>
              )}
              <Link
                to="/explore"
                className="inline-flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-[#1d1d1f] px-5 h-11 text-[17px] font-normal transition-colors border border-black/5"
              >
                Explore Market
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Composition Section */}
      <section className="relative h-screen flex items-center justify-center bg-[#f5f5f7] snap-start snap-always overflow-hidden">
        <img src="/digital-crown.jpg" alt="NFT Experience" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute top-0 left-0 right-0 pt-20 text-center z-10">
          <h2 className="text-5xl md:text-6xl font-semibold text-[#1d1d1f] leading-tight">
            A radically original
            <br />
            NFT experience.
          </h2>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="h-screen flex items-center justify-center bg-[#f5f5f7] snap-start snap-always px-3">
        <div className="w-full h-full max-w-[1400px] mx-auto flex gap-3 py-3">
          {/* Card 1 */}
          <div className="relative flex-1 h-full rounded-3xl overflow-hidden bg-black">
            <img src="/ape2.jpeg" alt="Create & Mint" className="absolute inset-0 w-full h-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 pb-12 px-8">
              <p className="text-[17px] text-gray-300 leading-relaxed z-10 relative">
                <span className="font-semibold text-white">Create & Mint.</span> Upload your artwork, add metadata, and seamlessly mint NFTs directly to the Sepolia testnet with zero hassle.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative flex-1 h-full rounded-3xl overflow-hidden bg-black">
            <img src="/ape4.jpeg" alt="Curate Your Gallery" className="absolute inset-0 w-full h-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 pb-12 px-8">
              <p className="text-[17px] text-gray-300 leading-relaxed z-10 relative">
                <span className="font-semibold text-white">Curate Your Gallery.</span> View all your minted NFTs in one place, manage your entire collection, and showcase your digital portfolio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Telescoping Arms Section */}
      <section className="relative h-screen flex items-center justify-center bg-[#f5f5f7] snap-start snap-always overflow-hidden">
        <img src="/telescoping-arms.png" alt="Trade Freely" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 pb-24 text-center z-10 px-8">
          <p className="text-[21px] text-white leading-relaxed max-w-3xl mx-auto z-10 relative">
            <span className="font-semibold text-white">Trade Freely.</span> List your NFTs for sale and buy from other creators in our fully decentralized marketplace designed for lightning-fast transactions.
          </p>
        </div>
      </section>

      {/* Smart Case Section */}
      <section className="relative h-screen flex items-center justify-center bg-[#f5f5f7] snap-start snap-always overflow-hidden">
        <img src="/images/image.png" alt="Secure & Reliable" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 pb-24 text-center z-10 px-8">
          <p className="text-[21px] text-[#6e6e73] leading-relaxed max-w-3xl mx-auto z-10 relative">
            <span className="font-semibold text-[#1d1d1f]">Secure & Reliable.</span> Built on robust smart contracts, ensuring your digital assets and transactions remain secure at all times.
          </p>
        </div>
      </section>
    </div>
  );
}

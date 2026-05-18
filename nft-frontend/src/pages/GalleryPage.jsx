import { useState, useEffect, useCallback } from "react";
import { useWallet } from "../context/WalletContext";
import { resolveIpfsUrl } from "../utils/pinataService";
import NFTCard from "../components/NFTCard";

export default function GalleryPage() {
  const { account, contract } = useWallet();
  const [ownedNfts, setOwnedNfts] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchNFTs = useCallback(async () => {
    if (!account || !contract) return;

    try {
      setLoading(true);
      setError("");

      const tokenIds = await contract.tokensOfOwner(account);

      const owned = await Promise.all(
        tokenIds.map(async (id) => {
          try {
            const tokenURI = await contract.tokenURI(id);
            const metadataUrl = resolveIpfsUrl(tokenURI);
            const res = await fetch(metadataUrl);
            const metadata = await res.json();

            return {
              tokenId: id.toString(),
              name: metadata.name,
              description: metadata.description,
              image: resolveIpfsUrl(metadata.image),
              attributes: metadata.attributes,
              contractAddress: contract.target,
              owner: account,
              isListed: false,
            };
          } catch (err) {
            console.error(`Failed to fetch metadata for token ${id}`, err);
            return null;
          }
        })
      );
      setOwnedNfts(owned.filter(nft => nft !== null));

      const listedIds = await contract.getListedNFTs();
      const myListedIds = [];

      for (const id of listedIds) {
        try {
          const listing = await contract.listings(id);
          if (listing.seller.toLowerCase() === account.toLowerCase()) {
            myListedIds.push(id);
          }
        } catch { /* skip */ }
      }

      const listings = await Promise.all(
        myListedIds.map(async (id) => {
          try {
            const [tokenURI, price] = await Promise.all([
              contract.tokenURI(id),
              contract.getListingPrice(id),
            ]);

            const metadataUrl = resolveIpfsUrl(tokenURI);
            const res = await fetch(metadataUrl);
            const metadata = await res.json();

            return {
              tokenId: id.toString(),
              name: metadata.name,
              description: metadata.description,
              image: resolveIpfsUrl(metadata.image),
              attributes: metadata.attributes,
              contractAddress: contract.target,
              price,
              isListed: true,
              seller: account,
            };
          } catch (err) {
            console.error(`Failed to fetch listing ${id}`, err);
            return null;
          }
        })
      );
      setMyListings(listings.filter(nft => nft !== null));
    } catch (err) {
      console.error(err);
      setError("Failed to fetch your NFTs");
    } finally {
      setLoading(false);
    }
  }, [account, contract]);

  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  if (!account) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] pt-11 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#1d1d1f]">Please connect your wallet to view your NFTs</h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] pt-11 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[rgba(0,113,227,0.3)] border-t-[#0071e3] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#6e6e73]">Loading your NFTs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-11">
      <div className="max-w-[980px] mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] leading-tight">My NFT Gallery</h1>
          <p className="text-base text-[#6e6e73] mt-2">Manage your NFTs — list them for sale or cancel existing listings.</p>
        </div>

        {error && (
          <div className="text-sm text-[#ef4444] bg-[rgba(239,68,68,0.1)] border border-[#ef4444] rounded-xl px-4 py-3 text-center mb-6">{error}</div>
        )}

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#1d1d1f] pb-3 border-b border-[#e5e5e5] mb-6">Your NFTs</h2>
          {ownedNfts.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-[#1d1d1f]">You don't own any unlisted NFTs.</h3>
              <p className="text-sm text-[#6e6e73] mt-1">Mint one on the Mint page, or check your active listings below.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ownedNfts.map(nft => (
                <NFTCard
                  key={nft.tokenId}
                  nft={nft}
                  account={account}
                  contract={contract}
                  onUpdate={fetchNFTs}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1d1d1f] pb-3 border-b border-[#e5e5e5] mb-6">Your Listings</h2>
          {myListings.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-[#1d1d1f]">No active listings.</h3>
              <p className="text-sm text-[#6e6e73] mt-1">List one of your NFTs for sale to appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myListings.map(nft => (
                <NFTCard
                  key={nft.tokenId}
                  nft={nft}
                  account={account}
                  contract={contract}
                  onUpdate={fetchNFTs}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

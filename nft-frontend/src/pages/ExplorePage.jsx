import { useState, useEffect, useCallback } from "react";
import { useWallet } from "../context/WalletContext";
import { resolveIpfsUrl } from "../utils/pinataService";
import NFTCard from "../components/NFTCard";

export default function ExplorePage() {
  const { account, contract } = useWallet();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchListedNFTs = useCallback(async () => {
    if (!contract) return;

    try {
      setLoading(true);
      setError("");

      const listedIds = await contract.getListedNFTs();

      if (listedIds.length === 0) {
        setNfts([]);
        return;
      }

      const batchSize = 10;
      const results = [];

      for (let start = 0; start < listedIds.length; start += batchSize) {
        const end = Math.min(start + batchSize, listedIds.length);
        const batch = [];

        for (let i = start; i < end; i++) {
          const id = listedIds[i];
          batch.push(
            (async () => {
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
                };
              } catch (err) {
                console.error(`Failed to fetch metadata for token ${id}`, err);
                return null;
              }
            })()
          );
        }

        const batchResults = await Promise.all(batch);
        results.push(...batchResults);
      }

      setNfts(results.filter(nft => nft !== null));
    } catch (err) {
      console.error(err);
      setError("Failed to fetch explore page NFTs");
    } finally {
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    fetchListedNFTs();
  }, [fetchListedNFTs]);

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-11">
      <div className="max-w-[980px] mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] leading-tight">Explore NFTs</h1>
          <p className="text-base text-[#6e6e73] mt-2">Browse and buy NFTs listed for sale on the marketplace.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-10 h-10 border-3 border-[rgba(0,113,227,0.3)] border-t-[#0071e3] rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-[#6e6e73]">Loading listed NFTs...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-sm text-[#ef4444] bg-[rgba(239,68,68,0.1)] border border-[#ef4444] rounded-xl px-4 py-3 text-center">{error}</div>
        ) : nfts.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-lg font-medium text-[#1d1d1f]">No NFTs listed for sale yet.</h3>
            <p className="text-sm text-[#6e6e73] mt-1">Mint one and list it on the marketplace!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {nfts.map(nft => (
              <NFTCard
                key={nft.tokenId}
                nft={nft}
                account={account}
                contract={contract}
                onUpdate={fetchListedNFTs}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

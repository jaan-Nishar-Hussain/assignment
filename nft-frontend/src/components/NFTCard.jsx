import { useState } from "react";
import { ethers } from "ethers";
import { resolveIpfsUrl } from "../utils/pinataService";

export default function NFTCard({ nft, account, contract, onUpdate }) {
  const [listPrice, setListPrice] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [imgSrc, setImgSrc] = useState(() => nft.image || "");
  const [imgFailed, setImgFailed] = useState(false);

  const name = nft.name || `NFT #${nft.tokenId}`;
  const description = nft.description || "";
  const attributes = Array.isArray(nft.attributes) ? nft.attributes : [];
  const isOwner = account && nft.owner && nft.owner.toLowerCase() === account.toLowerCase();
  const isSeller = account && nft.seller && nft.seller.toLowerCase() === account.toLowerCase();

  const handleImageError = () => {
    if (imgFailed) return;
    const nextIdx = 1;
    const fallback = resolveIpfsUrl(nft.image, nextIdx);
    if (fallback !== imgSrc) {
      setImgSrc(fallback);
      setImgFailed(true);
    }
  };

  const reset = () => {
    setListPrice("");
    setActionError("");
  };

  const handleList = async () => {
    if (!listPrice || isNaN(listPrice) || Number(listPrice) <= 0) {
      setActionError("Enter a valid price");
      return;
    }
    try {
      setActionLoading(true);
      setActionError("");
      const priceWei = ethers.parseEther(listPrice);
      const tx = await contract.listNFT(nft.tokenId, priceWei);
      await tx.wait();
      reset();
      if (onUpdate) onUpdate();
    } catch (err) {
      setActionError(err.message || "Failed to list NFT");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuy = async () => {
    try {
      setActionLoading(true);
      setActionError("");
      const tx = await contract.buyNFT(nft.tokenId, { value: nft.price });
      await tx.wait();
      if (onUpdate) onUpdate();
    } catch (err) {
      setActionError(err.message || "Failed to buy NFT");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setActionLoading(true);
      setActionError("");
      const tx = await contract.cancelListing(nft.tokenId);
      await tx.wait();
      reset();
      if (onUpdate) onUpdate();
    } catch (err) {
      setActionError(err.message || "Failed to cancel listing");
    } finally {
      setActionLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return null;
    return `${ethers.formatEther(price)} ETH`;
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-[#e5e5e5] transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <div className="w-full aspect-square overflow-hidden bg-[#f5f5f7]">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={name}
            onError={handleImageError}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#6e6e73] text-sm">No Image</div>
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-[#1d1d1f] truncate">{name}</h3>
          <span className="text-xs font-mono text-[#6e6e73] bg-[#f5f5f7] px-2 py-0.5 rounded">#{nft.tokenId}</span>
        </div>
        {description && <p className="text-sm text-[#6e6e73] mb-3 line-clamp-2">{description}</p>}

        {nft.price && (
          <div className="bg-[rgba(16,185,129,0.1)] border border-[#10b981] text-[#10b981] px-3 py-1.5 rounded-lg text-sm font-semibold mb-3 text-center">
            Price: {formatPrice(nft.price)}
          </div>
        )}

        {attributes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {attributes.map((attr, index) => (
              <div key={index} className="bg-[#f5f5f7] border border-[#e5e5e5] rounded-lg px-2 py-1 text-xs">
                <span className="text-[#6e6e73] uppercase text-[10px] block">{attr.trait_type || "trait"}</span>
                <span className="text-[#1d1d1f] font-medium">{attr.value || ""}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mb-3">
          {isOwner && !nft.isListed && (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Price in ETH"
                value={listPrice}
                onChange={(e) => setListPrice(e.target.value)}
                disabled={actionLoading}
                className="w-full bg-[#f5f5f7] border border-[#e5e5e5] text-[#1d1d1f] px-3 py-2 rounded-lg text-sm outline-none focus:border-[#0071e3] transition-colors"
              />
              <button
                onClick={handleList}
                disabled={actionLoading}
                className="w-full bg-[#0071e3] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#0077ed] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading ? "Listing..." : "List for Sale"}
              </button>
            </div>
          )}

          {nft.isListed && !isSeller && account && (
            <button
              onClick={handleBuy}
              disabled={actionLoading}
              className="w-full bg-[#0071e3] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#0077ed] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {actionLoading ? "Buying..." : `Buy for ${formatPrice(nft.price)}`}
            </button>
          )}

          {nft.isListed && isSeller && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="w-full bg-transparent text-[#0071e3] border border-[#0071e3] px-4 py-2 rounded-full text-sm font-medium hover:bg-[rgba(0,113,227,0.05)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {actionLoading ? "Canceling..." : "Cancel Listing"}
            </button>
          )}

          {!account && nft.isListed && (
            <p className="text-xs text-[#6e6e73] text-center">Connect wallet to buy</p>
          )}
        </div>

        {actionError && (
          <p className="text-xs text-[#ef4444] bg-[rgba(239,68,68,0.1)] px-3 py-1.5 rounded-lg mb-2">{actionError}</p>
        )}

        <div className="border-t border-[#e5e5e5] pt-3 text-center">
          <a
            href={`https://sepolia.etherscan.io/token/${nft.contractAddress}?a=${nft.tokenId}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#0071e3] hover:underline"
          >
            View on Etherscan
          </a>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { uploadImageToPinata, uploadMetadataToPinata } from "../utils/pinataService";

export default function MintButton({ imageFile, metadata, onMintSuccess }) {
  const { account, contract } = useWallet();
  const [status, setStatus] = useState("idle");
  const [txHash, setTxHash] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [tokenId, setTokenId] = useState("");

  const isBusy = status === "uploading" || status === "minting";

  const resetForm = () => {
    setStatus("idle");
    setTxHash("");
    setErrorMessage("");
    setTokenId("");
  };

  const handleMint = async () => {
    if (status === "success") {
      resetForm();
      return;
    }

    if (!account || !contract) {
      setErrorMessage("Please connect wallet first");
      return;
    }
    if (!imageFile || !metadata.name) {
      setErrorMessage("Please provide an image and a name");
      return;
    }

    try {
      setStatus("uploading");
      setErrorMessage("");

      const imageHash = await uploadImageToPinata(imageFile);
      const imageUrl = `ipfs://${imageHash}`;

      const finalMetadata = {
        name: metadata.name,
        description: metadata.description,
        image: imageUrl,
        attributes: metadata.attributes.filter(a => a.trait_type && a.value),
      };

      const metadataHash = await uploadMetadataToPinata(finalMetadata);
      const tokenURI = `ipfs://${metadataHash}`;

      setStatus("minting");
      const mintPrice = await contract.mintPrice();

      const tx = await contract.mintNFT(tokenURI, { value: mintPrice });
      setTxHash(tx.hash);

      const receipt = await tx.wait();

      const transferEvent = receipt.logs.find(log => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed && parsed.name === "Transfer";
        } catch {
          return false;
        }
      });

      if (transferEvent) {
        const parsedLog = contract.interface.parseLog(transferEvent);
        const tid = parsedLog.args.tokenId.toString();
        setTokenId(tid);
      }

      setStatus("success");
      if (onMintSuccess) onMintSuccess();
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMessage(err.message || "Minting failed");
    }
  };

  return (
    <div>
      <button
        onClick={handleMint}
        disabled={isBusy}
        className={`w-full px-6 py-3 rounded-full text-sm font-medium transition-colors ${
          isBusy
            ? "bg-[#d2d2d7] text-[#6e6e73] cursor-not-allowed"
            : "bg-[#0071e3] text-white hover:bg-[#0077ed]"
        }`}
      >
        {status === "idle" && "Mint NFT"}
        {status === "uploading" && "Uploading to IPFS..."}
        {status === "minting" && "Confirming Transaction..."}
        {status === "success" && "Mint Another NFT"}
        {status === "error" && "Try Again"}
      </button>

      {status === "minting" && txHash && (
        <p className="mt-3 text-sm text-[#6e6e73] text-center">
          Transaction pending:{" "}
          <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer" className="text-[#0071e3] hover:underline">
            View on Etherscan
          </a>
        </p>
      )}

      {status === "success" && (
        <div className="mt-3 bg-[rgba(16,185,129,0.1)] border border-[#10b981] rounded-xl px-4 py-3 text-center">
          <p className="text-sm font-medium text-[#10b981]">Successfully minted NFT! Token ID: #{tokenId}</p>
          <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer" className="text-xs text-[#0071e3] hover:underline">
            View Transaction
          </a>
        </div>
      )}

      {status === "error" && (
        <p className="mt-3 text-sm text-[#ef4444] bg-[rgba(239,68,68,0.1)] border border-[#ef4444] rounded-xl px-4 py-3 text-center">{errorMessage}</p>
      )}
    </div>
  );
}

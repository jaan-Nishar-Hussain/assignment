import { useState, useCallback } from "react";
import ImageUpload from "../components/ImageUpload";
import MetadataForm from "../components/MetadataForm";
import MintButton from "../components/MintButton";

export default function MintPage() {
  const [imageFile, setImageFile] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [metadata, setMetadata] = useState({
    name: "",
    description: "",
    attributes: []
  });

  const handleMetadataChange = (data, attributes) => {
    setMetadata({ ...data, attributes });
  };

  const handleMintSuccess = useCallback(() => {
    setImageFile(null);
    setMetadata({ name: "", description: "", attributes: [] });
    setFormKey(k => k + 1);
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f7] pt-11">
      <div className="max-w-[980px] mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] leading-tight">Mint Your NFT</h1>
          <p className="text-base text-[#6e6e73] mt-2">Upload your art, add details, and mint on the Sepolia testnet.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-3xl border border-[#e5e5e5] p-6 md:p-8">
          <div>
            <ImageUpload key={`img-${formKey}`} onImageUpload={setImageFile} />
          </div>

          <div className="flex flex-col gap-6">
            <MetadataForm key={`meta-${formKey}`} onMetadataChange={handleMetadataChange} />
            <div className="border-t border-[#e5e5e5] pt-6">
              <MintButton
                imageFile={imageFile}
                metadata={metadata}
                onMintSuccess={handleMintSuccess}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

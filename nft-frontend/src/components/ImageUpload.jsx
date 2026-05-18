import { useState, useRef } from "react";
import { UploadCloud } from "lucide-react";

export default function ImageUpload({ onImageUpload }) {
  const [preview, setPreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const processFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(url);
    onImageUpload(file);
  };

  const handleFileChange = (e) => {
    processFile(e.target.files[0]);
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    processFile(e.dataTransfer.files[0]);
  };

  return (
    <div
      className={`w-full aspect-square border-2 border-dashed rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer ${
        isDragOver ? "border-[#0071e3] bg-[rgba(0,113,227,0.05)]" : "border-[#d2d2d7] hover:border-[#0071e3]"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      {preview ? (
        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-[#6e6e73] gap-3">
          <UploadCloud size={48} className="text-[#6e6e73]" />
          <p className="text-sm font-medium">Drag & drop or click to upload</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}

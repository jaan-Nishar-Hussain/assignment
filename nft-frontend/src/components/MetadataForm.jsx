import { useState } from "react";

export default function MetadataForm({ onMetadataChange }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [attributes, setAttributes] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    onMetadataChange(newFormData, attributes);
  };

  const handleAttributeChange = (index, field, value) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
    onMetadataChange(formData, newAttributes);
  };

  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: "", value: "" }]);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[#1d1d1f]">NFT Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. My Awesome NFT"
          className="bg-[#f5f5f7] border border-[#d2d2d7] text-[#1d1d1f] px-3 py-2.5 rounded-lg text-sm outline-none focus:border-[#0071e3] transition-colors"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-[#1d1d1f]">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your NFT..."
          className="bg-[#f5f5f7] border border-[#d2d2d7] text-[#1d1d1f] px-3 py-2.5 rounded-lg text-sm outline-none focus:border-[#0071e3] transition-colors min-h-[100px] resize-y"
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[#1d1d1f] mb-3">Attributes (Optional)</h3>
        {attributes.map((attr, index) => (
          <div key={index} className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              placeholder="Trait Type (e.g. Color)"
              value={attr.trait_type}
              onChange={(e) => handleAttributeChange(index, "trait_type", e.target.value)}
              className="bg-[#f5f5f7] border border-[#d2d2d7] text-[#1d1d1f] px-3 py-2.5 rounded-lg text-sm outline-none focus:border-[#0071e3] transition-colors"
            />
            <input
              type="text"
              placeholder="Value (e.g. Blue)"
              value={attr.value}
              onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
              className="bg-[#f5f5f7] border border-[#d2d2d7] text-[#1d1d1f] px-3 py-2.5 rounded-lg text-sm outline-none focus:border-[#0071e3] transition-colors"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addAttribute}
          className="text-sm text-[#0071e3] font-medium bg-transparent border border-[#0071e3] px-4 py-2 rounded-full hover:bg-[rgba(0,113,227,0.05)] transition-colors"
        >
          Add Attribute
        </button>
      </div>
    </div>
  );
}

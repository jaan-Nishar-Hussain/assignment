import axios from "axios";

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET;

const pinataAxios = axios.create({
  baseURL: "https://api.pinata.cloud",
  headers: {
    pinata_api_key: PINATA_API_KEY,
    pinata_secret_api_key: PINATA_SECRET_KEY,
  },
});

export const uploadImageToPinata = async (file) => {
  if (!file) throw new Error("No file provided");

  const formData = new FormData();
  formData.append("file", file);

  const res = await pinataAxios.post("/pinning/pinFileToIPFS", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  
  return res.data.IpfsHash;
};

export const uploadMetadataToPinata = async (metadata) => {
  if (!metadata) throw new Error("No metadata provided");

  const res = await pinataAxios.post("/pinning/pinJSONToIPFS", metadata, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  return res.data.IpfsHash;
};

const GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://dweb.link/ipfs/",
];

const cachedRedirects = new Map();

export const resolveIpfsUrl = (ipfsUrl, gatewayIndex = 0) => {
  if (!ipfsUrl) return "";
  const cid = ipfsUrl.replace("ipfs://", "").replace("ipfs/", "");
  const cacheKey = `${cid}-${gatewayIndex}`;
  const cached = cachedRedirects.get(cacheKey);
  if (cached) return cached;
  const resolved = GATEWAYS[gatewayIndex] + cid;
  cachedRedirects.set(cacheKey, resolved);
  return resolved;
};

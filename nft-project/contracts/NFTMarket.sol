// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NFTMarket is ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 private _tokenIds;
    uint256 public mintPrice;
    uint256 public maxSupply;

    struct Listing {
        uint256 price;
        address seller;
        bool isActive;
    }

    mapping(uint256 => Listing) public listings;
    uint256[] private _listedTokenIds;
    mapping(uint256 => uint256) private _listedIndexes;

    event NFTListed(uint256 indexed tokenId, uint256 price, address indexed seller);
    event NFTSold(uint256 indexed tokenId, uint256 price, address indexed seller, address indexed buyer);
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);

    constructor(uint256 _mintPrice, uint256 _maxSupply) ERC721("NFTMarket", "NFM") Ownable(msg.sender) {
        mintPrice = _mintPrice;
        maxSupply = _maxSupply;
    }

    function mintNFT(string memory tokenURI) public payable returns (uint256) {
        require(msg.value >= mintPrice, "Not enough ETH sent");
        require(_tokenIds < maxSupply, "Max supply reached");

        _tokenIds++;
        uint256 newItemId = _tokenIds;

        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    function listNFT(uint256 tokenId, uint256 price) public {
        require(!listings[tokenId].isActive, "Already listed");
        require(_ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be greater than 0");

        _transfer(msg.sender, address(this), tokenId);

        listings[tokenId] = Listing(price, msg.sender, true);
        _listedIndexes[tokenId] = _listedTokenIds.length;
        _listedTokenIds.push(tokenId);

        emit NFTListed(tokenId, price, msg.sender);
    }

    function buyNFT(uint256 tokenId) public payable nonReentrant {
        Listing memory listing = listings[tokenId];
        require(listing.isActive, "Not listed for sale");
        require(msg.value >= listing.price, "Insufficient funds sent");
        require(msg.sender != listing.seller, "Seller cannot buy own NFT");

        _removeListing(tokenId);

        _update(msg.sender, tokenId, address(0));

        (bool sellerSuccess, ) = payable(listing.seller).call{value: listing.price}("");
        require(sellerSuccess, "Payment to seller failed");

        if (msg.value > listing.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - listing.price}("");
            require(refundSuccess, "Refund failed");
        }

        emit NFTSold(tokenId, listing.price, listing.seller, msg.sender);
    }

    function cancelListing(uint256 tokenId) public {
        Listing memory listing = listings[tokenId];
        require(listing.isActive, "Not listed");
        require(listing.seller == msg.sender, "Not the seller");

        _removeListing(tokenId);

        _update(msg.sender, tokenId, address(0));

        emit ListingCancelled(tokenId, msg.sender);
    }

    function getListedNFTs() public view returns (uint256[] memory) {
        return _listedTokenIds;
    }

    function getListingPrice(uint256 tokenId) public view returns (uint256) {
        return listings[tokenId].price;
    }

    function isListed(uint256 tokenId) public view returns (bool) {
        return listings[tokenId].isActive;
    }

    function getListedCount() public view returns (uint256) {
        return _listedTokenIds.length;
    }

    function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        uint256 ownerTokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        uint256 currentIndex;

        for (uint256 i = 1; i <= _tokenIds; i++) {
            if (_ownerOf(i) == owner && !listings[i].isActive) {
                tokenIds[currentIndex] = i;
                currentIndex++;
            }
        }

        assembly {
            mstore(tokenIds, currentIndex)
        }
        return tokenIds;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds;
    }

    function setMintPrice(uint256 _mintPrice) public onlyOwner {
        mintPrice = _mintPrice;
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }

    function _removeListing(uint256 tokenId) private {
        uint256 index = _listedIndexes[tokenId];
        uint256 lastIndex = _listedTokenIds.length - 1;

        if (index != lastIndex) {
            uint256 lastTokenId = _listedTokenIds[lastIndex];
            _listedTokenIds[index] = lastTokenId;
            _listedIndexes[lastTokenId] = index;
        }

        _listedTokenIds.pop();
        delete _listedIndexes[tokenId];
        delete listings[tokenId];
    }
}

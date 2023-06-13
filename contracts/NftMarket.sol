// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// tokenId => tokenURI
// tokenId => Owner
contract NftMarket is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    constructor() ERC721("NftMarket", "NFT") {}

    Counters.Counter private _listedItemsCount;
    Counters.Counter private _tokenIdsCount;

    // used to store all nft tokenId
    uint[] private _allTokenIds;
    // price to list a nft on market
    uint private _listingPrice = 0.02 ether;
    mapping(string => bool) private _exsitedTokenURIs;
    // tokenId => Nft
    mapping(uint => Nft) private _idToNft;

    mapping(address => uint[]) private _ownerToTokenIds;
    mapping(uint => uint) private _idToOwnedTokenIndex;

    struct Nft {
        uint tokenId;
        uint price;
        address creator;
        bool isListed;
    }

    function setListingPrice(uint newPrice) external onlyOwner {
        require(newPrice > 0, "Price should at least be 1 wei");
        _listingPrice = newPrice;
    }

    // mint a nft
    function mintToken(string memory tokenURI, uint price) public payable {
        require(!_exsitedTokenURIs[tokenURI], "the URI has been minted!");
        require(msg.value == _listingPrice, "listing price is mismatched");

        _listedItemsCount.increment();
        _tokenIdsCount.increment();

        uint tokenId = _tokenIdsCount.current();

        // this will set `_owners[tokenId] = to`; a tokenId => owners mapping
        _safeMint(msg.sender, tokenId);
        // this will set `_tokenURIs[tokenId] = _tokenURI`; a tokenId => tokenURI mapping
        _setTokenURI(tokenId, tokenURI);
        _createNft(tokenId, price);
        _exsitedTokenURIs[tokenURI] = true;
    }

    function getNft(uint tokenId) public view returns (Nft memory) {
        return _idToNft[tokenId];
    }

    function listedItemsCount() public view returns (uint) {
        return _listedItemsCount.current();
    }

    function buyNft(uint tokenId) public payable {
        Nft storage nft = _idToNft[tokenId];
        uint price = nft.price;
        address owner = ownerOf(tokenId);

        require(price == msg.value, "price is invalid");
        require(owner != msg.sender, "you have already owned the nft");

        nft.isListed = false;
        _listedItemsCount.decrement();

        //  this will set `_balances[from] -= 1; _balances[to] += 1; _owners[tokenId] = to;`
        _transfer(owner, msg.sender, tokenId);
        payable(owner).transfer(msg.value);
    }

    // get all nfts whose `isListed` property is false
    function getAllNftsOnSale() public view returns (Nft[] memory) {
        Nft[] memory results = new Nft[](_listedItemsCount.current());
        uint currentIndex = 0;

        for (uint i = 0; i < _allTokenIds.length; i++) {
            uint tokenId = _allTokenIds[i];
            Nft storage nft = _idToNft[tokenId];

            if (nft.isListed) {
                results[currentIndex] = nft;
                currentIndex++;
            }
        }

        return results;
    }

    // get all nfts owned by user
    function getNftsByOwner() public view returns (Nft[] memory) {
        uint count = balanceOf(msg.sender);
        uint[] storage tokenIds = _ownerToTokenIds[msg.sender];
        Nft[] memory results = new Nft[](count);

        for (uint i = 0; i < count; i++) {
            Nft storage nft = _idToNft[tokenIds[i]];
            results[i] = nft;
        }
        return results;
    }

    // place a unlisted nft, and reset the price
    function placeNftOnSale(uint tokenId, uint newPrice) public payable {
        Nft storage nft = _idToNft[tokenId];

        require(ownerOf(tokenId) == msg.sender, "You are not the owner of nft");
        require(msg.value == _listingPrice, "listing price is mismatched");
        require(!nft.isListed, "the nft is already on sale");
        require(newPrice > 0, "Price should at least be 1 wei");

        _listedItemsCount.increment();
        nft.isListed = true;
        nft.price = newPrice;
    }

    function _createNft(uint tokenId, uint price) private {
        require(price > 0, "price must be at least 1 wei ");

        _idToNft[tokenId] = Nft(tokenId, price, msg.sender, true);
    }

    function _setTokenIds(uint tokenId) private {
        _allTokenIds.push(tokenId);
    }

    function _addOwnedTokenId(address to, uint tokenId) private {
        uint length = balanceOf(to);

        _ownerToTokenIds[to].push(tokenId);
        _idToOwnedTokenIndex[tokenId] = length;
    }

    function removeOwnedTokenId(address from, uint tokenId) private {
        uint lastIndex = balanceOf(from) - 1;
        uint tokenIndex = _idToOwnedTokenIndex[tokenId];
        uint lastTokenId = _ownerToTokenIds[from][lastIndex];

        if (lastIndex != tokenIndex) {
            _ownerToTokenIds[from][tokenIndex] = lastTokenId;
            // new index 
            _idToOwnedTokenIndex[lastTokenId] = tokenIndex;
        }

        _ownerToTokenIds[from].pop();
        delete _idToOwnedTokenIndex[tokenId];
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint firstTokenId,
        uint batchSize
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);

        // first mint a token
        if (from == address(0)) {
            _setTokenIds(firstTokenId);
        } else if (from != to) {
            removeOwnedTokenId(from, firstTokenId);
        }

        if (from != to) {
            _addOwnedTokenId(to, firstTokenId);
        }
    }
}

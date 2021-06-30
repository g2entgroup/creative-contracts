pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

//import "hardhat/console.sol";
//import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
//learn more: https://docs.openzeppelin.com/contracts/3.x/erc721

// GET LISTED ON OPENSEA: https://testnets.opensea.io/get-listed/step-two

contract CreativeNFT is ERC721URIStorage, Ownable {

   string baseURI;

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  // function setBaseURI(string memory baseURI_) external {
  //       baseURI = baseURI_;
  //   }

  //   function _baseURI() internal view override returns (string memory) {
  //       return baseURI;
  //   }

  constructor() public ERC721("Creative NFT", "CNFT") {
    // setBaseURI("https://ipfs.io/ipfs/");
  }

  function mintItem( 
    address account,
    string memory tokenURI
    )
      public
      onlyOwner
      returns (uint256)
  {
      _tokenIds.increment();

      uint256 id = _tokenIds.current();
      _mint(account, id);
      _setTokenURI(id, tokenURI);

      return id;
  }
}
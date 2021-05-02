// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Pool} from "./Pool.sol";

struct userVerification{
        bytes32 requestId;
        bool verified;
        string twitterHandle;
    }

contract PoolFactory is Ownable{
    bool allowPoolCreation;
    address[] poolList;
    address TWITTER_VERIFY_ADDRESS;
    iTwitterVerify twitterVerify;
    iRNG rng;
    linkToken link;
    address LINK_CONTRACT_ADDRESS;
    modifier okayToCreatePool(){
        require(allowPoolCreation, "Pool creation is currently not allowed!");
        _;
    }
    
    constructor(address _twitterVerifyAddress, address linkTokenAddress, address rngAddress){
        TWITTER_VERIFY_ADDRESS = _twitterVerifyAddress;
        twitterVerify = iTwitterVerify(TWITTER_VERIFY_ADDRESS);
        rng = iRNG(rngAddress);
        LINK_CONTRACT_ADDRESS = linkTokenAddress;
        link = linkToken(LINK_CONTRACT_ADDRESS);
    }
    
    
    function setTwitterVerifyAddress(address _address) external onlyOwner{
        TWITTER_VERIFY_ADDRESS = _address;
        twitterVerify = iTwitterVerify(TWITTER_VERIFY_ADDRESS);
    }
    function changePoolCreationBool( bool _bool) external onlyOwner{
        allowPoolCreation = _bool;
    }

    function getPoolAddress( uint _index) external view returns(address) {
        return poolList[_index];
    }
    
    function createPool(
    string memory _poolName, 
    uint _capital, 
    address _capitalAddress, 
    address _nftAddress, 
    uint _campaignLength, 
    uint _votingLength, 
    uint _decisionLength, 
    uint _submissionLength)
    external{
        require(allowPoolCreation, "Pool creation is currently not allowed!");
        require(twitterVerify.getVerification(msg.sender), "Caller address is not verified with Twitter!");
        require(link.transferFrom(msg.sender, address(rng), 1*(10**17)), "Link transferFrom failed!");
        Pool pool = new Pool(_poolName, twitterVerify.getTwitterHandle(msg.sender), _capital, _capitalAddress, _nftAddress, msg.sender, address(rng), _campaignLength, _votingLength, _decisionLength, _submissionLength);
        poolList.push(address(pool));
        rng.addToWhitelist(address(pool));
    }
}

interface iTwitterVerify{

    function getVerification(address _user) external returns(bool); //TODO why does this need memory?
    function getTwitterHandle(address _address) external returns(string memory);
}

interface linkToken{
        function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

interface iRNG {
    function addToWhitelist(address _address) external;
}
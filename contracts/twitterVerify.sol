// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.6/vendor/Ownable.sol";


contract twitterverify is ChainlinkClient, Ownable {
    address private oracle;
    uint256 private fee;
    bytes32 private verifyUserJobId;
    
    struct userVerification{
        bytes32 requestId;
        bool verified;
        string twitterHandle;
    }
    
    mapping(address => userVerification) public verificationMap;
    // add event for when user verifies successfully
    event verificationSuccess(bytes32 requestId, string twitterHandle);
    // add event for when a verification fails
    event verificationFailed(bytes32 requestId);
    
    
    address public LINK_CONTRACT_ADDRESS = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;
    linkToken link = linkToken(LINK_CONTRACT_ADDRESS);
    
    constructor() public {
        //setPublicChainlinkToken();
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        oracle = 0x0e70fe151Fa8A1477D4E2a42028DB8a231D2C827; // oracle address
        verifyUserJobId = "9ddae3a5bd6547d590eb5ccaeab1429e"; //job id
        fee = 1 * 10 ** 17; // 0.1 LINK

    }
    
    function setJobId( bytes32 _jobId ) external onlyOwner {
        verifyUserJobId = _jobId;
    }

    function createTestUser( address _address ) external onlyOwner {
        userVerification memory testUser = userVerification({
            requestId: 0,
            verified: true,
            twitterHandle: "***TEST_USER***"
        });
        verificationMap[_address] = testUser;
    }

    function verifyUser(string memory _userHandle) public returns(bytes32) {
        require(link.transferFrom(msg.sender, address(this), fee), 'transferFrom failed');
        verificationMap[msg.sender].verified = false;
        verificationMap[msg.sender].twitterHandle = _userHandle;
        Chainlink.Request memory req = buildChainlinkRequest(verifyUserJobId, address(this), this.fulfill_verify.selector);
        req.add("handle", _userHandle);
        verificationMap[msg.sender].requestId = sendChainlinkRequestTo(oracle, req, fee);
        return verificationMap[msg.sender].requestId;
    }

    //callback function for verification
    function fulfill_verify(bytes32 _requestId, uint256 _address) public recordChainlinkFulfillment(_requestId) {
        address user = address(_address);
        if ( user == address(0) ){
            emit verificationFailed(_requestId);
            revert("Address must be non zero.");
        }
        if ( verificationMap[user].requestId == _requestId ){
            verificationMap[user].verified = true;
            emit verificationSuccess(_requestId, verificationMap[user].twitterHandle);
        }
    }
    function getVerification(address _address) external returns(bool){
        return verificationMap[_address].verified;
    }

    function getTwitterHandle(address _address) external returns(string memory){
        return verificationMap[_address].twitterHandle;
    }
}

interface linkToken{
        function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    }

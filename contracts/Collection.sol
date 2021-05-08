// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Collection is Ownable,ERC721URIStorage {
    // using Counters for Counters.Counter;

    // Counters.Counter private _tokenIdTracker;

    string public baseURI;

    uint public currentTokenID;

    /// @notice The EIP-712 typehash for the contract's domain
    bytes32 public constant DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    /// @notice The EIP-712 typehash for the contract's permit
    bytes32 public constant PERMIT_TYPEHASH = keccak256("Permit(address holder,address spender,uint256 nonce,uint256 expiry,bool allowed)");

    /// @notice A record of states for signing / validating signatures
    mapping (address => uint) public nonces;

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseUri,
        address _owner
    ) public ERC721(_name, _symbol) {
        _changeBaseURI(_baseUri);
        transferOwnership(_owner);
        currentTokenID = 0;
    }

    /** ===================== external mutative function ===================== */

    function mint(address to) external {
        _singlemint(to);
    }

    function batchmint(address to, uint amount) external {
        _batchmint(to,amount);
    }

    function changeBaseURI(string memory baseURI_) external onlyOwner {
        _changeBaseURI(baseURI_);
    }

    /*
     * @notice Triggers an approval from owner to spends
     * @param holder The address to approve from
     * @param spender The address to be approved
     * @param _tokenId the tokenId which you want to approve
     * @param nonce The contract state required to match the signature
     * @param expiry The time at which to expire the signature
     * @param v The recovery byte of the signature
     * @param r Half of the ECDSA signature pair
     * @param s Half of the ECDSA signature pair
     */
    function singlepermit(address holder, address spender, uint256 nonce, uint256 expiry, uint _tokenId,
                    bool allowed, uint8 v, bytes32 r, bytes32 s) external
    {
        string memory name = name();
        bytes32 DOMAIN_SEPARATOR = keccak256(abi.encode(DOMAIN_TYPEHASH,keccak256(bytes(name)),getChainId(),address(this)));
        bytes32 STRUCTHASH = keccak256(abi.encode(PERMIT_TYPEHASH,holder,spender,nonce,expiry,allowed));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01",DOMAIN_SEPARATOR,STRUCTHASH));

        require(holder != address(0), "invalid-address-0");
        require(holder == ecrecover(digest, v, r, s), "invalid-permit");
        require(expiry == 0 || block.timestamp <= expiry, "permit-expired");
        require(nonce == nonces[holder]++, "invalid-nonce");
        uint tokenId = allowed ? _tokenId : 0;
        _approve(spender, tokenId);
        emit approvalwithpermit(holder, spender, tokenId);
    }

    /*
     * @notice Triggers an approval from owner to spends
     * @param holder The address to approve from
     * @param spender The address to be approved
     * @param approved appove all of the token you have 
     * @param nonce The contract state required to match the signature
     * @param expiry The time at which to expire the signature
     * @param v The recovery byte of the signature
     * @param r Half of the ECDSA signature pair
     * @param s Half of the ECDSA signature pair
     */
    function allpermit(address holder, address spender, uint256 nonce, uint256 expiry,
                    bool allowed, uint8 v, bytes32 r, bytes32 s) external
    {
        string memory name = name();
        bytes32 DOMAIN_SEPARATOR = keccak256(abi.encode(DOMAIN_TYPEHASH,keccak256(bytes(name)),getChainId(),address(this)));
        bytes32 STRUCTHASH = keccak256(abi.encode(PERMIT_TYPEHASH,holder,spender,nonce,expiry,allowed));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01",DOMAIN_SEPARATOR,STRUCTHASH));

        require(holder != address(0), "invalid-address-0");
        require(holder == ecrecover(digest, v, r, s), "invalid-permit");
        require(expiry == 0 || block.timestamp <= expiry, "permit-expired");
        require(nonce == nonces[holder]++, "invalid-nonce");
        setApprovalForAll(spender, allowed);
        emit approvalwithallpermit(holder, spender);
    }

    function changetokenURI(uint256 tokenId, string memory tokenURI) external onlytokenOwner(tokenId) {
        _changetokenURI(tokenId, tokenURI);
    }


    /** ===================== internal mutative function ===================== */

    function _batchmint(address to,uint amount) internal {
        require(amount != 0, "you must set a amount");
        for(uint i=0; i<amount;i++){
            _singlemint(to);
        }
        emit batchmints(to, amount);
    }

    function _singlemint(address to) internal {
        require(to != address(0), "to address is not allowed be zero");
        _safeMint(to, currentTokenID);
        currentTokenID++;
    }
    
    function _changeBaseURI(string memory baseURI_) internal {
        require(bytes(baseURI_).length > 0);
        baseURI = baseURI_;
        emit changedbaseURI(_msgSender(), baseURI);
    }
    
    function _changetokenURI(uint256 tokenId, string memory tokenURI) internal {
        _setTokenURI(tokenId, tokenURI);
        emit changedtokenURI(_msgSender(), tokenId, tokenURI);
    }


    /** ===================== internal view function ===================== */

    function getChainId() internal view returns (uint) {
        uint256 chainId;
        assembly { chainId := chainid() }
        return chainId;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    /** ===================== modifier ===================== */

    modifier onlytokenOwner(uint tokenId) {
        require(ownerOf(tokenId) == _msgSender(), "Only the owner can modify the tokenURI");
        _;
    }
    
    /** ===================== event ===================== */ 
    
    
    event batchmints(address indexed to, uint indexed amount);
    event changedtokenURI(address indexed owner, uint indexed tokenId, string indexed tokenURI);
    event changedbaseURI(address indexed, string indexed baseURI);
    event approvalwithpermit(address indexed holder, address indexed spender, uint indexed tokenId);
    event approvalwithallpermit(address indexed holder, address indexed spender);

    
}

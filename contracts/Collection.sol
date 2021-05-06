pragma solidity ^0.8.0;

import "../../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Collection is ERC721,Ownable,ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdTracker;

    /// @notice The EIP-712 typehash for the contract's domain
    bytes32 public constant DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    /// @notice The EIP-712 typehash for the contract's permit
    bytes32 public constant PERMIT_TYPEHASH = keccak256("Permit(address holder,address spender,uint256 nonce,uint256 expiry,bool allowed)");


    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseUri,
        address owner
    ) public Ownable() ERC721(_name, _symbol) {
        _setBaseURI(_baseUri);
        transferOwnership(owner);
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

    /**
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
        bytes32 DOMAIN_SEPARATOR = keccak256(abi.encode(DOMAIN_TYPEHASH,keccak256(bytes(name)),getChainId(),address(this)));
        bytes32 STRUCTHASH = keccak256(abi.encode(PERMIT_TYPEHASH,holder,spender,nonce,expiry,allowed));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01",DOMAIN_SEPARATOR,STRUCTHASH));

        require(holder != address(0), "invalid-address-0");
        require(holder == ecrecover(digest, v, r, s), "invalid-permit");
        require(expiry == 0 || now <= expiry, "permit-expired");
        require(nonce == nonces[holder]++, "invalid-nonce");
        uint tokenId = allowed ? _tokenId : 0;
        _approve(to, tokenId);
        emit Approvalwithpermit(holder, spender, tokenId);
    }

    /**
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
                    bool approved, uint8 v, bytes32 r, bytes32 s) external
    {
        bytes32 DOMAIN_SEPARATOR = keccak256(abi.encode(DOMAIN_TYPEHASH,keccak256(bytes(name)),getChainId(),address(this)));
        bytes32 STRUCTHASH = keccak256(abi.encode(PERMIT_TYPEHASH,holder,spender,nonce,expiry,allowed));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01",DOMAIN_SEPARATOR,STRUCTHASH));

        require(holder != address(0), "invalid-address-0");
        require(holder == ecrecover(digest, v, r, s), "invalid-permit");
        require(expiry == 0 || now <= expiry, "permit-expired");
        require(nonce == nonces[holder]++, "invalid-nonce");
        setApprovalForAll(to, approved);
        emit Approvalallwithpermit(holder, spender);
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
        _safeMint(to, _tokenIdTracker.current());
        _tokenIdTracker.increment();
    }
    
    function _changeBaseURI(string memory baseURI_) internal {
        _setBaseURI(baseURI_);
    }
    
    function _changetokenURI(uint256 tokenId, string memory tokenURI) internal {
        _setTokenURI(tokenId, tokenURI);
        emit changedtokenURI(msg.sender, tokenId, tokenURI);
    }

    /** ===================== modifier ===================== */
    modifier onlytokenOwner(uint tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can modify the tokenURI");
        _;
    }
    
    /** ===================== event ===================== */ 
    
    
    event batchmints(address indexed to, uint indexed amount);
    event changedtokenURI(address indexed owner, uint indexed tokenId, string indexed tokenURI);
    event Approvalwithpermit(address indexed holder, address indexed spender, uint indexed tokenId);
    event Approvalwithallpermit(address indexed holder, address indexed spender);

    
}

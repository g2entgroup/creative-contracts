const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace");

let MockERC20;
let mockERC20;
let MockERC721;
let mockERC721;
let TwitterVerify;
let twitterverify;
let RNG;
let rng;
let PoolFactory;
let poolfactory;
let poolAddress;
let Pool;
let pool;
let Provider;
//Test wallet addresses
let owner;
let addr1; // Test user 1
let addr2; // Test user 2
let addr3; // Test user 3
let brand; // Test Brand

beforeEach(async function () {
    [owner, addr1, addr2, addr3, brand] = await ethers.getSigners();

    MockERC20 = await ethers.getContractFactory("MockToken");
    mockERC20 = await MockERC20.deploy(addr1.address, addr2.address, addr3.address, brand.address);
    await mockERC20.deployed();  

    MockERC721 = await ethers.getContractFactory("MockNFT");
    mockERC721 = await MockERC721.deploy(addr1.address, addr2.address, addr3.address);
    await mockERC721.deployed();

    TwitterVerify = await ethers.getContractFactory("twitterverify");
    twitterverify = await TwitterVerify.deploy();
    await twitterverify.deployed();
    await twitterverify.createTestUser(brand.address);

    RNG = await ethers.getContractFactory("RandomNumberConsumer");
    rng = await RNG.deploy();
    await rng.deployed();

    PoolFactory = await ethers.getContractFactory("PoolFactory");
    poolfactory = await PoolFactory.deploy(twitterverify.address, mockERC20.address, rng.address); // mockERC20.address is subbing in for the link contract
    await poolfactory.deployed();

    await rng.transferOwnership(poolfactory.address);
    
    // Create Test Pool
    await poolfactory.changePoolCreationBool(true);
    await mockERC20.connect(brand).approve(poolfactory.address, "100000000000000000"); // Approve the pool contract to spend 0.1 mockERC20 tokens(which are subsituting for link)
    await poolfactory.connect(brand).createPool("Tesla Pool", "1000000000000000000000", mockERC20.address, mockERC721.address, "300", "100", "100", "100");
    poolAddress = await poolfactory.getPoolAddress(0);
    Pool = await ethers.getContractFactory("Pool");
    pool = await Pool.attach(poolAddress);

});

describe("Pool Revert Tests", function() {
    //Test onlyPoolOwnerModifier
    it("Should revert when someone other than pool owner calls backPool()", async function() {
        await expect( pool.connect(addr1).backPool()).to.be.reverted;
    });

    it("Should revert when someone other than pool owner calls changeName()", async function() {
        await expect( pool.connect(addr1).changeName("TEST")).to.be.reverted;
    });

    it("Should revert when someone other than pool owner calls checkForTies()", async function() {
        await expect( pool.connect(addr1).checkForTies()).to.be.reverted;
    });

    it("Should revert when someone other than pool owner calls selectWinner()", async function() {
        await expect( pool.connect(addr1).selectWinner("0")).to.be.reverted;
    });

});

describe("Pool Owner Functionality Tests", function() {

    it("Should transfer funds to back the pool from pool owner to the pool", async function() {
        await mockERC20.connect(brand).approve(pool.address, "1000000000000000000000");
        await pool.connect(brand).backPool();
        expect((await pool.seePoolBacking()).toString()).to.equal("1000000000000000000000");
    });

    it("If owner calls backPool() twice, the second call should revert", async function() {
        await mockERC20.connect(brand).approve(pool.address, "1000000000000000000000");
        await pool.connect(brand).backPool();
        await expect( pool.connect(brand).backPool()).to.be.reverted;
    });

    it("Should allow pool owner to change the pool name", async function() {
        await pool.connect(brand).changeName("TEST_NAME");
        expect(await pool.connect(brand).getName()).to.equal("TEST_NAME");
    });

    it("Should revert when someone other than pool owner calls checkForTies()", async function() {
        await expect( pool.connect(brand).checkForTies()).to.be.reverted;
    });

    it("Should revert when someone other than pool owner calls selectWinner()", async function() {
        await expect( pool.connect(brand).selectWinner("0")).to.be.reverted;
    });

});

describe("Pool Artist Functionality Tests", function() {

    it("Artists should be able to create submissions if they have the funds and nfts available", async function() {
        await mockERC20.connect(brand).approve(pool.address, "1000000000000000000000");
        await pool.connect(brand).backPool();
        
        await mockERC20.connect(addr1).approve(pool.address, "100000000000000000000");
        let nfts = ["1", "2", "3"];
        await mockERC721.connect(addr1).approve(pool.address, "1"); //Approve the pool to transfer nft w/ tokenId 1
        await mockERC721.connect(addr1).approve(pool.address, "2"); //Approve the pool to transfer nft w/ tokenId 2
        await mockERC721.connect(addr1).approve(pool.address, "3"); //Approve the pool to transfer nft w/ tokenId 3
        await pool.connect(addr1).createSubmission(nfts);

        //Make sure tokens, and NFTs transferred to pool
        expect(await mockERC20.connect(addr1).balanceOf(pool.address)).to.equal("1100000000000000000000")
        expect(await mockERC721.connect(addr1).ownerOf("1")).to.equal(pool.address);
        expect(await mockERC721.connect(addr1).ownerOf("2")).to.equal(pool.address);
        expect(await mockERC721.connect(addr1).ownerOf("3")).to.equal(pool.address);

        //TODO: Confirm the entry was created properly
        //expect(await pool.connect(addr2).submissions[0].nftList).to.equal(nfts);
    });

    it("createSubmission() should fail if ERC20 transferFrom fails", async function() {
        await mockERC20.connect(brand).approve(pool.address, "1000000000000000000000");
        await pool.connect(brand).backPool();
        
        // Did not approve token transfer
        let nfts = ["1", "2", "3"];
        await mockERC721.connect(addr1).approve(pool.address, "1");
        await mockERC721.connect(addr1).approve(pool.address, "2");
        await mockERC721.connect(addr1).approve(pool.address, "3");
        await expect(pool.connect(addr1).createSubmission(nfts)).to.be.reverted;
    });

    it("createSubmission() should fail if ERC721 transferFrom fails", async function() {
        await mockERC20.connect(brand).approve(pool.address, "1000000000000000000000");
        await pool.connect(brand).backPool();
        
        //Did not approve nft transfer
        await mockERC20.connect(addr1).approve(pool.address, "100000000000000000000");
        let nfts = ["1", "2", "3"];
        await expect(pool.connect(addr1).createSubmission(nfts)).to.be.reverted;
    });

    it("createSubmission() should fail if pool owner has not backed the pool with funds", async function() {
        await mockERC20.connect(addr1).approve(pool.address, "100000000000000000000");
        let nfts = ["1", "2", "3"];
        await mockERC721.connect(addr1).approve(pool.address, "1");
        await mockERC721.connect(addr1).approve(pool.address, "2");
        await mockERC721.connect(addr1).approve(pool.address, "3");
        await expect(pool.connect(addr1).createSubmission(nfts)).to.be.reverted;
    });

    it("createSubmission() should fail if passed the submission end time", async function() {
        await mockERC20.connect(brand).approve(pool.address, "1000000000000000000000");
        await pool.connect(brand).backPool();

        //Advance time to make it the fan voiting period
        await network.provider.send("evm_increaseTime", [150]);
        await network.provider.send("evm_mine");        

        await mockERC20.connect(addr1).approve(pool.address, "100000000000000000000");
        let nfts = ["1", "2", "3"];
        await mockERC721.connect(addr1).approve(pool.address, "1");
        await mockERC721.connect(addr1).approve(pool.address, "2");
        await mockERC721.connect(addr1).approve(pool.address, "3");
        await expect(pool.connect(addr1).createSubmission(nfts)).to.be.reverted;
    });
});

describe("Pool Fan Functionality Tests", function() {

    it("Fans should be able to vote on submissions if they have the funds available", async function() {
        await mockERC20.connect(brand).approve(pool.address, "1000000000000000000000");
        await pool.connect(brand).backPool();
        
        await mockERC20.connect(addr1).approve(pool.address, "100000000000000000000");
        let nfts = ["1", "2", "3"];
        await mockERC721.connect(addr1).approve(pool.address, "1");
        await mockERC721.connect(addr1).approve(pool.address, "2");
        await mockERC721.connect(addr1).approve(pool.address, "3");
        await pool.connect(addr1).createSubmission(nfts);

        //Advance time to make it the fan voiting period
        await network.provider.send("evm_increaseTime", [150]);
        await network.provider.send("evm_mine");

        await mockERC20.connect(addr2).approve(pool.address, "100000000000000000000");
        await pool.connect(addr2).fanVote("1");
    });

    it("When fans vote on submissions, the top ten count should update", async function() {
        await mockERC20.connect(brand).approve(pool.address, "1000000000000000000000");
        await pool.connect(brand).backPool();
        
        //Create submission 0
        await mockERC20.connect(addr1).approve(pool.address, "100000000000000000000");
        let nfts = ["1", "2", "3"];
        await mockERC721.connect(addr1).approve(pool.address, "1");
        await mockERC721.connect(addr1).approve(pool.address, "2");
        await mockERC721.connect(addr1).approve(pool.address, "3");
        await pool.connect(addr1).createSubmission(nfts);

        //Create submission 1
        await mockERC20.connect(addr2).approve(pool.address, "100000000000000000000");
        let nfts1 = ["4", "5", "6"];
        await mockERC721.connect(addr2).approve(pool.address, "4"); //Approve the pool to transfer nft w/ tokenId 1
        await mockERC721.connect(addr2).approve(pool.address, "5"); //Approve the pool to transfer nft w/ tokenId 2
        await mockERC721.connect(addr2).approve(pool.address, "6"); //Approve the pool to transfer nft w/ tokenId 3
        await pool.connect(addr2).createSubmission(nfts1);

        //Create submission 2
        await mockERC20.connect(addr3).approve(pool.address, "100000000000000000000");
        let nfts2 = ["7", "8", "9"];
        await mockERC721.connect(addr3).approve(pool.address, "7"); //Approve the pool to transfer nft w/ tokenId 1
        await mockERC721.connect(addr3).approve(pool.address, "8"); //Approve the pool to transfer nft w/ tokenId 2
        await mockERC721.connect(addr3).approve(pool.address, "9"); //Approve the pool to transfer nft w/ tokenId 3
        await pool.connect(addr3).createSubmission(nfts2);

        //Advance time to make it the fan voiting period
        await network.provider.send("evm_increaseTime", [150]);
        await network.provider.send("evm_mine");

        await mockERC20.connect(addr2).approve(pool.address, "100000000000000000000");
        await pool.connect(addr2).fanVote("1");

        await mockERC20.connect(addr1).approve(pool.address, "100000000000000000000");
        await pool.connect(addr1).fanVote("3");

        await mockERC20.connect(addr3).approve(pool.address, "100000000000000000000");
        await pool.connect(addr3).fanVote("2");

        await mockERC20.connect(addr3).approve(pool.address, "100000000000000000000");
        await pool.connect(addr3).fanVote("1");

        let topTen = await pool.getTopTen();
        expect (topTen[0]).to.equal("1");
        expect (topTen[1]).to.equal("3");
        expect (topTen[2]).to.equal("2");

        let topTenAmount = await pool.getTopTenAmount();
        expect (topTenAmount[0]).to.equal("200000000000000000000");
        expect (topTenAmount[1]).to.equal("100000000000000000000");
        expect (topTenAmount[2]).to.equal("100000000000000000000");
    });

    it("Artitsts should not be able to vote on their own submissions", async function() {
        await mockERC20.connect(brand).approve(pool.address, "1000000000000000000000");
        await pool.connect(brand).backPool();
        
        await mockERC20.connect(addr1).approve(pool.address, "100000000000000000000");
        let nfts = ["1", "2", "3"];
        await mockERC721.connect(addr1).approve(pool.address, "1");
        await mockERC721.connect(addr1).approve(pool.address, "2");
        await mockERC721.connect(addr1).approve(pool.address, "3");
        await pool.connect(addr1).createSubmission(nfts);

        //Advance time to make it the fan voiting period
        await network.provider.send("evm_increaseTime", [150]);
        await network.provider.send("evm_mine");
        
        await mockERC20.connect(addr1).approve(pool.address, "100000000000000000000");
        await expect(pool.connect(addr1).fanVote("0")).to.be.reverted;
    });
});


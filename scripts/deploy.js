/*
 * ***DEPRECATED DO NOT USE***
 * Leaving this deploy script here strictly for reference only. 
 * If you need to deploy a contract, you should use npx hardhat deploy
 * Doing it this way saves all the contract meta data and makes verification much easier!
 */
async function main() {
    const Storage = await ethers.getContractFactory("Storage");
    console.log("Deploying Storage...");
    const storage = await Storage.deploy();
    console.log("Storage deployed to:", storage.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
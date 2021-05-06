// scripts/deploy.js
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
// scripts/deploy.js
async function main() {
    const TwitterVerify = await ethers.getContractFactory("twitterverify");
    console.log("Deploying twitterverify...");
    const twitterverify = await TwitterVerify.deploy();
    console.log("twitterverify deployed to:", twitterverify.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
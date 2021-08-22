const LINK_TOKEN_ADDRESS = "0x8825d49dea3a8fc5643217f61217fe5d0564e616";
module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();

    const twitterVerify = await deploy('twitterverify', {
        from: deployer,
        args: [],
        log: true,
      });
    const rngContract = await deploy('RandomNumberConsumer', {
        from: deployer,
        args: [],
        log: true,
      });
    const poolFactory = await deploy('PoolFactory', {
      from: deployer,
      args: [twitterVerify.address, LINK_TOKEN_ADDRESS, rngContract.address],
      log: true,
    });
    console.log("Transferring RNG ownership to PoolFactory...");
    const RNG = await ethers.getContractFactory("RandomNumberConsumer");
    const rng = await RNG.attach(rngContract.address);
    await rng.transferOwnership(poolFactory.address, {gasLimit: 500000});
    console.log("New RNG Owner: ", await rng.owner());

    const PoolContract = await deploy('Pool', {
      from: deployer,
      args: [],
      log: true,
    });

    const CreativeNFTContract = await deploy ('CreativeNFT', {
      from: deployer,
      args: [],
      log: true,
    });
  };
  module.exports.tags = ['CreativeNFT'];
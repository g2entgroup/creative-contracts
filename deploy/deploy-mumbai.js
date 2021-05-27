const TWITTER_VERIFY_ADDRESS = "0x2FF309ba73a8d8f25414f7eE6Dc03579128Adfda";
const LINK_TOKEN_ADDRESS = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";
module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    const rngContract = await deploy('mockCRTV', {
        from: deployer,
        args: [],
        log: true,
      });
    /*const rngContract = await deploy('RandomNumberConsumer', {
        from: deployer,
        args: [],
        log: true,
      });


    await deploy('PoolFactory', {
      from: deployer,
      args: [TWITTER_VERIFY_ADDRESS, LINK_TOKEN_ADDRESS, rngContract.address],
      log: true,
    });*/
  };
  module.exports.tags = ['PoolFactory'];
require("@nomiclabs/hardhat-waffle");
require('hardhat-deploy');
const { mnemonic, maticVigilSecret } = require('./secrets.json');
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.6.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.7.1",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  networks: {
    mumbai: {
      url: `https://rpc-mumbai.maticvigil.com/v1/${maticVigilSecret}`,
      accounts: {mnemonic: mnemonic}
    },
    polygon: {
      url: `https://rpc-mainnet.maticvigil.com/v1/${maticVigilSecret}`,
      accounts: {mnemonic: mnemonic}
    },
    xDai: {
      url: `https://rpc.xdaichain.com/`,
      accounts: {mnemonic: mnemonic}
    }
  },
  mocha: {
    timeout: 200000
  },
  namedAccounts: {
    deployer: {
        default: 0, // here this will by default take the first account as deployer
        1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        4: '0xA296a3d5F026953e17F472B497eC29a5631FB51B', // but for rinkeby it will be a specific address
        "goerli": '0x84b9514E013710b9dD0811c9Fe46b837a4A0d8E0', //it can also specify a specific netwotk name (specified in hardhat.config.js)
    }
  }
};

/* eslint no-use-before-define: "warn" */
//const { config, ethers } = require("hardhat");


const Web3 = require('web3');
const contractAddress = '0xD55cf33d0648837032c4396c72a44CE3C1C7c1b1'
//contract abi
const contractAbi = require("../artifacts/contracts/CreativeNFT.sol/CreativeNFT.json");

//initializing web3
//If Metamsk is used: 
//const web3 = new Web3(Web3.givenProvider);
//else this one below
const web3 = new Web3(new Web3.providers.HttpProvider("https://polygon-mumbai.g.alchemy.com/v2/4QdGUP8BOp3_NdNJAN1c2sWs12LtsfDF"));

//initializing contract
const contract = new web3.eth.Contract(contractAbi, contractAddress);

//minting function if metamask or a similar wallet is used:


// const mintNFT = async () => {
//   try{
//     const accounts = await ethereum.request({method: 'eth_requestAccounts' })
//     const account = accounts[0]
//     const toPay = web3.utils.toWei('0.001', 'ether');
//     const tx = await contract.methods.mint().send({
//       from: account,
//       value: toPay,
//     });
//   } 
//   catch(error){
//     console.log(error.message);
//   }
// }

//minting function if we manage the private key of the users:
const mintNFT = async () => {
  const walletAddress = "0x0000000000000000000000000000000000000000";
  const privateKey = "0x0000000000000000000000000000000000000000000000000000000000000000";
  try{
    const nonce = await web3.eth.getTransactionCount(
      walletAddress,
      "latest"
    );
    const tx = {
      from: walletAddress,
      to: contractAddress,
      gas: 2000000,
      nonce: nonce,
      data: contract.methods.mint().encodeABI(),
    };
    const sign = await web3.eth.accounts.signTransaction(
      tx,
      privateKey
    );
    const result = await web3.eth.sendSignedTransaction(
      sign.rawTransaction,
      function (err, hash) {
        if (!err) {
          console.log(
            "The hash of your transaction is: ",
            hash,
            "\nCheck Alchemy's Mempool to view the status of your transaction!"
          );
        } else {
          console.log(
            "Something went wrong when submitting your transaction:",
            err
          );
        }
      }
    );
    console.log(result);
  }catch(error){
    console.log(error.message);
  }
}





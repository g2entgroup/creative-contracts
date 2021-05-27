# creative-contracts

After cloning the repo, you will need create a secrets.json file in the project directory with the following deets:

{
    "mnemonic": "some words you get from running npx mnemonics",
    "maticVigilSecret": "Super Secret Key"
}

In order to generate your mnemonic words run: npx mnemonics


Then if you run npx hardhat accounts, and copy the first address, you can paste it into the mumbai testnet faucet to get some mumbai matic

run npx hardhat test

[PoolFactory]("https://explorer-mumbai.maticvigil.com/address/0xcbEF9474EE8804778694e3F30Ed4f58267953163/transactions")
[mock CRTV]("https://explorer-mumbai.maticvigil.com/address/0xc59Cd7D4A979373253476dAe531333eE45aEF2f4/transactions")
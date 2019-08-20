require('dotenv').config();
var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = process.env["NEMONIC"];
var tokenKey = process.env["ENDPOINT_KEY"];

module.exports = {


  networks: {
    kovan: {
      host: "localhost",
      provider: new HDWalletProvider( mnemonic, "http://kovan.infura.io/" + tokenKey ),
      network_id: 42,
      gas: 5000000,
    },

    ropsten: {
      provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/"+ tokenKey),
      network_id: 3,
      gas: 4700000,
    },
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
      
    },
    rinkeby:{
      host: "localhost",
      provider: new HDWalletProvider( mnemonic, "https://rinkeby.infura.io/" + tokenKey),
      network_id:4, 
      gas: 4700000,
      },
      solc: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
  }
  
};
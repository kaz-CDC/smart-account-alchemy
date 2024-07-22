require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "localhost",
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      }
    }
  },
  // Other configurations...
};



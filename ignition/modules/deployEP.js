const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const hre = require("hardhat");

async function main() {

  module.exports = buildModule("EntryPoint", (m) => {
    const entrypoint = m.contract("EntryPoint");
    return { entrypoint };  
    
  });
  //console.log(entrypoint)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});



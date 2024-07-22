const hre = require("hardhat");

const EP_ADDR = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const AF_ADDR = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

async function main() {

  const epCode = await hre.ethers.provider.getCode(EP_ADDR);
  const afCode = await hre.ethers.provider.getCode(AF_ADDR);


  console.log(epCode, "********** BREAK ***********", afCode);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
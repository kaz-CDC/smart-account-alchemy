const hre = require("hardhat");

async function main() {
  const af = await hre.ethers.deployContract("AccountFactory"); // This deploys the AccountFactory.sol contract

  await af.waitForDeployment();

  console.log(`Account Factory deployed to ${af.target}`);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
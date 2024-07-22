const hre = require("hardhat");

async function main() {
  const af = await hre.ethers.deployContract("AccountFactory");

  await af.waitForDeployment();

  console.log(`Account Factory deployed to ${af.target}`);

//   const ep = await hre.ethers.deployContract("EntryPoint");

//   await ep.waitForDeployment();

//   console.log(`EP deployed to ${ep.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
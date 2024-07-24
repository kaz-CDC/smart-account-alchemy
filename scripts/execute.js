const hre = require("hardhat");
const ethers = require("ethers");


const FACTORY_NONCE = 1; // Nonce management
const FACTORY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Account Factory Address
const EP_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // EntryPoint Contract Address

async function main() { 

   const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);
   const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");
   const [signer0] = await hre.ethers.getSigners();
   const address0 = await signer0.getAddress();
   const initCode = FACTORY_ADDRESS + AccountFactory.interface
  .encodeFunctionData("createAccount", [address0])
  .slice(2);

  console.log(address0) // First Wallet Address
 

  // Generate SmartAccount Address
  const sender = await hre.ethers.getCreateAddress({
    from: FACTORY_ADDRESS,
    nonce: FACTORY_NONCE
  })
  console.log(sender); // SmartContract Address


  // Fund SmartAccount
  const provider = new hre.ethers.JsonRpcProvider('http://127.0.0.1:8545');
  const wallet = await new hre.ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider)
  const amountInWei = ethers.parseEther('10')
  const transferTx = await wallet.sendTransaction({
    to: sender,
    value: amountInWei
  })
  const result = await transferTx.wait();
  console.log(result);
  
  
  // Fund EndPoint Contract
  await entryPoint.depositTo(sender, {
    value: hre.ethers.parseEther("10")
  });


  const senderBalance = await provider.getBalance(sender)
  console.log("SmartAccount Balance: ",senderBalance);
  

  // const epBalance = await entryPoint.getBalanceOf(EP_ADDRESS);
  // console.log("Entry Point Balance = ", epBalance);



  const Account = await hre.ethers.getContractFactory("Account");
  // Set gas limits
   const accountGasLimits = hre.ethers.toBeHex(2000000000000, 32);// Example gas limit for account operation
   const preVerificationGas = hre.ethers.toBeHex(100000000000, 32); // Example gas limit for pre-verification
   
  const userOp = {
    sender, // smart account address
    nonce: await entryPoint.getNonce(sender, 0),
    initCode,
    callData: Account.interface.encodeFunctionData("execute"),
    accountGasLimits,
    preVerificationGas, 
    gasFees: hre.ethers.toBeHex(2000000000000, 32),
    paymasterAndData: "0x",
    signature: "0x"
};

const tx = await entryPoint.handleOps([userOp], address0);
const receipt = await tx.wait();
console.log(receipt);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
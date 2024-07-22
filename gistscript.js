bundlerUrl = "https://bundler-t3.cronos.org/rpc"

chainId = 338   // Cronos testnet
// chainId = 25 // Cronos mainnet 

bundlerProvider = new ethers.JsonRpcProvider(bundlerUrl, {
    name: 'Connected bundler network',
    chainId
})

accountSigner1 = new ethers.Wallet("PRIVATE_KEY")
account1 = accountSigner1.address


salt = "0xff605257b97c652e1af7e8fd938b6933d79331fe66a85bb834113a6a4af80d11"

entryPointAddress = "0x4cCf96f6D2d0A8E90Ca419e2581b6570482CF258" // Cronos testnet
// entryPointAddress = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789" // Cronos mainnet

entryPointContract = await ethers.getContractAt("TestEntryPoint", entryPointAddress)

accountFactoryAddress = "0xa26b3FCF2A45143eFc5326a40542a63AdCf310dB" // Cronos testnet
// accountFactoryAddress = "0xa6B19BBF8Cd225B76FAd500c686f1B74E2d4aA25" // Cronos mainnet

accountFactoryContract = await ethers.getContractAt("AccountFactory", accountFactoryAddress)



createAccountTx = await accountFactoryContract.createAccount.populateTransaction(account1)
initCode = ethers.solidityPacked(["address", "bytes"], [accountFactoryAddress, createAccountTx.data])

erc4337AccountAddress = await accountFactoryContract.createAccount.staticCall(account1, salt)



userOp = {
    sender: erc4337AccountAddress,
    initCode: initCode,
    // initCode: "0x",
    callData: callData,
    nonce: ethers.toQuantity(nonce),
    callGasLimit: ethers.toQuantity(0n),
    verificationGasLimit: ethers.toQuantity(0n),
    preVerificationGas: ethers.toQuantity(0n),
    maxFeePerGas: ethers.toQuantity(maxFeePerGas),
    // maxFeePerGas: ethers.toQuantity(0n),
    maxPriorityFeePerGas: ethers.toQuantity(maxPriorityFeePerGas),
    paymasterAndData: '0x',
    signature: '0x',
}

function sign(signer, opHash) {
    // v5: await w.signMessage(ethers.utils.arrayify(opHash))
    // v6: signer.signingKey.sign(hash).serialized
    let hash = ethers.solidityPackedKeccak256(["string", "bytes32"], ["\x19Ethereum Signed Message:\n32", opHash]);
    return signer.signingKey.sign(hash).serialized;
}

dummyOpHash = await entryPointContract.getUserOpHash(userOp);
dummySigClientSide = sign(accountSigner1, dummyOpHash)
dummySigServerSide = sign(accountSigner2, dummyOpHash)
dummySignature = ethers.solidityPacked(["bytes", "bytes"], [dummySigClientSide, dummySigServerSide]);
userOp.signature = dummySignature

function deepHexlify(obj) {
    if (typeof obj === 'function') {
        return undefined
    }

    if (obj == null || typeof obj === 'string' || typeof obj === 'boolean') {
        return obj
    } else if (obj._isBigNumber != null || typeof obj !== 'object') {
        return ethers.hexlify(obj).replace(/^0x0/, '0x')
    }

    if (Array.isArray(obj)) {
        return obj.map(member => deepHexlify(member))
    }

    return Object.keys(obj)
        .reduce((set, key) => ({
            ...set,
            [key]: deepHexlify(obj[key])
        }), {})
}


hexifiedUserOp = deepHexlify(userOp);
// entryPoints = await bundlerProvider.send("eth_supportedEntryPoints", []);
gasResult = await bundlerProvider.send('eth_estimateUserOperationGas', [hexifiedUserOp, entryPointAddress]);
preVerificationGas = gasResult.preVerificationGas
verificationGas = gasResult.verificationGas
callGasLimit = gasResult.callGasLimit

userOp.preVerificationGas = ethers.toQuantity(Math.floor(parseInt(preVerificationGas) * 1.5));
userOp.verificationGasLimit = ethers.toQuantity(Math.max(50000, Math.floor(parseInt(verificationGas) * 1.5)));
userOp.callGasLimit = ethers.toQuantity(Math.floor(parseInt(callGasLimit) * 1.5)); // could optimize later

// prefund = getRequiredPrefund({
//    userOperation: Object.assign({}, userOp, {
//        callGasLimit: BigInt(userOp.callGasLimit),
//        verificationGasLimit: BigInt(userOp.verificationGasLimit),
//        preVerificationGas: BigInt(userOp.preVerificationGas),
//        maxFeePerGas: BigInt(userOp.maxFeePerGas),
//        maxPriorityFeePerGas: BigInt(userOp.maxPriorityFeePerGas),
//    })
// })

balance = ethers.formatEther(await ethers.provider.getBalance(erc4337AccountAddress))
// console.log(balance > prefund)

opHash = await entryPointContract.getUserOpHash(userOp);

sigClientSide = sign(accountSigner1, opHash);
sigServerSide = sign(accountSigner2, opHash);
signature = ethers.solidityPacked(["bytes", "bytes"], [sigClientSide, sigServerSide]);
userOp.signature = signature;
hexifiedUserOpSigned = deepHexlify(userOp);
result = await bundlerProvider.send('eth_sendUserOperation', [hexifiedUserOpSigned, entryPointAddress]);
receipt = await bundlerProvider.send("eth_getUserOperationReceipt", [opHash]);

// check if account contract existed
await ethers.provider.getCode(erc4337AccountAddress)
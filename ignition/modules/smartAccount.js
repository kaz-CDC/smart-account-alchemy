const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const TokenModule = buildModule("SmartAccountModule", (m) => {
  const token = m.contract("Token");

  return { token };
});

module.exports = TokenModule;
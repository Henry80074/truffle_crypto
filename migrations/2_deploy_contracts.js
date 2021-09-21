const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

module.exports = function(deployer) {
  //Deploy Token
  deployer.deploy(Token);
  const token = await Token.deployed()
  //Deploy EthSwap
  deployer.deploy(EthSwap);
  const ethSwap = await EthSwap.deployed()
};

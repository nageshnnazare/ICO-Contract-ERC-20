const TickerToken = artifacts.require('TickerToken.sol');

const totalTokens = 10000;

module.exports = function (deployer) {
	deployer.deploy(TickerToken, totalTokens);
};

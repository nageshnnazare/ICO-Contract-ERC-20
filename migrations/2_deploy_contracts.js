const TickerToken = artifacts.require('TickerToken.sol');
const TickerTokenSale = artifacts.require('TickerTokenSale.sol');

const totalTokens = 10000;
const tokenPrice = 1_000_000_000_000; //Wei

module.exports = function (deployer) {
	deployer.deploy(TickerToken, totalTokens).then(function () {
		return deployer.deploy(TickerTokenSale, TickerToken.address, tokenPrice);
	});
};

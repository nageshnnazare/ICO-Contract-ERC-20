const TickerToken = artifacts.require('TickerToken.sol');
const TickerTokenSale = artifacts.require('TickerTokenSale.sol');

contract('TickerTokenSale', function (accounts) {
	let contractInstance;
	let saleContractInstance;
	const tokenPrice = 1_000_000_000_000; // Wei
	const numberOfTokens = 100;
	const totalSupply = 10000;
	const tokenAvailable = 0.75 * totalSupply;
	const admin = accounts[0];
	const buyer = accounts[2];

	it('initializes the contract with correct values', function () {
		return TickerTokenSale.deployed()
			.then(function (instance) {
				saleContractInstance = instance;
				return saleContractInstance.address;
			})
			.then(function (address) {
				assert.notEqual(address, 0x0, 'has contract address');
				return saleContractInstance.tokenContract();
			})
			.then(function (address) {
				assert.notEqual(address, 0x0, 'has token contract address');
				return saleContractInstance.tokenPrice();
			})
			.then(function (price) {
				assert.equal(price, tokenPrice, 'correct token price');
			});
	});

	it('facilitates token buying', function () {
		TickerToken.deployed()
			.then(function (instance) {
				contractInstance = instance;
				return TickerTokenSale.deployed();
			})
			.then(function (instance) {
				saleContractInstance = instance;
				return contractInstance.transfer(saleContractInstance.address, tokenAvailable, { from: admin });
			})
			.then(function (receipt) {
				let value = numberOfTokens * tokenPrice;
				return saleContractInstance.buyTokens(numberOfTokens, { from: buyer, value: value });
			})
			.then(function (receipt) {
				assert.equal(receipt.logs.length, 1, 'triggers only 1 event');
				assert.equal(receipt.logs[0].event, 'Sell', 'is a [Sell] event');
				assert.equal(receipt.logs[0].args._buyer, accounts[2], 'correct buyer account address');
				assert.equal(receipt.logs[0].args._value, numberOfTokens, 'correct number of tokens purchased');

				return saleContractInstance.tokenSold();
			})
			.then(function (number) {
				assert.equal(number.toNumber(), numberOfTokens, 'increments the number of tokens sold');
				return contractInstance.balanceOf(buyer);
			})
			.then(function (balance) {
				assert.equal(balance.toNumber(), numberOfTokens, 'correct number of tokens credited to buyer');
				return contractInstance.balanceOf(saleContractInstance.address);
			})
			.then(function (balance) {
				assert.equal(balance.toNumber(), tokenAvailable - numberOfTokens, 'correct number of tokens left for sale');
				return saleContractInstance.buyTokens(numberOfTokens, { from: buyer, value: value - 1_000 });
			})
			.then(assert.fail)
			.catch(function (err) {
				assert(err.message.indexOf('revert') >= 0, 'value must equal number of tokens');
				return saleContractInstance.buyTokens(tokenAvailable + 100, { from: buyer, value: value });
			})
			.then(assert.fail)
			.catch(function (err) {
				assert(err.message.indexOf('revert') >= 0, 'value must not exceed the number of tokens available');
			});
	});
});

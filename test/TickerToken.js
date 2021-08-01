const TickerToken = artifacts.require('TickerToken.sol');

const totalTokens = 10000;
const transferTokens = 100;
const approveTokens = 50;

contract('TickerToken', function (accounts) {
	let contractInstance;
	it('initializes the contract with correct name & symbol', function () {
		return TickerToken.deployed()
			.then(function (instance) {
				contractInstance = instance;
				return contractInstance.name();
			})
			.then(function (name) {
				assert.equal(name, 'Ticker Token', 'sets correct name');
				return contractInstance.symbol();
			})
			.then(function (symbol) {
				assert.equal(symbol, 'TICK', 'sets correct symbol');
				return contractInstance.version();
			})
			.then(function (version) {
				assert.equal(version, '1.0.0', 'sets correct version');
				return contractInstance.standard();
			})
			.then(function (standard) {
				assert.equal(standard, 'EIP-20', 'sets correct standard');
			});
	});

	it('sets total supply on deployment', function () {
		return TickerToken.deployed()
			.then(function (instance) {
				contractInstance = instance;
				return contractInstance.totalSupply();
			})
			.then(function (totalSupply) {
				assert.equal(
					totalSupply.toNumber(),
					totalTokens,
					'sets the initial total supply'
				);
				return contractInstance.balanceOf(accounts[0]);
			})
			.then(function (managerBalance) {
				assert.equal(
					managerBalance.toNumber(),
					totalTokens,
					'manager has all the tokens initially'
				);
			});
	});

	it('transfers token ownership', function () {
		return TickerToken.deployed()
			.then(function (instance) {
				contractInstance = instance;
				return contractInstance.transfer.call(accounts[1], 99999);
			})
			.then(assert.fail)
			.catch(function (err) {
				assert(
					err.message.indexOf('revert') >= 0,
					'error message must contain revert'
				);
				return contractInstance.transfer.call(accounts[1], transferTokens, {
					from: accounts[0],
				});
			})
			.then(function (success) {
				assert.equal(success, true, 'transfer successful');
				return contractInstance.transfer(accounts[1], transferTokens, {
					from: accounts[0],
				});
			})
			.then(function (receipt) {
				assert.equal(receipt.logs.length, 1, 'triggers only 1 event');
				assert.equal(
					receipt.logs[0].event,
					'Transfer',
					'is a [Transfer] event'
				);
				assert.equal(
					receipt.logs[0].args._from,
					accounts[0],
					'correct sender address'
				);
				assert.equal(
					receipt.logs[0].args._to,
					accounts[1],
					'correct recipient address'
				);
				assert.equal(
					receipt.logs[0].args._value,
					transferTokens,
					'correct amount sent'
				);

				return contractInstance.balanceOf(accounts[1]);
			})
			.then(function (balance) {
				assert.equal(
					balance.toNumber(),
					transferTokens,
					"adds the tokens to the recipient's account"
				);
				return contractInstance.balanceOf(accounts[0]);
			})
			.then(function (balance) {
				assert.equal(
					balance.toNumber(),
					totalTokens - transferTokens,
					"deducts the tokens from the sender's account"
				);
			});
	});

	it('approves tokens for delegated transfer', function () {
		return TickerToken.deployed()
			.then(function (instance) {
				contractInstance = instance;
				return contractInstance.approve.call(accounts[1], approveTokens);
			})
			.then(function (success) {
				assert.equal(success, true, 'approval successful');
				return contractInstance.approve(accounts[1], approveTokens, {
					from: accounts[0],
				});
			})
			.then(function (receipt) {
				assert.equal(receipt.logs.length, 1, 'triggers only 1 event');
				assert.equal(
					receipt.logs[0].event,
					'Approval',
					'is a [Approval] event'
				);
				assert.equal(
					receipt.logs[0].args._owner,
					accounts[0],
					'correct owner address'
				);
				assert.equal(
					receipt.logs[0].args._spender,
					accounts[1],
					'correct spender address'
				);
				assert.equal(
					receipt.logs[0].args._value,
					approveTokens,
					'correct amount approved'
				);

				return contractInstance.allowance(accounts[0], accounts[1]);
			})
			.then(function (allowance) {
				assert.equal(
					allowance,
					approveTokens,
					'stores the allowance for delegated transfer'
				);
			});
	});
});

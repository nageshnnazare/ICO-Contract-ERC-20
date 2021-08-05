App = {
	web3Provider: null,
	contracts: {},
	account: '0x0',
	loading: false,
	tokenPrice: 1_000_000_000_000,
	tokenSold: 0,
	tokensAvailable: 7500,

	init: function () {
		// console.log('App Initialized..');
		return App.initWeb3();
	},

	initWeb3: function () {
		if (typeof web3 !== 'undefined') {
			App.web3Provider = web3.currentProvider;
			web3 = new Web3(web3.currentProvider);
		} else {
			App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
			web3 = new Web3(App.web3Provider);
		}

		return App.initContracts();
	},

	initContracts: function () {
		$.getJSON('TickerTokenSale.json', function (tickerTokenSale) {
			App.contracts.TickerTokenSale = TruffleContract(tickerTokenSale);
			App.contracts.TickerTokenSale.setProvider(App.web3Provider);
			App.contracts.TickerTokenSale.deployed().then(function (tickerTokenSale) {
				// console.log('Sale Contract Address : ', tickerTokenSale.address);
			});
		}).done(function () {
			$.getJSON('TickerToken.json', function (tickerToken) {
				App.contracts.TickerToken = TruffleContract(tickerToken);
				App.contracts.TickerToken.setProvider(App.web3Provider);
				App.contracts.TickerToken.deployed().then(function (tickerToken) {
					// console.log('Contract Address : ', tickerToken.address);
				});
				App.listenForEvents();
				return App.render();
			});
		});
	},

	listenForEvents: function () {
		App.contracts.TickerTokenSale.deployed().then(function (instance) {
			saleContractInstance = instance;
			saleContractInstance
				.Sell(
					{},
					{
						fromBlock: 0,
						toBlock: 'latest',
					}
				)
				.watch(function (error, event) {
					// console.log('Event triggered : ', event);
					App.render();
				});
		});
	},

	render: function () {
		if (App.loading) {
			return;
		}
		App.loading = true;

		$('#loader').show();
		$('#content').hide();

		web3.eth.getCoinbase(function (err, account) {
			if (!err) {
				App.account = account;
				$('#accountAddress').html('Your Account : ' + account);
			}
		});

		App.contracts.TickerTokenSale.deployed()
			.then(function (instance) {
				saleContractInstance = instance;
				return saleContractInstance.tokenPrice();
			})
			.then(function (tokenPrice) {
				App.tokenPrice = tokenPrice;
				$('.token-price').html(web3.fromWei(App.tokenPrice, 'ether').toNumber());
				return saleContractInstance.tokenSold();
			})
			.then(function (tokenSold) {
				App.tokenSold = tokenSold.toNumber();
				$('.tokens-sold').html(App.tokenSold);
				$('.tokens-available').html(App.tokensAvailable);

				let progressPercent = (App.tokenSold / App.tokensAvailable) * 100;
				$('#progress').css('width', progressPercent + '%');

				App.contracts.TickerToken.deployed()
					.then(function (instance) {
						contractInstance = instance;
						return contractInstance.balanceOf(App.account);
					})
					.then(function (balance) {
						$('.ticker-balance').html(balance.toNumber());
						App.loading = false;
						$('#loader').hide();
						$('#content').show();
					});
			});
	},

	buyTokens: function () {
		$('#content').hide();
		$('#loader').show();

		const numberOfTokens = $('#numberOfTokens').val();
		App.contracts.TickerTokenSale.deployed()
			.then(function (instance) {
				saleContractInstance = instance;
				return saleContractInstance.buyTokens(numberOfTokens, {
					from: App.account,
					value: numberOfTokens * App.tokenPrice,
					gas: 500000,
				});
			})
			.then(function (result) {
				$('form').trigger('reset');
			});
	},
};

$(function () {
	$(window).load(function () {
		App.init();
	});
});

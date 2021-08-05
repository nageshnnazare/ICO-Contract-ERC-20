# Ticker-Token ICO

## Deploying

### Local deployment

Truffle console:

(Truffle v5.3.5)

`$ truffle console`

`truffle(development)> TickerTokenSale.deployed().then((i)=>{tokenSale = i})`

`truffle(development)> TickerToken.deployed().then((i)=>{token = i})`

`truffle(development)> tokensAvailable = 7500`

`truffle(development)> admin = accounts[0]`

`truffle(development)> token.transfer(tokenSale.address, tokensAvailable, {from:admin})`

`truffle(development)> token.balanceOf(tokenSale.address)`

### Rinkeby Test Network deployment

`geth --rinkeby --rpc --rpcapi="personal,eth,network,web3,net" --ipcpath="~/library/Ethereum/geth.ipc"`

To create a new account:
`geth --rinkeby account new`

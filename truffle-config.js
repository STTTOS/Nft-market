const HDWalletProvider = require('@truffle/hdwallet-provider')
const { mnemonicPhrase, endpoint } = require('./keys.json')

module.exports = {
  networks: {
    // Useful for testing. The `development` name is special - truffle uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like ganache, geth, or parity) in a separate terminal
    // tab if you use this network and you must also set the `host`, `port` and `network_id`
    // options below to some value.
    development: {
      host: '127.0.0.1', // Localhost (default: none)
      port: 7545, // Standard Ethereum port (default: none)
      network_id: '*' // Any network (default: none)
    },
    sepolia: {
      provider: () =>
        new HDWalletProvider(
          mnemonicPhrase,
          endpoint
        ),
      network_id: 11155111,
      gas: 5500000,
      gasPrice: 20000000000,
      confirmations: 2,
      timeoutBlocks: 200
    }
  },
  compilers: {
    solc: {
      version: '0.8.13' // Fetch exact version from solc-bin (default: truffle's version)
    }
  }
}

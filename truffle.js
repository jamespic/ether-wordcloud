module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    dev: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*',
      gasPrice: 20000000000
    },
    live: {
      provider: function () {
        let createLedgerSubprovider = require("@ledgerhq/web3-subprovider").default
        let TransportHID = require("@ledgerhq/hw-transport-node-hid").default
        let ProviderEngine = require("web3-provider-engine")
        let FetchSubprovider = require("web3-provider-engine/subproviders/fetch")
        let engine = new ProviderEngine();
        let getTransport = () => {return TransportHID.create()}
        let ledger = createLedgerSubprovider(getTransport, {accountsLength: 10})
        //var logger = Object.create(require('web3-provider-engine/subproviders/subprovider').prototype)
        //logger.handleRequest = function(payload, next, end) {console.log(payload);next()}
        //engine.addProvider(logger)
        engine.addProvider(ledger)
        engine.addProvider(new FetchSubprovider({rpcUrl: 'http://127.0.0.1:8545'}))
        engine.start()
        engine.sendAsync({id: 1, jsonrpc: '2.0', method: 'net_version', params: []}, (err, res) => {console.error(err); console.log(res)})
        return engine
      },
      network_id: '1',
      gasPrice: 2000000000,
      from: '0x758E53a86224F6511DBcabd9A364E21B4689653F'
    }
  }
};

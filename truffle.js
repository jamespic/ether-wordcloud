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
        let RpcSubprovider = require("web3-provider-engine/subproviders/rpc")
        let engine = new ProviderEngine();
        let getTransport = () => {
          console.log('Getting transport')
          return result
          let result = TransportU2F.create()
        };
        let ledger = createLedgerSubprovider(getTransport, {
          accountsOffset: 1,
          accountsLength: 5
        });
        engine.addProvider(ledger);
        engine.addProvider(new RpcSubprovider({rpcUrl: 'http://127.0.0.1:8545'}));
        engine.start();
        engine.sendAsync({id: 1, jsonrpc: '2.0', method: 'net_version', params: []}, (err, res) => {console.error(err), console.log(res)})
        return engine
      },
      network_id: '1',
      gasPrice: 1000000000
    }
  }
};

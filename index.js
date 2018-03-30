import contract from 'truffle-contract'
import cloud from 'wordcloud'
import Web3 from 'web3'
import ProviderEngine from 'web3-provider-engine'
import RpcSubprovider from "web3-provider-engine/subproviders/rpc"
import FilterSubprovider from "web3-provider-engine/subproviders/filters"
import DefaultFixture from 'web3-provider-engine/subproviders/default-fixture'
import CacheSubprovider from 'web3-provider-engine/subproviders/cache'
import InflightCacheSubprovider from 'web3-provider-engine/subproviders/inflight-cache'

function passiveProvider(rpcUrl = 'https://mainnet.infura.io/yO5rkfBoLWfHKOwQOLc0') {
  let engine = new ProviderEngine()
  engine.addProvider(new DefaultFixture())
  engine.addProvider(new CacheSubprovider())
  engine.addProvider(new FilterSubprovider())
  engine.addProvider(new InflightCacheSubprovider())
  engine.addProvider(new RpcSubprovider({rpcUrl}))
  engine.start()
  return engine
}

document.addEventListener('DOMContentLoaded', (event) => {
  const WordCloud = contract(require('./build/contracts/WordCloud.json'))
  const provider = (window.web3 != null) ? window.web3.currentProvider : passiveProvider()
  const web3 = new Web3(provider)
  WordCloud.setProvider(provider)

  let words = {}
  let updated = false
  setInterval(() => {
    if (updated) {
      let wordList = []
      let totalArea = 0
      for (let word in words) {
        let weight = Math.sqrt(words[word] / word.length)
        totalArea += word.length * weight ** 2
        wordList.push({word, weight})
      }
      cloud(
        document.getElementById('wordcloud'),
        {
          list: wordList,
          drawOutOfBound: true,
          weightFactor: 550 / Math.sqrt(totalArea),
          clearCanvas: true
        }
      )
      updated = false
    }
  }, 1000)

  WordCloud.deployed().then(wordCloud => {
    let eventFilter = wordCloud.WordSizeIncreased([], {fromBlock: 0, toBlock: 'latest'})
    function handleEvent(e) {
      let word = e.args.word
      let newSize = e.args.newSize.toNumber()
      if (!(word in words) || words[word] < newSize) {
        words[word] = newSize
        updated = true
      }
    }

    eventFilter.watch((err, res) => {
      if (err) console.error(err)
      if (res) handleEvent(res)
    })

    document.getElementById('submitButton').addEventListener('click', (event) => {
      web3.eth.getAccounts((err, accs) => {
        if (err) console.log(err)
        else {
          let message = document.getElementById('newWord').value
          let value = Math.floor(parseFloat(document.getElementById('value').value) * 10 ** 18)
          wordCloud.increaseWordSize(message, {value: value, from: accs[0]})
        }
      })
    })
  })


})

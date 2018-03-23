import contract from 'truffle-contract'
import cloud from 'wordcloud'
// import Web3 from 'web3'

document.addEventListener('DOMContentLoaded', (event) => {
  const WordCloud = contract(require('./build/contracts/WordCloud.json'))
  const provider = window.web3.currentProvider
  const web3 = new Web3(provider)
  WordCloud.setProvider(window.web3.currentProvider)

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
    let eventFilter = wordCloud.WordSizeIncreased([], {fromBlock: 0, toBlock: 'pending'})
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
      let message = document.getElementById('newWord').value
      let value = Math.floor(parseFloat(document.getElementById('value').value) * 10 ** 18)
      wordCloud.increaseWordSize(message, {value: value, from: web3.eth.defaultAccount})
    })
  })


})

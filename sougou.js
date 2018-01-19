const axios = require('axios')
const colors = require('colors')
const open = require('open')

const {gameKey} = require('./config')

const timeout = 1000
let lastTitle = ''

async function star () {
  try {
    let {data} = await axios.get('http://140.143.49.31/api/ans2', {
      timeout,
      headers: {
        Referer: 'http://nb.sa.sogou.com/',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 4.4.2; SM-G900F Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Mobile Safari/537.36 SogouSearch Android1.0 version3.0 AppVersion/5909'
      },
      params: {
        key: gameKey,
        wdcallback: 'showResult'
      }
    })
    eval(data)
  } catch (e) {
    console.log(e.red)
  }
  setTimeout(star, timeout)
}

function showResult ({code, result: [, newRes]}) {
  // console.log(newRes)
  if (code === 0) {
    const {title, answers, search_infos, result} = JSON.parse(newRes)
    if (!title || lastTitle === title) {
      return
    }
    lastTitle = title
    search_infos.forEach(({url}) => {
      open(url)
    })
    console.log(title.blue)
    answers.forEach((answer, index) => {
      console.log(`选项${++index}：${answer}`.yellow)
    })
    console.log(`可能性最高的答案为：${result}`.green)
  }
}

star()

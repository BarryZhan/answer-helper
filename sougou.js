const fs = require('fs')

const axios = require('axios')
const colors = require('colors')
const open = require('open')
const {openBrowser, gameKey} = require('./config')

const timeout = 1000
let cache = {}

async function start () {
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
    // console.log(data)
    eval(data)
  } catch (e) {
    console.log(e.red)
  }
  setTimeout(start, timeout)
}

function showResult ({code, result}) {
  // console.log(newRes)
  if (code === 0) {
    result.forEach(item => {
      const res = JSON.parse(item)
      const {title, answers, search_infos, result, cd_id} = res
      if (cache[cd_id]) {
        return
      }
      cache[cd_id] = res
      openBrowser && open('https://www.google.com/search?q=' + title.replace(/^\d{0,2}\.?(\S*?)$/, '$1'))
      console.log('\n' + title.blue)
      answers.forEach((answer, index) => {
        console.log(`选项${++index}：${answer}${result === answer ? '   <= 正确答案'.green : ''}`.yellow)
      })
      search_infos.forEach(({url, summary}) => {
        console.log(summary.replace(new RegExp(`(${answers.join('|')})`, 'g'), '$1'.red))
        // open(url)
      })
    })
  }
}

start()

process.on('exit', () => {
  fs.writeFileSync(`log/${Date.now()}.json`, JSON.stringify(cache, null, 4), 'utf8')
})

process.on('SIGINT', function () {
  process.exit()
})
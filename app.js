const fs = require('fs')
const querystring = require('querystring')

const gm = require('gm')
const axios = require('axios')
const keypress = require('keypress')
const open = require('open')
const colors = require('colors')
const {baidu: {client_id, client_secret}, saveScreenshots, questionArea, optionArea, keyName} = require('./config')

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

const WDAURL = 'http://localhost:8100'
const searchURL = 'http://www.baidu.com/s?wd='

async function getScreenshot () {
  try {
    const result = await axios.get(`${WDAURL}/screenshot`)
    return result.data.value
  } catch (e) {
    console.error(e)
  }
}

let baiduAccessToken = ''

async function getBaiduAccessToken () {
  if (!baiduAccessToken) {
    const res = await axios.get('https://aip.baidubce.com/oauth/2.0/token', {
      params: {
        grant_type: 'client_credentials',
        client_id,
        client_secret
      }
    })
    baiduAccessToken = res.data.access_token
  }
  return baiduAccessToken
}

async function baiduOcr (image) {
  const {data} = await axios.post(`https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${await getBaiduAccessToken()}`,
    querystring.stringify({image})
  )
  return data
}

async function getQuestion () {
  try {
    const [questionImg, optionImg] = await getImage()
    const [{words_result: questionWorld}, {words_result: optionWorld}] = await Promise.all([baiduOcr(questionImg), baiduOcr(optionImg)])
    // 把多行问题合并成一行，并且移除干扰字符
    const question = questionWorld.reduce((str, item) => {
      return str += item.words
    }, '').replace(/^\d{0,2}\.?\s?(\S*?)\??$/, '$1')
    // 获取答案选项
    const option = optionWorld.map((item) => {
      return item.words
    })
    return {question, option}
  } catch (e) {
    console.error(e)
  }
}

function keypressListen () {
  keypress(process.stdin)
  // listen for the "keypress" event
  process.stdin.on('keypress', function (ch, key) {
    // 按空格时启动程序
    if (key.name == keyName) {
      search()
    }
    if (key && key.ctrl && key.name == 'c') {
      process.stdin.pause()
    }
  })

  process.stdin.setRawMode(true)
  process.stdin.resume()
}

function gmPromise (buffer, width, height, x, y) {
  return new Promise(function (resolve, reject) {
    gm(buffer)
      .crop(width, height, x, y)
      .toBuffer('PNG', function (err, buffer) {
        if (err) {
          return reject(new Error(err))
        }
        return resolve(buffer.toString('base64'))
      })
  })
}

async function getImage () {
  const image = await getScreenshot()
  const imgBuf = new Buffer(image, 'base64')
  // 保存截图
  if (saveScreenshots) {
    fs.writeFile(`./resource/${new Date().getTime()}.png`, imgBuf, function (err) {
      if (err) {
        console.log('保存截图失败'.red)
      } else {
        console.log('保存截图成功'.blue)
      }
    })
  }
  const res = await Promise.all([gmPromise.apply(this, [imgBuf, ...questionArea]), gmPromise.apply(this, [imgBuf, ...optionArea])])
  return res
}

function openBrowser ({question}) {
  console.log('\n=== 方法一：直接打开浏览器搜索问题 ===='.yellow)
  open(`${searchURL}${question}`)
  console.log('打开浏览器成功'.green)
}

async function baiduCount ({question, option}) {
  const searchList = await Promise.all(option.map(item => axios.get(encodeURI(searchURL + question + item))))
  console.log('\n=== 方法三：题目+选项搜索结果计数法 ===='.yellow)
  console.log('问题：' + question)
  const result = {}
  searchList.forEach((item, index) => {
    const match = item.data.match(/百度为您找到相关结果约([\d,]*)个/)
    const count = Number(match && match[1].split(',').join('')) || 0
    const key = option[index]
    console.log(`${key}：${count}`)
    result[count] = key
  })
  showResult(result, question)
}

async function baseCount ({question, option}) {
  const {data} = await axios.get(encodeURI(searchURL + question))
  console.log('\n=== 方法二：题目搜索结果包含选项词频计数法 ===='.yellow)
  console.log('问题：' + question)

  const result = {}
  option.forEach((item, index) => {
    const match = data.match(new RegExp(`${item}`, 'g'))
    const count = match && match.length || 0
    const key = option[index]
    console.log(`${key}：${count}`)
    result[count] = key
  })
  showResult(result, question)
}

function showResult (result, question) {
  const invert = /不是|没有/.test(question)
  if (invert) {
    console.log('请注意，本体为否定题，选择结果最少的一项'.red)
  }
  const keys = Object.keys(result)
  const num = invert ? Math.min.apply(null, keys) : Math.max.apply(null, keys)
  if (num < 3) {
    console.log('检索答案过少，请谨慎回答'.red)
    return
  }
  console.log(`最大可能性为：${colors.red(result[num])} 共有 ${colors.green(num)} 个结果`)
}

async function start () {
  try {
    await axios.get(`${WDAURL}/status`)
    console.log('连接 WDA 成功，按空格截图搜索'.green)
    keypressListen()
  } catch (e) {
    console.log('连接 WDA 失败，请检查后重试'.red)
  }
}

async function search () {
  const result = await getQuestion()
  baiduCount(result)
  openBrowser(result)
  baseCount(result)
}

start()

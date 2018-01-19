# 答题辅助
## 使用教程
### 方法1：使用 WDA 截图，用百度 OCR 识别文字后搜索
> *注意*：目前只适配了 mac + ios, 配置较麻烦，推荐使用 [方法2](#方法2调用搜狗答题-api支持百万英雄百万赢家冲顶大会芝士超人)
1. 使用真机调试 WDA，参考 iOS 真机如何安装 [WebDriverAgent · TesterHome](https://testerhome.com/topics/7220)
2. 在[百度平台](https://cloud.baidu.com/product/ocr)上创建应用申请 API Key 和 Secret Key，填写进 `config.js`
3. 修改`config.js` 中的 `questionArea`和`optionArea`调整截图区域
4. 安装程序依赖，在代码目录执行
``` bash
brew install imagemagick
brew install graphicsmagick
npm install
```
5. 执行 `node app.js`
6. 按空格截图识别答案
### 方法2：调用搜狗答题 api，支持百万英雄、百万赢家、冲顶大会、芝士超人
1. 修改 `config.js` 中的 `gameKey` 字段
xigua => 百万英雄
huajiao => 百万赢家
cddh => 冲顶大会
zscr => 芝士超人
2. 执行 `npm install`，等待依赖安装完成
3. 执行 `node sougou.js`，成功后自动推送答案

## 效果图
- 方法1 使用 WDA 截图，用百度 OCR 识别文字后搜索

![方法1](http://p2sipr63m.bkt.clouddn.com/D96DECCC93E9F73E3C06BBE08A0088E7.jpg)

- 方法2 调用搜狗答题 api，支持百万英雄、百万赢家、冲顶大会、芝士超人

![方法2](http://p2sipr63m.bkt.clouddn.com/C3874EF0724E7614589FE810BD5DF0E0.png)




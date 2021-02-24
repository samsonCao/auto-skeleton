const getSkeleton = require('../src/index');

getSkeleton({
  pageUrl: 'https://www.baidu.com',
  openRepeatList: true,
  device: 'iPhone X', // 为空则使用默认 PC 页面打开
  minGrayBlockWidth: 20,
  minGrayPseudoWidth: 5,
  debug: true,
  debugTime: 5000000,
  cookies: [{
    "name": "JSESSIONID",
    "value": "B87DF57057D0645CC0F747C8A0302B0F",
  }],
}).then(result => {
  // console.log(result.html)
})

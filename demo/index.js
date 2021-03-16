const getSkeleton = require('../src/index');

getSkeleton({
  pageUrl: 'https://h5-test.baoyun18.com/m/user/personal?accountId=10001094056&aSign=a7be0d6f4b9f049ec2fe4474ffa7a7a6',
  openRepeatList: true,
  device: 'iPhone X', // 为空则使用默认 PC 页面打开
  minGrayBlockWidth: 15,
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

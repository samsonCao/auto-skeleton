const puppeteer = require('puppeteer');
const {
  sleep,
  genScriptContent,
} = require('./util');

// 默认的无头浏览器 puppeteer/DeviceDescriptors
const desktopDevice = {
  name: 'Desktop 1920x1080',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36',
  viewport: {
    width: 1920,
    height: 1080,
  },
};

const openPage = async options => {
  const browser = await puppeteer.launch({
    headless: !options.debug,
    args: [ '--no-sandbox', '--disable-setuid-sandbox' ],
  });
  // const page = (await browser.pages())[0];
  const device = options.device || desktopDevice;
  const page = await browser.newPage();
  await page.emulate(puppeteer.devices[device]);

  if (options.debug) {
    page.on('console', msg => console.log('PAGE LOG: ', msg.text()));
    page.on('warning', msg => console.log('PAGE WARN: ', JSON.stringify(msg)));
    page.on('error', msg => console.log('PAGE ERR: ', ...msg.args));
  }

  // 设置cookie解决登录问题
  if (options.cookies && options.cookies.length) {
    const allCookise = options.cookies.map(item => {
      const enhanceCookie = { ...item };
      if (!enhanceCookie.url) {
        enhanceCookie.url = options.pageUrl;
      }
      return enhanceCookie;
    });
    await page.setCookie(...allCookise);
    await page.cookies(options.pageUrl);
    await sleep(1000);
  }

  // 打开页面，等所有所有连接都断开再执行下一步
  await page.goto(options.pageUrl, { waitUntil: 'networkidle2' });

  // 给当前页面加入js脚本，执行脚本生成骨架屏
  const scriptContent = await genScriptContent();

  // 把脚本注入将要生成骨架屏的页面去
  await page.addScriptTag({ content: scriptContent });

  // 等待2s 等注入脚本完成，返回浏览器和对应的页面
  await sleep(2000);

  return {
    page,
    browser,
  };
};

module.exports = openPage;

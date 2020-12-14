
const fs = require('fs');

const { saveScreenShot } = require('./saveFile');
const openPage = require('./openPage');
const insertSkeleton = require('./insertSkeleton');
const saveAllHtml = require('./saveAllHtml');
const sleeps = require('./util');
const sleep = sleeps.sleep;

/**
 * 入口  配置文件
 * @param {Object} ''
 * @param {String} options.pageName 页面名
 * @param {String} options.pageUrl 页面的url
 * @param {String} options.outputPath 输出的路径
 * @param {Boolean} options.openRepeatList 默认会将每个列表的第一项进行复制
 * @param {Object} options.device 设备尺寸
 * @param {Number} options.minGrayBlockWidth 最小处理灰色块的宽度
 * @param {Number} options.minGrayBlockHeight 最小处理灰色块的高度，例如1px的带背景色下横线，直接去掉
 * @param {Number} options.minGrayPseudoWidth 最小处理伪类宽
 * @param {Boolean} options.debug 是否开启调试开关
 * @param {Number} options.debugTime 调试模式下，页面停留在骨架图的时间
 */

// 定义默认值
const initOptions = {
  pageName: 'output',
  writeFile: false,
  outputPath: 'skeleton-output',
  openRepeatList: true,
  device: 'iPhone X',
  debug: false,
  debugTime: 0,
  minGrayBlockWidth: 5,
  minGrayBlockHeight: 3,
  minGrayPseudoWidth: 0,
};
const getSkeleton = async function(options) {
  options = {
    ...initOptions,
    ...options,
  };
  // 检查页面地址是否为空
  if (!options.pageUrl) {
    console.warn('页面地址不能为空！');
    return false;
  }

  if (options.writeFile) {
    // 如果没有输出文件的路径，需要自动创建一个
    if (!fs.existsSync(options.outputPath)) {
      fs.mkdirSync(options.outputPath);
    }
  }

  // 打开页面
  const { page, browser } = await openPage(options);

  // 开始生成骨架屏
  await page.evaluate(async options => {
    await window.AutoSkeleton.genSkeleton(options);
  }, options);

  // 截图
  const skeletonImageBase64 = await saveScreenShot(page, options);

  // 获取完整content
  await saveAllHtml(page, options);

  // 插入页面
  const result = insertSkeleton(skeletonImageBase64, options);

  // 关闭浏览器
  await browser.close();

  return result;
};

module.exports = getSkeleton;

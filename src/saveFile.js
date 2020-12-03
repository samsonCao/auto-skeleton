const fs = require('fs');
const path = require('path');
const images = require('images');
const base64Img = require('base64-img');

const saveScreenShot = async (page, options) => {
  // 把内容写入硬盘
  const { pageUrl } = options;
  const fileName = pageUrl.slice(0, pageUrl.indexOf('?')).split('/').slice(-3)
    .join('.');

  // 不需要writeFile 时，直接生成文件
  let screenshotPath = `${fileName}.png`;
  if (options.writeFile) {
    screenshotPath = path.join(options.outputPath, `${fileName}.png`);
  }

  // 首屏截图
  await page.screenshot({
    path: screenshotPath,
  });

  const imgWidth = options.device ? 375 : 1920;
  // 压缩图片
  await images(screenshotPath).size(imgWidth).save(screenshotPath);

  const skeletonImageBase64 = base64Img.base64Sync(screenshotPath);

  const skeletonBase64Path = path.join(options.outputPath, `${fileName}.txt`);
  if (skeletonBase64Path) {
    if (options.writeFile) {
      // 把base64写入文件
      fs.writeFileSync(skeletonBase64Path, skeletonImageBase64, err => {
        if (err) throw err;
        console.log(`The base64-${options.pageName}.txt file has been saved in path '${options.outputPath}' !`);
      });
    }
  }
  return skeletonImageBase64;
};

// 获取页面所有的html
const saveSkeletonHtml = async (page, options) => {
  const skeletonHTMLPath = path.join(options.outputPath, `skeleton-${options.pageName}-all.html`);

  const content = await page.content();

  if (options.writeFile) {
    // 把内容写入硬盘
    fs.writeFileSync(skeletonHTMLPath, content, 'utf8', function(err) {
      if (err) return console.error(err);
    });
  }
  return content;

};

module.exports = {
  saveScreenShot,
  saveSkeletonHtml,
};

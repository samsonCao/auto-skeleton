const fs = require('fs');
const path = require('path');

// 获取页面所有的html
const saveAllHtml = async (page, options) => {
  // 把内容写入硬盘
  const { pageUrl } = options;
  const fileName = pageUrl.slice(0, pageUrl.indexOf('?')).split('/').slice(-3)
    .join('.');

  const skeletonHTMLPath = path.join(options.outputPath, `${fileName}.html`);
  const content = await page.content();

  // 把内容写入硬盘
  if (options.writeFile) {
    fs.writeFileSync(skeletonHTMLPath, content, 'utf8', function(err) {
      if (err) return console.error(err);
    });
  }
};

module.exports = saveAllHtml;

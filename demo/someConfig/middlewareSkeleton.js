const fs = require('fs');
const path = require('path');
const skeletonConfig = require('../../../skeleton.config.json'); // 骨架屏配置项
const genFinal = require('../../../auto-skeleton/src/gen'); // 骨架屏入口

/**
 * 判断url是否有某个参数
 * @param url
 * @param string
 * @returns {boolean}
 */
const hasQuery = (url, string) => {
  return url.indexOf(string) > 0;
};

/**
 * url转为文件名称：以m.productForMixin.list.html命名的html文件
 * /m/productForMixin/list?userId=1173783329200144789 => m.productForMixin.list
 * @param url
 * @returns {string}
 *
 */
const formatSlashToDot = (url) => {
  return url
    .split('/')
    .slice(-3)
    .join('.');
};

// 这是个express中间件
export default function (app) {
  app.use(async (req, res, next) => {
    const { url, headers } = req;

    // 如果url中有标记skeleton字段，表示是第二次打开链接，不再执行生成骨架屏逻辑
    if (hasQuery(url, 'skeleton')) {
      next();
      return;
    }
    let pagePath = null;

    // 根据是否有？处理参数
    if (hasQuery(url, '?')) {
      pagePath = formatSlashToDot(url.slice(0, url.indexOf('?')));
    } else {
      pagePath = formatSlashToDot(url);
    }

    const outputFile = skeletonConfig.outputFile || 'skeleton-output';
    const folder = path.join(process.cwd(), outputFile);
    try {
      // 判断是否已生成了骨架屏html
      await fs.readFile(`${folder}/${pagePath}.html`, 'utf-8', (err, data) => {
        // 已生成，读取骨架屏代码dom，塞入模板的html中
        if (!err) {
          res.locals.html = data;
        } else if (!hasQuery(url, 'null')) {
          // 还没有生成骨架屏，去生成，先处理url
          let pageUrl = `${headers.host}${url}`;
          if (!hasQuery(pageUrl, 'http')) {
            pageUrl = `http://${pageUrl}`;
          }
          // url标记skeleton参数
          pageUrl = hasQuery(pageUrl, '?')
            ? `${pageUrl}&skeleton=skeleton`
            : `${pageUrl}?skeleton=skeleton`;

          // 执行核心的生成逻辑
          skeletonConfig.pageUrl = pageUrl;
          genFinal(skeletonConfig);
        }
        next();
      });
    } catch (e) {
      next();
    }
  });
}

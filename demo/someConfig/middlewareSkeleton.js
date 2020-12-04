const fs = require('fs');
const path = require('path');
const request = require('request');

/**
 * 递归创建目录
 */
const makeDirs = async (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    await fs.mkdirSync(dirPath);
  }
  return Promise.resolve();
};

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

const formatStringHasQuery = (str) => {
  // 根据是否有？处理参数
  if (hasQuery(str, '?')) {
    return formatSlashToDot(str.slice(0, str.indexOf('?')));
  }
  return formatSlashToDot(str);
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

    const pagePath = formatStringHasQuery(url);

    const folder = path.join(process.cwd(), 'skeleton-output');
    try {
      // 判断是否已生成了骨架屏html
      await fs.readFile(
        `${folder}/${pagePath}.html`,
        'utf-8',
        async (err, data) => {
          // 已生成，读取骨架屏代码dom，塞入模板的html中
          if (!err) {
            res.locals.skeleton = data;
            next();
          } else if (!hasQuery(url, 'null')) {
            // 还没有生成骨架屏，去生成，先处理url
            next();

            let pageUrl = `${headers.host}${url}`;
            if (!hasQuery(pageUrl, 'http')) {
              pageUrl = `http://${pageUrl}`;
            }
            // url标记skeleton参数
            pageUrl = hasQuery(pageUrl, '?')
              ? `${pageUrl}&skeleton=skeleton`
              : `${pageUrl}?skeleton=skeleton`;
            const options = {
              url: 'http://127.0.0.1:7001/skeleton/getContentByUrl',
              method: 'POST',
              json: true,
              body: {
                pageUrl,
              },
            };
            request(options, async (err2, result) => {
              if (err2) {
                console.log(`options-request-error: ${err2}`);
                return;
              }
              const resData = result.body;
              if (String(resData.code) === '0') {
                await makeDirs(folder);
                const content = result.body.content.html;
                fs.writeFileSync(
                  `${folder}/${pagePath}.html`,
                  content,
                  'utf8',
                  (err3) => {
                    if (err3) {
                      console.error(`options-response-error: ${err3}`);
                    }
                  },
                );
              }
            });
          }
        },
      );
    } catch (e) {
      next();
    }
  });
}

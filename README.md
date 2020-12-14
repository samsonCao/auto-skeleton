## 说明
* 骨架图生成组件，仅限node端使用。该组件提供骨架图生成能力。
* 骨架图生成逻辑：通过传入页面地址，使用 Puppeteer 无头浏览器打开页面地址，对页面首屏图片和文本等节点进行灰色背景处理，然后对页面首屏进行截图，生成压缩后的 base64 png 图片。

## 使用方法

### 添加配置文件

skeleton.config.json:

```json
{
  "pageName": "mySkeletonPage",
  "pageUrl": "https://www.baidu.com",
  "openRepeatList": false,
  "device": "iPhone X",
  "minGrayBlockWidth": 80,
  "minGrayPseudoWidth": 10,
  "debug": true,
  "debugTime": 3000,
  "writeFile": true,
  "cookies": [
    {
      "domain": ".baidu.com",
      "expirationDate": 1568267131.555328,
      "hostOnly": false,
      "httpOnly": false,
      "name": "BDORZ",
      "path": "/",
      "sameSite": "unspecified",
      "secure": false,
      "session": false,
      "storeId": "0",
      "value": "yyyyyyyyy",
      "id": 2
    }
  ]
}
```

### 全局生成骨架屏

```bash
$ skeleton -c ./skeleton.config.json
```

页面 DomReady 之后，会在页面顶部出现红色按钮：开始生成骨架屏。

生成完成后，会在运行目录生成 skeleton-output 文件件，里面包括骨架屏 png 图片、base64 文本、html 文件：
- base64-baidu.png # 骨架图图片
- base64-baidu.txt # 骨架图 Base64 编码
- base64-baidu.html # 最终生成 HTML

其中 html 文件可以直接拿来用，复制下面位置：

```html
<html>
  <head>
    <!--- 骨架屏代码 -->
  </head>
</html>
```

注意：
- 骨架图默认在 onload 事件后销毁。
- 手动销毁方式：

```js
window.SKELETON && SKELETON.destroy();
```

**当然，你也可以在项目中直接使用生成的 Base64 图片**

### 项目中生成骨架屏

在 package.json 中添加脚本：

```json
"scripts": {
  "skeleton": "skeleton -c ./skeleton.config.json"
}
```

生成骨架屏：

```bash
$ npm run skeleton
```

### 解决登录态

如果页面需要登录，则需要下载 Chrome 插件 [EditThisCookie](https://chrome.google.com/webstore/detail/editthiscookie/fngmhnnpilhplaeedifhccceomclgfbg)，将 Cookie 复制到配置参数中。

## 参数

| 参数名称 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- |
| pageUrl | 是 | - | 页面地址（此地址必须可访问） |
| pageName | 否 | output | 页面名称（仅限英文） |
| cookies | 否 |  | 页面 Cookies，用来解决登录态问题 |
| writeFile | 否 | false | 是否写入文件(在当前引用骨架屏插件的文件生成一个文件夹，自动存放骨架屏数据)
| outputPath | 否 | skeleton-output | 骨架图文件输出文件夹路径，默认到项目 skeleton-output 中 |
| removeBodySkeletonClass | 否 | - | 生成骨架屏html时指定的body第一个child的class类名，用于删除骨架屏|
| openRepeatList | 否 | true | 默认会将每个列表的第一项进行复制 |
| device | 否 | iPhone X | 参考 puppeteer/DeviceDescriptors.js，可以设置为 'iPhone 6 Plus' |
| debug | 否 | false | 是否开启调试开关 |
| debugTime | 否 | 0 | 调试模式下，页面停留在骨架图的时间 |
| minGrayBlockWidth | 否 | 0 | 最小处理灰色块的宽度 |
| minGrayPseudoWidth | 否 | 0 | 最小处理伪类宽 |

## dom 节点属性

这是获取优质骨架图的要点，通过设置以下几个 dom 节点属性，在骨架图中对某些节点进行移除、忽略和指定背景色的操作，去除冗余节点的干扰，从而使得骨架图效果达到最佳。

| 参数名称 | 说明 |
| --- | --- |
| data-skeleton-remove | 指定进行移除的 dom 节点属性 |
| data-skeleton-bgcolor | 指定在某 dom 节点中添加的背景色 |
| data-skeleton-ignore | 指定忽略不进行任何处理的 dom 节点属性 |
| data-skeleton-empty | 将某dom的innerHTML置为空字符串 |

示例：

```html
<div data-skeleton-remove><span>abc</span></div>
<div data-skeleton-bgcolor="#EE00EE"><span>abc</span></div>
<div data-skeleton-ignore><span>abc</span></div>
<div data-skeleton-empty><span>abc</span></div>
```

### 安装依赖

```bash
$ ghttps://github.com/samsonCao/auto-skeleton.git
$ cd auto-skeleton && npm i
```

### 运行项目

由于生成骨架图的代码是通过动态脚本插入的，所以需要通过 rollup 将 src/script 中的代码打包到 src/script/dist/index.js 中。首先启动 rollup 打包

```bash
$ npm run dev
```

修改 demo/index.js 中的配置，从而生成不同页面的骨架图：

```bash
$ cd demo
$ node index.js
```


#### 高级玩法
1. 基于node新建一个服务
2. 在node服务中通过npm包的形式引用 `auto-skeleton`
3. 开发一个接口接收请求到的url和options，在node服务中生成骨架屏
4. 把骨架屏返回给调用接口的地方。调用方可以是基于express开发的中间件，结合自己的项目使用中间件把骨架屏返回给前端html模板。
> 基于egg开发的骨架屏服务器，示例代码如下
```jsx harmony
'use strict';

const Controller = require('egg').Controller;
const getSkeleton = require('auto-skeleton');
const initOptions = {
  pageName: 'mySkeletonPage',
  pageUrl: '',
  openRepeatList: true,
  device: 'iPhone X',
  minGrayBlockWidth: 50,
  minGrayPseudoWidth: 10,
  writeFile: false,
  debug: false,
  debugTime: 100000,
  cookies: [],
};

class SkeletonController extends Controller {
  async getContentByUrl() {
    try {
      const { ctx } = this;
      const { pageUrl, options } = ctx.request.body;
      options.pageUrl = pageUrl;
      const finalOptions = {
        ...initOptions,
        ...options,
      };
      const res = await getSkeleton(finalOptions);
      ctx.body = {
        code: '0',
        content: {
          ...res,
          message: '骨架屏生成成功，感谢使用',
        },
      };
    } catch (e) {
      this.body = {
        code: '500',
        content: { message: '生成失败，请重试' },
      };
    }
  }
}

module.exports = SkeletonController;

```

> 基于express开发的根据url请求骨架屏的中间件
```jsx harmony
const fs = require('fs');
const path = require('path');
const request = require('request');
const skeletonConfig = require('../../../skeleton.config.json'); // 骨架屏配置项

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
export default async (req, res, next) => {
  res.locals.skeleton = '';
  const { url, headers } = req;
  // 如果url中有标记skeleton字段，表示是从生成骨架屏打开的链接，阻止循环调用
  if (hasQuery(url, 'skeleton')) {
    next();
    return;
  }
 
  const pagePath = formatStringHasQuery(url);
 
  const folder = path.join(process.cwd(), 'skeleton-output');
 
  const createSkeletonFunc = () => {
    let pageUrl = `${headers.host}${url}`;
    // 这里还需要再斟酌一下。看是否需要这个判断，判读是否合理。
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
        options: {
          removeBodySkeletonClass: 'remove-body-skeleton',
        },
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
  };
 
  try {
    /**
     * 如果链接有参数 createSkeletonAgain，再生成一次，覆盖之前的。
     * 如果用户自动生成的不合适，开发者可以手动输入链接，再生成一次
     */
    if (hasQuery(url, 'createSkeletonAgain')) {
      next();
      createSkeletonFunc();
      return;
    }
    // 判断是否已生成了骨架屏html
    await fs.readFile(
      `${folder}/${pagePath}.html`,
      'utf-8',
      async (err, data) => {
        // 已生成，读取骨架屏代码dom，塞入模板的html中
        if (!err) {
          // 会在res.render注入
          res.locals.skeleton = data;
          next();
        } else if (!hasQuery(url, 'null')) {
          // 重定向304或者爬虫robot会出现null。
          next();
          createSkeletonFunc();
        } else {
          // 会在res.render注入
          next();
        }
      },
    );
  } catch (e) {
    next();
  }
};


```

- 参考： https://github.com/kaola-fed/awesome-skeleton

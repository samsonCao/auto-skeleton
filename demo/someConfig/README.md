这是一个配置文件

- skeleton.config.json用于配置骨架屏
- template.html是单页应用的html页面
- middlewareSkeleton.js是配置骨架屏的服务端中间件，如果是express静态服务器，
直接在代码中引入中间件即可生效

#### 高级玩法
1. 基于node新建一个服务
2. 在node服务中通过npm包的形式引用 `auto-skeleton`
3. 开发一个接口接收请求到的url和options，在node服务中生成骨架屏
4. 把骨架屏返回给调用接口的地方
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

##### 运行demo的方法

1. 启动服务 npm run dev
2. 进入文件 `demo/`
3. 运行命令 `node index.js`

此时可以看到百度被无头浏览器打开，然后可以看到骨架屏生成。



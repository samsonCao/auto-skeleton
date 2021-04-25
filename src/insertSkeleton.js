const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier');

// 把骨架屏插入模板
const insertSkeleton = (skeletonImageBase64, options) => {
  // 把内容写入硬盘
  const autoHTMLPath = path.join(process.cwd(), options.outputPath);
  const { pageUrl } = options;
  let { xhrTypeList } = options;
  if (!xhrTypeList) {
    xhrTypeList = [ 'xhr', 'fetch', 'xmlhttprequest' ];
  }
  const fileName = pageUrl.slice(0, pageUrl.indexOf('?')).split('/').slice(-3)
    .join('.');

  if (!skeletonImageBase64) {
    console.warn('还没生成骨架屏');
    return false;
  }

  const removeBodySkeletonClass = options.removeBodySkeletonClass;

  const skeletonClass = 'skeleton-remove-after-first-request';

  const content = `
    <style>
      @keyframes flush {
        0% {
          left: -100%;
        }
        50% {
          left: 0;
        }
        100% {
          left: 100%;
        }
      }
    </style>
    <div class="${skeletonClass}" style="
      animation: flush 2s linear infinite;
      position: absolute;
      top: 0;
      bottom: 0;
      width: 100%;
      z-index: 9999;
      background: linear-gradient(to left,
        rgba(255, 255, 255, 0) 0%,
        rgba(255, 255, 255, .85) 50%,
        rgba(255, 255, 255, 0) 100%);
    "></div>
    <div class="${skeletonClass}" style="
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9998;
      background-repeat: no-repeat !important;
      background-size: ${options.device ? '100% auto' : '1920px 1080px'} !important;
      background-image: url(${skeletonImageBase64}) !important;
      background-color: #FFFFFF !important;
      background-position: center 0 !important;
    "></div>
    <script class="${skeletonClass}">
      // Define hooks
      window.SKELETON = {
        destroy: function () {
          // 自定义需要删除的class类。
          var removeBodySkeleton = Array.from(document.body.querySelectorAll('.${removeBodySkeletonClass}'));
          if (removeBodySkeleton && removeBodySkeleton.length > 0) {
            document.body.removeChild(removeBodySkeleton[0]);
          } else {
            var removes = Array.from(document.body.querySelectorAll('.${skeletonClass}'));
            removes && removes.map(function(item){
              document.body.removeChild(item);
            });
          }
        }
      };

      function hook(proxy) {
        var realXhr = "_rxhr";
        window[realXhr] = window[realXhr] || XMLHttpRequest;
        XMLHttpRequest = function () {
          var xhr = new window[realXhr]();
          for (var attr in xhr) {
            var type = "";
            try {
              type = typeof xhr[attr];
            } catch (e) {
              window.SKELETON && SKELETON.destroy();
            }
            if (type === "function") {
              this[attr] = hookFunction(attr);
            } else {
              Object.defineProperty(this, attr, {
                get: getterFactory(attr),
                set: setterFactory(attr),
                enumerable: true
              });
            }
          }
          this.xhr = xhr;
        };
    
        function configEvent(event, xhrProxy) {
          var e = {};
          for (var attr in event) e[attr] = event[attr];
          e.target = e.currentTarget = xhrProxy;
          return e;
        }
    
        function getterFactory(attr) {
          return function () {
            var v = this.hasOwnProperty(attr + "_") ? this[attr + "_"] : this.xhr[attr];
            var attrGetterHook = (proxy[attr] || {})["getter"];
            return (attrGetterHook && attrGetterHook(v, this)) || v;
          };
        }
    
        function setterFactory(attr) {
          return function (v) {
            var xhr = this.xhr;
            var that = this;
            var hook = proxy[attr];
            if (attr.substring(0, 2) === "on") {
              that[attr + "_"] = v;
              xhr[attr] = function (e) {
                e = configEvent(e, that);
                var ret = proxy[attr] && proxy[attr].call(that, xhr, e);
                ret || v.call(that, e);
              };
            } else {
              var attrSetterHook = (hook || {})["setter"];
              v = (attrSetterHook && attrSetterHook(v, that)) || v;
              this[attr + "_"] = v;
              try {
                xhr[attr] = v;
              } catch (e) {}
            }
          };
        }
    
        function hookFunction(fun) {
          return function () {
            var args = [].slice.call(arguments);
            if (proxy[fun]) {
              var ret = proxy[fun].call(this, args, this.xhr);
              if (ret) return ret;
            }
            return this.xhr[fun].apply(this.xhr, args);
          };
        }
    
        return window[realXhr];
      }

      hook({
        //拦截回调
        onreadystatechange: function (xhr, event) {
          console.log(xhr.readyState);
          if (xhr.readyState === 4 && xhr.status === 200) {
            window.SKELETON && SKELETON.destroy();
          }
          //返回false表示不阻断，拦截函数执行完后会接着执行真正的xhr.onreadystatechange回调.
          return false;
        },
        onload: function (xhr, event) {
          window.SKELETON && SKELETON.destroy();
          return false;
        }
      });
    
      // 如果页面中没有ajax，在onload中关闭骨架屏
      window.addEventListener("load", function () {
        window.SKELETON && SKELETON.destroy();
      });
    </script>`;

  // 压缩css js 去掉注释
  const minifyContent = minify(content, {
    minifyCSS: true,
    minifyJS: true,
    removeComments: true,
  });

  if (options.writeFile) {
    // 把内容写入硬盘 写入的是压缩的css js内容
    fs.writeFileSync(`${autoHTMLPath}/${fileName}.html`, minifyContent, 'utf8', err => {
      if (err) return console.error(err);
    });
  }

  return {
    minHtml: minifyContent,
    html: content,
    img: skeletonImageBase64,
  };
};

module.exports = insertSkeleton;

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
    xhrTypeList = ['xhr', 'fetch', 'xmlhttprequest']
  };
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
      
      var loopStatus = true;
      var initiatorTypeList = ['xhr', 'fetch', 'xmlhttprequest'];
      function destroyOnLoad(time) {
        window.addEventListener("load", function () {
          setTimeout(function () {
            loopStatus = false;
            window.SKELETON && SKELETON.destroy();
          }, time);
        });
      }
      function hasSameType(list, valueToFind) {
        var len = list.length >>> 0;
        var len = list.length >>> 0;
        if (len === 0) return false;
        function sameValueZero(x, y) {
            return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
        }
        var k = 0;

        while (k < len) {
          if (sameValueZero(list[k], valueToFind)) {
            return true;
          }
          k++;
        }
        return false;
      }
      function destroyLoop() {
        if (loopStatus) {
          var entries = window.performance.getEntries();
          for (let i = 0; i < entries.length; i++) {
            if (hasSameType(initiatorTypeList, entries[i].initiatorType)) {
              loopStatus = false;
              window.SKELETON && SKELETON.destroy();
            }
          }
          window.requestAnimationFrame(destroyLoop);
        }
      }
      if (window.requestAnimationFrame && window.performance) {
        // 有ajax时，在循环中判断是否有ajax请求返回，有的话直接显示内容
        window.requestAnimationFrame(destroyLoop);
      } else {
        destroyOnLoad(0);
      }
      // 如果接口没有ajax,直接在onload后清空
      destroyOnLoad(0);
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

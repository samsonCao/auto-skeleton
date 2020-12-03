const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier');

// 把骨架屏插入模板
const insertSkeleton = (skeletonImageBase64, options) => {
  // 把内容写入硬盘
  const autoHTMLPath = path.join(process.cwd(), options.outputPath);
  const { pageUrl } = options;
  const fileName = pageUrl.slice(0, pageUrl.indexOf('?')).split('/').slice(-3)
    .join('.');

  if (!skeletonImageBase64) {
    console.warn('还没生成骨架屏');
    return false;
  }

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
        destroy: function () { // Manually destroy the skeleton
          var removes = Array.from(document.body.querySelectorAll('.${skeletonClass}'));
          removes && removes.map(function(item){
            document.body.removeChild(item);
          });
        }
      };

      // destroy after the onload event by default
      // window.addEventListener('load', function(){
      //   setTimeout(function(){
      //     window.SKELETON && SKELETON.destroy()
      //   }, 0);
      // });
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

  console.log('minifyContent');

  return {
    minHtml: minifyContent,
    html: content,
    img: skeletonImageBase64,
  };
};

module.exports = insertSkeleton;

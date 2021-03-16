(function () {
  'use strict';

  // 暂停函数 用于调试debug
  const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  // 判断当前dom是否在视窗
  const inViewPort = ele => {
    try {
      const rect = ele.getBoundingClientRect();
      return rect.top < window.innerHeight &&
        rect.left < window.innerWidth;

    } catch (e) {
      return true;
    }
  };

  // 判断节点是否有某个属性
  const hasAttr = (ele, attr) => {
    try {
      return ele.hasAttribute(attr);
    } catch (e) {
      return false;
    }
  };

  // 设置节点透明
  const setOpacity = ele => {
    if (ele.style) {
      ele.style.opacity = 0;
    }
  };

  // 单位转换 px -> rem
  const px2rem = px => {
    const pxValue = typeof px === 'string' ? parseInt(px, 10) : px;
    const htmlElementFontSize = getComputedStyle(document.documentElement).fontSize;

    return `${(pxValue / parseInt(htmlElementFontSize, 10))}rem`;
  };

  // 批量设置节点属性，多个节点的批量处理
  const setAttributes = (ele, attrs) => {
    Object.keys(attrs).forEach(k => ele.setAttribute(k, attrs[k]));
  };

  // 删除节点
  const removeElement = ele => {
    const parent = ele.parentNode;
    if (parent) {
      parent.removeChild(ele);
    }
  };

  // 判断节点是否有伪类，有的话返回伪类和对应宽度，没有返回false
  const checkHasPseudoEle = ele => {
    if (!ele) return false;

    const beforeComputedStyle = getComputedStyle(ele, '::before');
    const beforeContent = beforeComputedStyle.getPropertyValue('content');
    const beforeWidth = parseFloat(beforeComputedStyle.getPropertyValue('width'), 10) || 0;
    const hasBefore = beforeContent && beforeContent !== 'none';

    const afterComputedStyle = getComputedStyle(ele, '::after');
    const afterContent = afterComputedStyle.getPropertyValue('content');
    const afterWidth = parseFloat(afterComputedStyle.getPropertyValue('width'), 10) || 0;
    const hasAfter = afterContent && afterContent !== 'none';

    const width = Math.max(beforeWidth, afterWidth);

    if (hasBefore || hasAfter) {
      return { hasBefore, hasAfter, ele, width };
    }
    return false;
  };

  // 骨架屏主色调
  const MAIN_COLOR = '#EEEEEE';
  const MAIN_COLOR_RGB = 'rgb(238, 238, 238)';

  // 伪类样式 class
  const PSEUDO_CLASS = 'sk-pseudo';

  // 按钮样式 class
  const BUTTON_CLASS = 'sk-button';

  // 透明样式 class
  const TRANSPARENT_CLASS = 'sk-transparent';

  // 一像素的透明图片base64
  const SMALLEST_BASE64 = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  // 文本样式class
  const SKELETON_TEXT_CLASS = 'skeleton-text-block-mark';

  // 列表的tag
  const LIST_ITEM_TAG = [ 'LI', 'DT', 'DD', 'DIV' ];

  function aHandler(node) {
    node.removeAttribute('href');
  }

  function svgHandler(node) {
    const { width, height } = node.getBoundingClientRect();

    if (width === 0 || height === 0 || node.getAttribute('aria-hidden') === 'true') {
      return removeElement(node);
    }

    node.innerHTML = '';

    Object.assign(node.style, {
      width: px2rem(parseInt(width)),
      height: px2rem(parseInt(height)),
    });
  }

  function imgHandler(node) {
    const { width, height } = node.getBoundingClientRect();

    setAttributes(node, {
      width,
      height,
      src: SMALLEST_BASE64,
    });

    node.style.backgroundColor = MAIN_COLOR;
  }

  function buttonHandler(node) {
    if (!node.tagName) return;

    node.classList.add(BUTTON_CLASS);

    let { backgroundColor: bgColor, width, height } = getComputedStyle(node);

    bgColor = bgColor === 'rgba(0, 0, 0, 0)' ? MAIN_COLOR : bgColor;

    node.style.backgroundColor = bgColor;
    node.style.color = bgColor;
    node.style.borderColor = bgColor;
    node.style.width = width;
    node.style.height = height;

    node.innerHTML = '';
  }

  function getTextWidth(ele, style) {
    const MOCK_TEXT_ID = 'skeleton-text-id';
    let offScreenParagraph = document.querySelector(`#${MOCK_TEXT_ID}`);
    if (!offScreenParagraph) {
      const wrapper = document.createElement('p');
      offScreenParagraph = document.createElement('span');
      Object.assign(wrapper.style, {
        width: '10000px',
        position: 'absolute',
        top: '0',
      });
      offScreenParagraph.id = MOCK_TEXT_ID;
      offScreenParagraph.style.visibility = 'hidden';
      wrapper.appendChild(offScreenParagraph);
      document.body.appendChild(wrapper);
    }
    Object.assign(offScreenParagraph.style, style);
    ele.childNodes && setStylesInNode(ele.childNodes);
    offScreenParagraph.innerHTML = ele.innerHTML;
    return offScreenParagraph.getBoundingClientRect().width;
  }

  function setStylesInNode(nodes) {
    Array.from(nodes).forEach(node => {
      if (!node || !node.tagName) return;
      const comStyle = getComputedStyle(node);
      Object.assign(node.style, {
        marginLeft: comStyle.marginLeft,
        marginRight: comStyle.marginRight,
        marginTop: comStyle.marginTop,
        marginBottom: comStyle.marginBottom,
        paddingLeft: comStyle.paddingLeft,
        paddingRight: comStyle.paddingRight,
        paddingTop: comStyle.paddingTop,
        paddingBottom: comStyle.paddingBottom,
        fontSize: comStyle.fontSize,
        lineHeight: comStyle.lineHeight,
        position: comStyle.position,
        textAlign: comStyle.textAlign,
        wordSpacing: comStyle.wordSpacing,
        wordBreak: comStyle.wordBreak,
        dispaly: comStyle.dispaly,
        boxSizing: comStyle.boxSizing,
      });

      if (node.childNodes) {
        setStylesInNode(node.childNodes);
      }
    });
  }

  function addTextMask(paragraph, {
    textAlign,
    lineHeight,
    paddingBottom,
    paddingLeft,
    paddingRight,
  }, maskWidthPercent = 0.5) {

    let left;
    let right;
    switch (textAlign) {
      case 'center':
        left = document.createElement('span');
        right = document.createElement('span');
        [ left, right ].forEach(mask => {
          Object.assign(mask.style, {
            display: 'inline-block',
            width: `${maskWidthPercent / 2 * 100}%`,
            height: lineHeight,
            background: '#fff',
            position: 'absolute',
            bottom: paddingBottom,
          });
        });
        left.style.left = paddingLeft;
        right.style.right = paddingRight;
        paragraph.appendChild(left);
        paragraph.appendChild(right);
        break;
      case 'right':
        left = document.createElement('span');
        Object.assign(left.style, {
          display: 'inline-block',
          width: `${maskWidthPercent * 100}%`,
          height: lineHeight,
          background: '#fff',
          position: 'absolute',
          bottom: paddingBottom,
          left: paddingLeft,
        });
        paragraph.appendChild(left);
        break;
      case 'left':
      default:
        right = document.createElement('span');
        Object.assign(right.style, {
          display: 'inline-block',
          width: `${maskWidthPercent * 100}%`,
          height: lineHeight,
          background: '#fff',
          position: 'absolute',
          bottom: paddingBottom,
          right: paddingRight,
        });
        paragraph.appendChild(right);
        break;
    }
  }

  function handleTextStyle(ele, width) {
    const comStyle = getComputedStyle(ele);
    let {
      lineHeight,
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      position: pos,
      fontSize,
      textAlign,
      wordSpacing,
      wordBreak,
    } = comStyle;
    if (!/\d/.test(lineHeight)) {
      const fontSizeNum = parseInt(fontSize, 10) || 14;
      lineHeight = `${fontSizeNum * 1.4}px`;
    }

    const position = [ 'fixed', 'absolute', 'flex' ].find(p => p === pos) ? pos : 'relative';

    const height = ele.offsetHeight;
    // 计算有多少行
    let lineCount = (height - parseFloat(paddingTop, 10) - parseFloat(paddingBottom, 10)) / parseFloat(lineHeight, 10) || 0;

    lineCount = lineCount < 1.5 ? 1 : lineCount;

    const textHeightRatio = 0.6; // Default

    // 添加文本class标识
    ele.classList.add(SKELETON_TEXT_CLASS);

    Object.assign(ele.style, {
      backgroundImage: `linear-gradient(
        transparent ${(1 - textHeightRatio) / 2 * 100}%,
        ${MAIN_COLOR} 0%,
        ${MAIN_COLOR} ${((1 - textHeightRatio) / 2 + textHeightRatio) * 100}%,
        transparent 0%
      )`,
      backgroundSize: `100% ${px2rem(parseInt(lineHeight) * 1.1)}`,
      position,
    });

    // 增加白色蒙版
    if (lineCount > 1) {
      addTextMask(ele, Object.assign(JSON.parse(JSON.stringify(comStyle)), {
        lineHeight,
      }));
    } else {
      const textWidth = getTextWidth(ele, {
        fontSize,
        lineHeight,
        wordBreak,
        wordSpacing,
      });
      const textWidthPercent = textWidth / (width - parseInt(paddingRight, 10) - parseInt(paddingLeft, 10));
      ele.style.backgroundSize = `${textWidthPercent * 100}% 100%`;
      switch (textAlign) {
        case 'left':
          break;
        case 'right':
          ele.style.backgroundPositionX = '100%';
          break;
        case 'center':
          ele.style.backgroundPositionX = '50%';
          break;
      }
    }
  }

  function textHandler(ele, options) {
    const {
      width,
      height,
    } = ele.getBoundingClientRect();

    // 宽度小于预设的最小块宽度时直接设置为透明
    const minGrayBlockWidth = options.minGrayBlockWidth || 5;
    if (width <= minGrayBlockWidth) {
      return setOpacity(ele);
    }

    const minGrayBlockHeight = options.minGrayBlockHeight || 3;
    if (height <= minGrayBlockHeight) {
      return setOpacity(ele);
    }

    // 如果是按钮，直接按照按钮的逻辑处理
    const isBtn = /(btn)|(button)/g.test(ele.getAttribute('class'));
    if (isBtn) {
      return buttonHandler(ele);
    }

    // 设置文本样式
    handleTextStyle(ele, width);
  }

  const listHandler = (node, options) => {
    if (!options.openRepeatList || !node.children.length) return;

    const { children } = node;
    const len = Array.from(children).filter(child => LIST_ITEM_TAG.indexOf(child.tagName) > -1).length;

    if (len === 0) return false;

    const firstChild = children[0];
    // 解决有些UL下面不是li的情况
    if (LIST_ITEM_TAG.indexOf(firstChild.tagName) === -1) {
      return listHandler(firstChild, options);
    }

    // 只保留第一个li
    Array.from(children).forEach((li, index) => {
      if (index > 0) {
        removeElement(li);
      }
    });

    // 其它li的的节点设置为和当前li一样，保证所有li的一致性
    for (let i = 1; i < len; i++) {
      node.appendChild(firstChild.cloneNode(true));
    }
  };

  function emptyHandler(node) {
    node.innerHTML = '';

    let classNameArr = node.className && node.className.split(' ');
    classNameArr = classNameArr.map(item => {
      return '.' + item;
    });
    const className = classNameArr.join('');
    const id = node.id ? '#' + node.id : '';
    const query = className || id;

    if (!query) return;

    let styleSheet;

    /**
     * styleSheet.href属性的功能:
     * 此属性用于返回样式表中的href属性值，此属性值是一个只读属性,
     * 当styleSheet对象所对应的为style标签时,则返回null
     * 返回link引入css的href属性值
     */
    for (const item of document.styleSheets) {
      if (!item.href) {
        styleSheet = item;
        return;
      }
    }

    try {
      styleSheet && styleSheet.insertRule(`${query}::before{content:'' !important;background:none !important;}`, 0);
      styleSheet && styleSheet.insertRule(`${query}::after{content:'' !important;background:none !important;}`, 0);
    } catch (e) {
      console.log('handleEmptyNode Error: ', JSON.stringify(e));
    }
  }

  // 预设一些基础类的样式
  function styleHandler() {
    const skeletonBlockStyleEle = document.createElement('style');

    skeletonBlockStyleEle.innerText = `
    .${SKELETON_TEXT_CLASS},
    .${SKELETON_TEXT_CLASS} * {
      background-origin: content-box;
      background-clip: content-box;
      background-color: transparent !important;
      color: transparent !important;
      background-repeat: repeat-y;
    }

    .${PSEUDO_CLASS}::before,
    .${PSEUDO_CLASS}::after {
      background: ${MAIN_COLOR} !important;
      background-image: none !important;
      color: transparent !important;
      border-color: transparent !important;
      border-radius: 0 !important;
    }

    .${BUTTON_CLASS} {
      box-shadow: none !important;
    }

    .${TRANSPARENT_CLASS}::before,
    .${TRANSPARENT_CLASS}::after {
      opacity: 0 !important;
    }
  `.replace(/\n/g, '');

    document.body.prepend(skeletonBlockStyleEle);
  }

  function inputHandler(node) {
    node.removeAttribute('placeholder');
    node.value = '';
  }

  function scriptHandler(node) {
    removeElement(node);
  }

  function pseudoHandler(node, options) {
    if (!node.tagName) return;

    const pseudo = checkHasPseudoEle(node);

    if (!pseudo || !pseudo.ele) return;

    const { ele, width } = pseudo;

    // 伪类宽度小于预设的宽度时，直接设置为透明隐藏
    if (width < options.minGrayPseudoWidth) {
      return ele.classList.add(TRANSPARENT_CLASS);
    }

    ele.classList.add(PSEUDO_CLASS);
  }

  function beforeHandler(node, options) {
    if (!node.tagName) return;

    // 处理空节点
    if (hasAttr(node, 'data-skeleton-empty')) {
      emptyHandler(node);
    }

    // 小于最小块儿预设宽度时，设置为透明
    const { width, height } = node.getBoundingClientRect();
    if (width < options.minGrayBlockWidth) {
      setOpacity(node);
    }
    if (height < options.minGrayBlockHeight) {
      setOpacity(node);
    }

    const ComputedStyle = getComputedStyle(node);

    // 背景图设为空，背景设置为骨架屏主（灰）色调
    if (ComputedStyle.backgroundImage !== 'none') {
      node.style.backgroundImage = 'none';
      node.style.background = MAIN_COLOR;
    }

    // 文本有阴影的，设置其阴影为骨架屏主色调
    if (ComputedStyle.boxShadow !== 'none') {
      const oldBoxShadow = ComputedStyle.boxShadow;
      const newBoxShadow = oldBoxShadow.replace(/^rgb.*\)/, MAIN_COLOR_RGB);
      node.style.boxShadow = newBoxShadow;
    }

    // 把有border的设置为骨架屏主色调
    if (ComputedStyle.borderColor) {
      node.style.borderColor = MAIN_COLOR;
    }

    // 有data-skeleton-bgcolor 的属性为用户自定义的背景色，
    const bgColor = node.getAttribute('data-skeleton-bgcolor');
    if (bgColor) {
      node.style.backgroundColor = bgColor;
      node.style.color = 'transparent';
    }
  }

  window.AutoSkeleton = {
    // Entry function
    async genSkeleton(options) {
      this.options = options;
      if (options.debug) {
        await this.debugGenSkeleton(options);
      } else {
        await this.startGenSkeleton();
      }
    },

    // Start generating the skeleton
    async startGenSkeleton() {
      this.init();
      try {
        this.handleNode(document.body);
      } catch (e) {
        console.log('==genSkeleton Error==\n', e.message, e.stack);
      }
    },

    // The Debug mode generates a skeleton diagram for debugging.
    // There will be a button at the top of the page, and click to generate a skeleton map.
    async debugGenSkeleton(options) {
      const switchElement = document.createElement('button');
      switchElement.innerHTML = '开始生成骨架图';
      Object.assign(switchElement.style, {
        width: '100%',
        zIndex: 9999,
        color: '#FFFFFF',
        background: 'skyBlue',
        fontSize: '30px',
        height: '100px',
      });
      document.body.prepend(switchElement);

      // Need to wait for event processing, so use Promise for packaging
      return new Promise((resolve, reject) => {
        try {
          switchElement.onclick = async () => {
            removeElement(switchElement);
            await this.startGenSkeleton();
            await sleep(options.debugTime || 0);
            resolve();
          };
        } catch (e) {
          console.error('==startGenSkeleton Error==', e);
          reject(e);
        }
      });
    },

    // 初始化，预设各种class的style
    init() {
      this.cleanSkeletonContainer();
      styleHandler();
    },

    // 删除之前的骨架屏样式，避免干扰
    cleanSkeletonContainer() {
      const skeletonWrap = document.body.querySelector('#nozomi-skeleton-html-style-container');
      if (skeletonWrap) {
        removeElement(skeletonWrap);
      }
    },

    /**
     * 处理文本节点
     * @param {*} node Node
     * @return {Boolean} true表示还有节点要处理 false表示没有需要处理的子节点了
     */
    handleText(node) {
      const tagName = node.tagName && node.tagName.toUpperCase();

      // 处理带标签的文本节点 <div>xxx</div> or <a>xxx</a>
      if (node.childNodes && node.childNodes.length === 1 && node.childNodes[0].nodeType === 3) {
        textHandler(node, this.options);
        return true;
      }

      // 特殊文本节点处理 xxx，改成 <i>xxx</i>
      if (node && node.nodeType === 3 && node.textContent) {
        const parent = node.parentNode;
        // 判断是否处理完了
        if (!parent.classList.contains(SKELETON_TEXT_CLASS)) {
          // 带空格的文本节点 改成i标签的文本节点
          const textContent = node.textContent.replace(/[\r\n]/g, '').trim();
          if (textContent) {
            const tmpNode = document.createElement('i');
            tmpNode.classList.add(SKELETON_TEXT_CLASS);
            tmpNode.innerText = textContent;
            node.parentNode.replaceChild(tmpNode, node);
            textHandler(tmpNode, this.options);
            return true;
          }
        }
      }

      // 处理文本和dom嵌套的节点 <span>111<a>222</a></span> <span>111<img src="xx" /></span>
      // nodeType必须是文本节点才结束，否则会继续遍历
      if (tagName === 'SPAN' && node.innerHTML && node.nodeType === 3) {
        // 先处理图片和背景图
        this.handleImages(node.childNodes);

        textHandler(node, this.options);
        return true;
      }

      return false;
    },

    // 处理图片节点
    handleImages(nodes) {
      if (!nodes) return;

      Array.from(nodes).forEach(node => {
        if (hasAttr(node, 'data-skeleton-ignore')) return;

        beforeHandler(node, this.options);
        pseudoHandler(node, this.options);
        const tagName = node.tagName && node.tagName.toUpperCase();
        if (tagName === 'IMG') {
          imgHandler(node);
        } else if (tagName === 'SVG') {
          svgHandler(node);
        } else {
          this.handleImages(node.childNodes);
        }
      });
    },

    // 处理类数组多个的节点
    handleNodes(nodes) {
      if (!nodes.length) return;

      Array.from(nodes).forEach(node => {
        this.handleNode(node);
      });
    },

    // 处理单个节点
    handleNode(node) {
      if (!node) return;

      // 不在视窗的节点和定义的被删除的class节点， 直接被移除
      if (!inViewPort(node) || hasAttr(node, 'data-skeleton-remove')) {
        return removeElement(node);
      }

      // 定义的需要被忽略不处理的节点 直接返回
      const ignore = hasAttr(node, 'data-skeleton-ignore') || node.tagName === 'STYLE';
      if (ignore) return;

      // 预处理样式
      beforeHandler(node, this.options);

      // 预处理伪类
      // handler.pseudo(node, this.options);

      // 常规button 处理一次， 有class为btn button的再处理一次
      const tagName = node.tagName && node.tagName.toUpperCase();
      const isBtn = tagName && (tagName === 'BUTTON' || /(btn)|(button)/g.test(node.getAttribute('class')));

      let isCompleted = false;
      switch (tagName) {
        case 'SCRIPT':
          scriptHandler(node);
          break;
        case 'IMG':
          imgHandler(node);
          break;
        case 'SVG':
          svgHandler(node);
          break;
        case 'INPUT':
          inputHandler(node);
          break;
        case 'BUTTON': // button处理了两次
          buttonHandler(node);
          break;
        case 'UL':
        case 'OL':
        case 'DL':
          listHandler(node, this.options);
          break;
        case 'A':
          aHandler(node);
          break;
      }

      if (isBtn) {
        // 第二次处理button
        buttonHandler(node);
      } else {
        // 其它节点被视为文本节点
        isCompleted = this.handleText(node);
      }

      // 没有被处理完的节点继续处理
      if (!isBtn && !isCompleted) {
        this.handleNodes(node.childNodes);
      }
    },
  };

}());

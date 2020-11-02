import {
  sleep,
  hasAttr,
  inViewPort,
  removeElement,
} from './util';

import {
  SKELETON_TEXT_CLASS,
} from './constants';

import * as handler from './handler/index';

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
    handler.style();
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
      handler.text(node, this.options);
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
          handler.text(tmpNode, this.options);
          return true;
        }
      }
    }

    // 处理文本和dom嵌套的节点 <span>111<a>222</a></span> <span>111<img src="xx" /></span>
    if (tagName === 'SPAN' && node.innerHTML) {
      // 先处理图片和背景图
      this.handleImages(node.childNodes);

      handler.text(node, this.options);
      return true;
    }

    return false;
  },

  // 处理图片节点
  handleImages(nodes) {
    if (!nodes) return;

    Array.from(nodes).forEach(node => {
      if (hasAttr(node, 'data-skeleton-ignore')) return;

      handler.before(node, this.options);
      handler.pseudo(node, this.options);
      const tagName = node.tagName && node.tagName.toUpperCase();
      if (tagName === 'IMG') {
        handler.img(node);
      } else if (tagName === 'SVG') {
        handler.svg(node);
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
    handler.before(node, this.options);

    // 预处理伪类
    // handler.pseudo(node, this.options);

    // 常规button 处理一次， 有class为btn button的再处理一次
    const tagName = node.tagName && node.tagName.toUpperCase();
    const isBtn = tagName && (tagName === 'BUTTON' || /(btn)|(button)/g.test(node.getAttribute('class')));

    let isCompleted = false;
    switch (tagName) {
      case 'SCRIPT':
        handler.script(node);
        break;
      case 'IMG':
        handler.img(node);
        break;
      case 'SVG':
        handler.svg(node);
        break;
      case 'INPUT':
        handler.input(node);
        break;
      case 'BUTTON': // button处理了两次
        handler.button(node);
        break;
      case 'UL':
      case 'OL':
      case 'DL':
        handler.list(node, this.options);
        break;
      case 'A':
        handler.a(node);
        break;
      default:
        break;
    }

    if (isBtn) {
      // 第二次处理button
      handler.button(node);
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

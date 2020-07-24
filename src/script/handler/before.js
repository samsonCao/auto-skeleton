import {
  MAIN_COLOR,
  MAIN_COLOR_RGB,
} from '../constants';

import {
  hasAttr,
  setOpacity,
} from '../util';

import handlerEmpty from './empty.js';

function beforeHandler(node, options) {
  if (!node.tagName) return;

  // 处理空节点
  if (hasAttr(node, 'data-skeleton-empty')) {
    handlerEmpty(node);
  }

  // 小于最小块儿预设宽度时，设置为透明
  const { width } = node.getBoundingClientRect();
  if (width < options.minGrayBlockWidth) {
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

export default beforeHandler;

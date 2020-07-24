// 暂停函数 用于调试debug
export const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// 判断当前dom是否在视窗
export const inViewPort = ele => {
  try {
    const rect = ele.getBoundingClientRect();
    return rect.top < window.innerHeight &&
      rect.left < window.innerWidth;

  } catch (e) {
    return true;
  }
};

// 判断节点是否有某个属性
export const hasAttr = (ele, attr) => {
  try {
    return ele.hasAttribute(attr);
  } catch (e) {
    return false;
  }
};

// 设置节点透明
export const setOpacity = ele => {
  if (ele.style) {
    ele.style.opacity = 0;
  }
};

// 单位转换 px -> rem
export const px2rem = px => {
  const pxValue = typeof px === 'string' ? parseInt(px, 10) : px;
  const htmlElementFontSize = getComputedStyle(document.documentElement).fontSize;

  return `${(pxValue / parseInt(htmlElementFontSize, 10))}rem`;
};

// 批量设置节点属性，多个节点的批量处理
export const setAttributes = (ele, attrs) => {
  Object.keys(attrs).forEach(k => ele.setAttribute(k, attrs[k]));
};

// 删除节点
export const removeElement = ele => {
  const parent = ele.parentNode;
  if (parent) {
    parent.removeChild(ele);
  }
};

// 判断节点是否有伪类，有的话返回伪类和对应宽度，没有返回false
export const checkHasPseudoEle = ele => {
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

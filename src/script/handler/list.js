import {
  removeElement,
} from '../util';

import {
  LIST_ITEM_TAG,
} from '../constants';

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

export default listHandler;

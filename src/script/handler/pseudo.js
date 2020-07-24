import {
  checkHasPseudoEle,
} from '../util';

import {
  PSEUDO_CLASS,
  TRANSPARENT_CLASS,
} from '../constants';

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

export default pseudoHandler;

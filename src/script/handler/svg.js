import {
  px2rem,
  removeElement,
} from '../util';

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

export default svgHandler;

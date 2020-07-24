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

export default emptyHandler;

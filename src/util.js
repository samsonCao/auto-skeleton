const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

// 暂停函数
const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// 这里的就是获取项目中构建的js脚本 是生辰骨架屏的核心逻辑
const genScriptContent = async function() {
  const sourcePath = path.resolve(__dirname, './script/dist/index.js');
  const result = await promisify(fs.readFile)(sourcePath, 'utf-8');
  return result;
};

module.exports = {
  sleep,
  genScriptContent,
};

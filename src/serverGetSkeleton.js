#!/usr/bin/env node

const {
  EOL,
} = require('os');
const path = require('path');
const _ = require('xutil');
const updateNotifier = require('update-notifier');

const { chalk } = _;
const getSkeleton = require('./getSkeleton');
const pkg = require('../package.json');

const serverGetSkeleton = async function(options) {
  // 检查可用的更新并返回一个实例
  updateNotifier({
    pkg,
    updateCheckInterval: 5000, // 5s
  }).notify();

  try {
    await getSkeleton(options);

    const resultDir = path.join(process.cwd(), 'skeleton-output');
    console.log('result files save in: ', chalk.cyan(resultDir));
  } catch (error) {
    console.log(chalk.red(`${EOL}auto-skeleton start unsuccessfully: ${error}${EOL}`));
  }
};

module.exports = serverGetSkeleton;

const findNodeModules = require('find-node-modules');
const R = require('ramda');

function transformInputToPath(input) {
  // Split input into it's slashes and rejoin it without the last value
  return R.init(input.split('/'));
}

function getDirectoryOfInputFile(input) {
  return `${process.cwd()}/${transformInputToPath(input)}`;
}

function getProjectRoot(input) {
  const dir = findNodeModules({cwd: input, relative: false})[0];
  return dir.replace('node_modules', '');
}

module.exports = {
  getDirectoryOfInputFile,
  getProjectRoot
};

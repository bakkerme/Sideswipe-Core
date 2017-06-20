const babylon = require('babylon');
const R = require('ramda');
const fs = require('fs');
const Promise = require('bluebird');
const readFile = Promise.promisify(fs.readFile);
const resolveDependancy = require('resolve');
const findNodeModules = require('find-node-modules');

function getDependanciesFromFile(fileName) {
  return new Promise((resolve, reject) => {
    if (!fileName || (fileName && !fs.existsSync(fileName))) {
      reject(new Error('Could not find passed file location'));
      return null;
    }

    readFile(fileName).then((data) => {
      const parseResults = babylon.parse(
        data.toString(),
        {
          sourceType: 'module',
          plugins: [
            'jsx',
            'decorators',
            'classProperties',
            'classPrivateProperties',
            'objectRestSpread'
          ],
        }
      );

      const body = parseResults.program.body;
      resolve(R.filter(e => !R.isNil(e), R.map((val) => {
        if (val.type === 'ImportDeclaration') {
          return (val.source.value);
        }
      }, body)));
    }).catch(reject);
  });
}

function resolveDependancyToFile(dependancyName) {
  return new Promise((resolve, reject) => {
    try {
      console.log(findNodeModules());
      resolveDependancy(dependancyName, { basedir: findNodeModules()[0] + '/' + dependancyName }, (val) => {
        resolve(val);
      });
    } catch(e) {
      reject(e);
    }
    // const curriedResolve = R.curry(resolveDependancy);
    // const c = curriedResolve(dependancyName, { basedir: process.cwd() });
    // const promisedC = Promise.promisify(c);
    // promisedC().then((val) => {
    // resolve(val);
    // }).catch(reject);
  });
}

function resolveMapDependanciesToFile(dependancies) {
  return R.map(resolveDependancyToFile, dependancies);
}

function safeAwait(promise, errorMessage) {
  return promise.then(data => {
    return data;
  }).catch((error) => console.error(errorMessage + '\n Error was: ' + error.message));
}

async function start() {
  const file = process.argv[2];
  const dependancies = await getDependanciesFromFile(file);

  Promise.all(resolveMapDependanciesToFile(dependancies)).then(paths => {
    console.log(paths);
  }).catch(console.error(
    'Dependancy was not found in current project space. \
    Are you sure you called Sideswipe from the project directory'
  ));

}

start();


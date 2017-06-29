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
      return [];
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
      resolve(R.map((val) => val.source.value, R.filter((val) => {
        return (val.type === 'ImportDeclaration');
      }, body)));
    }).catch(reject);

    return true;
  });
}

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

function resolveDependancyToFile(dependancyName) {
  return new Promise((resolve, reject) => {
    try {
      //In the case of relative paths i.e. ./components/component, we need to use the path of the 
      //input file to resolve it
      const baseDir = dependancyName.match(/^\.\//g) ? getDirectoryOfInputFile(process.argv[2]) : getProjectRoot(process.cwd());
      console.log(baseDir, dependancyName);
      resolveDependancy(
        dependancyName, 
        { 
          basedir: baseDir,
          extensions: [ '.js' ],
          moduleDirectory: 'node_modules'
        }, (err, val) => {
          if(err) reject(err);
          else resolve(val);
        });
    } catch(e) {
      reject(e);
    }
  });
}

function resolveMapDependanciesToFile(dependancies) {
  return R.map(resolveDependancyToFile, dependancies);
}

async function start() {
  const file = process.argv[2];
  const dependancies = await getDependanciesFromFile(file);

  Promise.all(resolveMapDependanciesToFile(dependancies)).then(paths => {
    console.log(paths);
  }).catch(
    (e) => { 
      console.error(e);
      console.error('Dependancy was not found in current project space. \
                     Are you sure you called Sideswipe from the project directory?');
    }
  );
  
  return true;
}

start();


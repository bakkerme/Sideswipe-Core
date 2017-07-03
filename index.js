const babylon = require('babylon');
const R = require('ramda');
const fs = require('fs');
const Promise = require('bluebird');
const readFile = Promise.promisify(fs.readFile);
const resolveDependancy = require('resolve');
const { getDirectoryOfInputFile, getProjectRoot } = require('./path-utils');

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

      resolve(
        R.filter((val) => typeof val === 'string', 
          R.append(
            R.map((val) => val.source.value, R.filter((val) => {
              return (val.type === 'ImportDeclaration');
            }, body)),
            R.map((val) => val.declarations[0].init.arguments[0].value, R.filter((val) => {
              return ( val.declarations && val.declarations[0].init.callee.name === 'require');
            }, body))
          )));
    }).catch(reject);

    return true;
  });
}

function resolveDependancyToFile(dependancyName) {
  return new Promise((resolve, reject) => {
    try {
      //In the case of relative paths i.e. ./components/component, we need to use the path of the 
      //input file to resolve it
      const baseDir = dependancyName.match(/^\.\//g) ? getDirectoryOfInputFile(process.argv[2]) : getProjectRoot(process.cwd());
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
  try {
    const dependancies = await getDependanciesFromFile(file);
    console.log(dependancies);

    Promise.all(resolveMapDependanciesToFile(dependancies)).then(paths => {
      console.log(paths);
    }).catch(
      (e) => { 
        console.error(e);
        console.error('Dependancy was not found in current project space. \
                     Are you sure you called Sideswipe from the project directory?');
      }
    );
  } catch (e) {
    console.log(e);
  }
    
  return true;
}

start();


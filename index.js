const babylon = require('babylon');
const R = require('ramda');
const fs = require('fs');
const readFile = Promise.promisify(fs.readFile);
const Promise = require('Bluebird');

const file = process.argv[2];
if (!file || !fs.existSync(file)) {
  console.log('Could not find passed file location');
}

readFile(file, (err, data) => {
  if (err) {
    throw err;
  }

  const parseResults = babylon.parse(
    data.toString(),
    {
      sourceType: 'module',
      plugins: [
        'jsx',
        'decorators',
        'classProperties',
        'classPrivateProperties',
      ],
    }
  );

  const body = parseResults.program.body;

  R.map((val) => {
    if (val.type === 'ImportDeclaration') {
      return (val.source.value);
    }
  }, body);
});


const getDependancies = require('./get-depenedancy.js');
getDependancies(process.argv[2]).then((e) => {
  process.stdout.write(JSON.stringify(e));
  process.exit(0);
}).catch((e) => {
  process.stdout.write(e.message + '\n');
  process.stdout.write('Dependancy was not found in current project space. Are you sure you called Sideswipe from the project directory?');
  process.exit(1);
});


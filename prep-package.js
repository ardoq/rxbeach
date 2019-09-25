const fs = require('fs');
const path = require('path');
const packageJson = require('./package.json');
const tsBuildConfig = require('./tsconfig-build.json');

const NAME = packageJson.name;
const TARGET = tsBuildConfig.compilerOptions.outDir;
const SUBMODULES = ['internal', 'operators'];

// Copy package.json from root dir to target, while removing the scripts key and
// adding main and typings
fs.writeFileSync(
  path.join(TARGET, 'package.json'),
  JSON.stringify({
    ...JSON.parse(fs.readFileSync('./package.json')),
    main: './index.js',
    typings: './index.d.ts',
    scripts: {},
  }, null, 2)
);

// Add minimal package.json files for the submodules
SUBMODULES.forEach(name =>
  fs.writeFileSync(
    path.join(TARGET, name, 'package.json'),
    JSON.stringify({
      name: NAME + '/' + name,
      main: 'index.js',
      typings: './index.d.ts',
    }, null, 2)
  )
);

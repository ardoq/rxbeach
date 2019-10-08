const fs = require('fs');
const path = require('path');
const tsBuildConfig = require('./tsconfig-build.json');

const TARGET = tsBuildConfig.compilerOptions.outDir;

// Copy package.json from root dir to target, while removing the scripts key and
// adding main and typings
fs.writeFileSync(
  path.join(TARGET, 'package.json'),
  JSON.stringify(
    {
      ...JSON.parse(fs.readFileSync('./package.json')),
      main: './index.js',
      typings: './index.d.ts',
      scripts: {},
      devDependencies: {},
    },
    null,
    2
  )
);

fs.copyFileSync('./README.md', path.join(TARGET, './README.md'));

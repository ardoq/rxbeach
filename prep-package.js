const fs = require('fs');
const path = require('path');
const tsBuildConfig = require('./tsconfig.json');

const TARGET = tsBuildConfig.compilerOptions.outDir;

// Copy package.json from root dir to target, while removing the scripts key and
// adding main and typings
const {
  name,
  version,
  description,
  keywords,
  company,
  homepage,
  bugs,
  repository,
  author,
  license,
  dependencies,
} = JSON.parse(fs.readFileSync('./package.json'));
fs.writeFileSync(
  path.join(TARGET, 'package.json'),
  JSON.stringify(
    {
      main: './index.js',
      typings: './index.d.ts',
      name,
      version,
      description,
      keywords,
      company,
      homepage,
      bugs,
      repository,
      author,
      license,
      dependencies,
    },
    null,
    2
  )
);

fs.copyFileSync('./README.md', path.join(TARGET, './README.md'));

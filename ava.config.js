export default {
  "files": [
    "src/**/*.spec.ts",
    "examples/*.spec.ts"
  ],
  "sources": [
    "src/**/*",
    "!src/*.tests.ts",
    "!src/**/*.tests.ts",
    "!src/**/*.spec.ts"
  ],
  "cache": true,
  "concurrency": 8,
  "failFast": false,
  "failWithoutAssertions": true,
  "tap": false,
  "verbose": true,
  "compileEnhancements": false,
  "extensions": [
    "ts"
  ],
  "require": [
    "tsconfig-paths/register",
    "ts-node/register"
  ]
}

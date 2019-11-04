export default {
  "files": [
    "src/**/*.spec.ts",
  ],
  "sources": [
    "src/**/*",
    "!src/**/*.spec.ts"
  ],
  "cache": true,
  "concurrency": 8,
  "failFast": false,
  "failWithoutAssertions": true,
  "tap": true,
  "verbose": true,
  "compileEnhancements": false,
  "extensions": [
    "ts"
  ],
  "require": [
    "ts-node/register"
  ]
}

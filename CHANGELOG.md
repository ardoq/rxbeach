# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.3.0](https://github.com/ardoq/rxbeach/compare/v0.2.1...v0.3.0) (2020-02-27)


### ⚠ BREAKING CHANGES

* **withNamespace:** `withNamespace` will now include actions without a
namespace.
* `ReducerEntry` has been renamed to `RegisteredReducer`,
and changed shape from an array to a function with a `trigger` property.

### Features

* **reducers:** Support for stream reducers ([eec3fb5](https://github.com/ardoq/rxbeach/commit/eec3fb5c8352feb34ca843e81e23c574bdfcff8e))
* Reducer constructor returns a reducer function ([9efb05a](https://github.com/ardoq/rxbeach/commit/9efb05a3395586bc7fbf5375a79b4c2002f0a022))


### Bug Fixes

* **withNamespace:** withNamespace allows undefined namespaces ([d319aa2](https://github.com/ardoq/rxbeach/commit/d319aa2fea8674be4f08d1b708995af560fc1034))
* Exclude tspec files from test coverage report ([940ef95](https://github.com/ardoq/rxbeach/commit/940ef956a3be061fee51dcde895b26ef23efda6c))
* Mark rxjs as a peer dependency ([0d3a8bc](https://github.com/ardoq/rxbeach/commit/0d3a8bccea2ca23466289c809aefa60ae25305bb))
* **package:** update react-scripts to version 3.3.1 ([86336b7](https://github.com/ardoq/rxbeach/commit/86336b70fd6384522d08e4add4eede6b47c5d7b9))
* **package:** update react-scripts to version 3.4.0 ([5c2539c](https://github.com/ardoq/rxbeach/commit/5c2539c92c5c678aa04b7b69910a1e981c08b50c))
* **package:** update rxbeach to version 0.2.1 ([f863366](https://github.com/ardoq/rxbeach/commit/f863366dac743a5f48906bb2ba83934d4dbe7410))

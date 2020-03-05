# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.3.4](https://github.com/ardoq/rxbeach/compare/v0.3.3...v0.3.4) (2020-03-05)

## [0.3.3](https://github.com/ardoq/rxbeach/compare/v0.2.1...v0.3.3) (2020-03-05)


### Features

* Use 10 generic arguments in vararg definitions ([93f2ca4](https://github.com/ardoq/rxbeach/commit/93f2ca417655a572f2a7153e6cc9bed6f89b877c))

## [0.3.1](https://github.com/ardoq/rxbeach/compare/v0.2.1...v0.3.1) (2020-03-04)


### Bug Fixes

* **package:** update rxbeach to version 0.2.1 ([f863366](https://github.com/ardoq/rxbeach/commit/f863366dac743a5f48906bb2ba83934d4dbe7410))
* **reduceState:** Move reduceState to operators and export it from the package ([6418631](https://github.com/ardoq/rxbeach/commit/6418631f9c3b1d8a75cac8477e8a4cd0dc1a27fa))

## [0.3.0](https://github.com/ardoq/rxbeach/compare/v0.2.1...v0.3.0) (2020-03-04)


### ⚠ BREAKING CHANGES

* **withNamespace:** `withNamespace` will now include actions without a
namespace.
* `ReducerEntry` has been renamed to `RegisteredReducer`,
and changed shape from an array to a function with a `trigger` property.

### Features

* **reducers:** combineReducers catches errors when reducing values ([60b6e12](https://github.com/ardoq/rxbeach/commit/60b6e125423aef7b8202ef1a5697fc5af2f62a99))
* **reducers:** Support for stream reducers ([eec3fb5](https://github.com/ardoq/rxbeach/commit/eec3fb5c8352feb34ca843e81e23c574bdfcff8e))
* **state streams:** Support for reduced state streams ([7078b94](https://github.com/ardoq/rxbeach/commit/7078b9453fb9122a76fd1fa654f972d567f9d2c3))
* Reducer constructor returns a reducer function ([9efb05a](https://github.com/ardoq/rxbeach/commit/9efb05a3395586bc7fbf5375a79b4c2002f0a022))


### Bug Fixes

* **package:** update react to version 16.13.0 ([6169d57](https://github.com/ardoq/rxbeach/commit/6169d57d7c1506da2239b61f0aeafaa7a297ab5a))
* **package:** update react-dom to version 16.13.0 ([bc91c4c](https://github.com/ardoq/rxbeach/commit/bc91c4cd9620d0e414f9bda6e4656564bf29011e))
* **package:** update react-scripts to version 3.3.1 ([86336b7](https://github.com/ardoq/rxbeach/commit/86336b70fd6384522d08e4add4eede6b47c5d7b9))
* **package:** update react-scripts to version 3.4.0 ([5c2539c](https://github.com/ardoq/rxbeach/commit/5c2539c92c5c678aa04b7b69910a1e981c08b50c))
* **withNamespace:** withNamespace allows undefined namespaces ([d319aa2](https://github.com/ardoq/rxbeach/commit/d319aa2fea8674be4f08d1b708995af560fc1034))
* Exclude tspec files from test coverage report ([940ef95](https://github.com/ardoq/rxbeach/commit/940ef956a3be061fee51dcde895b26ef23efda6c))
* Mark rxjs as a peer dependency ([0d3a8bc](https://github.com/ardoq/rxbeach/commit/0d3a8bccea2ca23466289c809aefa60ae25305bb))
* **package:** update rxbeach to version 0.2.1 ([f863366](https://github.com/ardoq/rxbeach/commit/f863366dac743a5f48906bb2ba83934d4dbe7410))
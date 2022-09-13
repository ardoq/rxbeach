# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.2.0](https://github.com/ardoq/rxbeach/compare/v2.1.0...v2.2.0) (2022-09-13)


### Features

* add tapRoutine ([994f3f4](https://github.com/ardoq/rxbeach/commit/994f3f40f41306d3ac6ea4355dde3b035614b7ad))
* persistentDerivedStream ([1bff4db](https://github.com/ardoq/rxbeach/commit/1bff4db8a71eb4a8c561ae2c0cc79354f925c597))

## [2.1.0](https://github.com/ardoq/rxbeach/compare/v2.0.0...v2.1.0) (2022-09-05)


### Features

* **react:** add `connectInstance` function ([dfa81b4](https://github.com/ardoq/rxbeach/commit/dfa81b46de91ad4794ed7c939b8fb7d4433d8e7c))


### Bug Fixes

* **react/connect:** correct props generic type ([948ec44](https://github.com/ardoq/rxbeach/commit/948ec44c5cf3409f97ef496752b1fee55cd4c988))

## [2.0.0](https://github.com/ardoq/rxbeach/compare/v1.0.0...v2.0.0) (2022-08-26)


### ⚠ BREAKING CHANGES

* RxBeach no longer re-exports operators from RxJS.
These operators must now be imported directly from RxJS.

### Features

* remove all marker functionality ([0028d59](https://github.com/ardoq/rxbeach/commit/0028d591fa001d0fcb42316f334149ae79dde237))
* remove performance measurement ([49b3840](https://github.com/ardoq/rxbeach/commit/49b3840e5fc4efe35aa9001e761c65baf8266470))

## [1.0.0](https://github.com/ardoq/rxbeach/compare/v0.10.3...v1.0.0) (2022-08-26)


### ⚠ BREAKING CHANGES

* See breaking changes from RxJS 7.
* `persistentStateStream` no longer returns an instance
of a subclass of `Observable`, but rather the new class
`ObservableState`.

### Features

* upgrade RxJS, introduce ObservableState ([#478](https://github.com/ardoq/rxbeach/issues/478)) ([545cbf0](https://github.com/ardoq/rxbeach/commit/545cbf09c7baa546b2be3b4842576bd18fef3872))

### [0.10.3](https://github.com/ardoq/rxbeach/compare/v0.10.2...v0.10.3) (2022-04-06)

### [0.10.2](https://github.com/ardoq/rxbeach/compare/v0.10.1...v0.10.2) (2022-02-23)

### [0.10.1](https://github.com/ardoq/rxbeach/compare/v0.10.0...v0.10.1) (2022-02-22)

## [0.10.0](https://github.com/ardoq/rxbeach/compare/v0.9.0...v0.10.0) (2021-09-13)


### ⚠ BREAKING CHANGES

* This ensures every action has name of the form
`[qualifier] action name`. See the
[new doc](https://github.com/ardoq/rxbeach/blob/master/docs/qualified-action-names.md)
for how to automate this process.

### Features

* enforce qualifier in action names ([9a8aae9](https://github.com/ardoq/rxbeach/commit/9a8aae9119a815f4129781b63720cb75ac75867a))


### Bug Fixes

* ard-9960 fixed carry bug ([2f3073e](https://github.com/ardoq/rxbeach/commit/2f3073e6c0c2b456cb8133112aa52dfcc476d485))

## [0.9.0](https://github.com/ardoq/rxbeach/compare/v0.8.6...v0.9.0) (2021-09-02)


### ⚠ BREAKING CHANGES

* The previous version was a breaking change, because the
exports where made strict.

* fix deployment instructions ([6399503](https://github.com/ardoq/rxbeach/commit/6399503d1b8dcbed627b77149d5767b5c9fb916c))

### [0.8.6](https://github.com/ardoq/rxbeach/compare/v0.8.5...v0.8.6) (2021-09-02)

### [0.8.5](https://github.com/ardoq/rxbeach/compare/v0.8.4...v0.8.5) (2021-08-05)

### [0.8.4](https://github.com/ardoq/rxbeach/compare/v0.8.3...v0.8.4) (2021-02-09)

### [0.8.3](https://github.com/ardoq/rxbeach/compare/v0.8.2...v0.8.3) (2020-09-17)


### Features

* forward namespaces to reducers ([74b5219](https://github.com/ardoq/rxbeach/commit/74b521904141ac689b724f0b2c4be04aed8dea8f))


### Bug Fixes

* order reducer overload from most to least complex ([b6832d7](https://github.com/ardoq/rxbeach/commit/b6832d75189f5763354aec5be2dcbe431f303e0d))

### [0.8.2](https://github.com/ardoq/rxbeach/compare/v0.8.1...v0.8.2) (2020-08-10)


### Features

* add withoutNamespace operator ([582660e](https://github.com/ardoq/rxbeach/commit/582660e4d619b6e93dc3251323e5a09a82844062))

### [0.8.1](https://github.com/ardoq/rxbeach/compare/v0.8.0...v0.8.1) (2020-07-30)

## [0.8.0](https://github.com/ardoq/rxbeach/compare/v0.7.3...v0.8.0) (2020-07-30)


### ⚠ BREAKING CHANGES

* `persistentReducedStream` has been refactored to accept
the error subject in an options object instead of a standalone argument.

### Features

* support namespacing persistentReducedStream ([cfb1a95](https://github.com/ardoq/rxbeach/commit/cfb1a957a376d4bf6ca5823a0249a9c9a8c86250))

### [0.7.3](https://github.com/ardoq/rxbeach/compare/v0.7.1...v0.7.3) (2020-07-30)


### Features

* introduce the action$ in RxBeach ([7f3e539](https://github.com/ardoq/rxbeach/commit/7f3e5392e404f8b7aacc57a1fe368b0ff46c0386))


### Bug Fixes

* **react-docs:** fix router after update of history ([e09281b](https://github.com/ardoq/rxbeach/commit/e09281bf5edf920e100836ffc1ae92540f76f55c))
* upgraded vulnerable dependency ([c92cecf](https://github.com/ardoq/rxbeach/commit/c92cecfb61df60c917a329bd58a266e335c9cdd1))

### [0.7.2](https://github.com/ardoq/rxbeach/compare/v0.7.0...v0.7.2) (2020-06-08)


### Features

* add a state stream registry ([e50cba1](https://github.com/ardoq/rxbeach/commit/e50cba138aa9c96b3b56b7bb558c94b09b9dfcfc))
* make persistentReducedStream register streams ([88cd4de](https://github.com/ardoq/rxbeach/commit/88cd4deb362ff04c1ebfb114de1294a5759a546f))


### Bug Fixes

* upgraded vulnerable dependency ([c92cecf](https://github.com/ardoq/rxbeach/commit/c92cecfb61df60c917a329bd58a266e335c9cdd1))

### [0.7.1](https://github.com/ardoq/rxbeach/compare/v0.7.0...v0.7.1) (2020-06-08)


### Features

* add a state stream registry ([e50cba1](https://github.com/ardoq/rxbeach/commit/e50cba138aa9c96b3b56b7bb558c94b09b9dfcfc))
* make persistentReducedStream register streams ([88cd4de](https://github.com/ardoq/rxbeach/commit/88cd4deb362ff04c1ebfb114de1294a5759a546f))

## [0.7.0](https://github.com/ardoq/rxbeach/compare/v0.6.2...v0.7.0) (2020-05-20)


### ⚠ BREAKING CHANGES

* **state streams:** persistentReducedStream has a new interface
* **reducers:** combineReducers now takes a config argument

### Features

* **reducers:** added performance measurements to combineReducers ([883c4e2](https://github.com/ardoq/rxbeach/commit/883c4e21ffa1364ce370339aba238157435c3ea8))
* **state streams:** updated persistentReducedStream ([de1c495](https://github.com/ardoq/rxbeach/commit/de1c495f86d424ac208a90194790033c7530ab64))

### [0.6.3](https://github.com/ardoq/rxbeach/compare/v0.6.2...v0.6.3) (2020-04-23)

### [0.6.2](https://github.com/ardoq/rxbeach/compare/v0.6.1...v0.6.2) (2020-04-23)


### Bug Fixes

* remove unused dependencies ([65ff0ab](https://github.com/ardoq/rxbeach/commit/65ff0ab2638e345b339bda4fec59f210c4fe1244))
* **state stream:** ensure state property is always updated ([a7f9a53](https://github.com/ardoq/rxbeach/commit/a7f9a53fa6542acac741ef8a55954791076d07c0))

### [0.6.1](https://github.com/ardoq/rxbeach/compare/v0.6.0...v0.6.1) (2020-04-23)


### Features

* introduce high level state stream tooling ([627349d](https://github.com/ardoq/rxbeach/commit/627349dd3347e934858f9d00df9cee41a97889a7))

## [0.6.0](https://github.com/ardoq/rxbeach/compare/v0.5.0...v0.6.0) (2020-04-22)


### ⚠ BREAKING CHANGES

* **markers:** removed detectGlitches

### Features

* **markers:** added marker for debounceTime that includes time ([0ba027d](https://github.com/ardoq/rxbeach/commit/0ba027d951f543073616167decc3a3aa43f9a101))


* **markers:** removed detectGlitches ([a071249](https://github.com/ardoq/rxbeach/commit/a0712498f0c3d47cb490db49b89de8d1f35d15bc))

## [0.5.0](https://github.com/ardoq/rxbeach/compare/v0.4.4...v0.5.0) (2020-04-20)


### ⚠ BREAKING CHANGES

* **react:** Removes useStream hook. Use connect instead.

* **react:** remove useStream hook ([b25407a](https://github.com/ardoq/rxbeach/commit/b25407a5e92df892694d661dbb278dffd82c2166))

### [0.4.4](https://github.com/ardoq/rxbeach/compare/v0.4.3...v0.4.4) (2020-04-02)

### [0.4.3](https://github.com/ardoq/rxbeach/compare/v0.4.2...v0.4.3) (2020-04-02)


### Bug Fixes

* expose react utils through rxbeach/react package ([33f00e7](https://github.com/ardoq/rxbeach/commit/33f00e71850dcff106e6b5c479a3365afc771b31))

### [0.4.2](https://github.com/ardoq/rxbeach/compare/v0.4.1...v0.4.2) (2020-04-02)

### [0.4.1](https://github.com/ardoq/rxbeach/compare/v0.4.0...v0.4.1) (2020-04-02)


### Features

* **react:** add connect React HOC ([42e5767](https://github.com/ardoq/rxbeach/commit/42e5767d105639005fb6145e38cebdcdfb6d5f66))

## [0.4.0](https://github.com/ardoq/rxbeach/compare/v0.3.6...v0.4.0) (2020-03-26)


### ⚠ BREAKING CHANGES

* **reducers:** removed debouncing in reduceState and started
  emitting all state calculations.

  This has some implications in the sense that defaultState will
  always be emitted and reduceState might sometimes have some
  "redundant" emissions. See the tests (and the failing test)
  in the commit for details.

  Debouncing state streams made it unsafe to use withLatestFrom,
  since the stream calculations were debounced.

### Features

* **react:** add useState React hook ([417fc48](https://github.com/ardoq/rxbeach/commit/417fc486af4841829d5609ed39b9e0bb36fd5a86))


### Bug Fixes

* **reducers:** removed debouncing from reduceState ([60f9b99](https://github.com/ardoq/rxbeach/commit/60f9b99b3bfcf402865063a1ac8592504fafa87a))

### [0.3.6](https://github.com/ardoq/rxbeach/compare/v0.3.3...v0.3.6) (2020-03-24)


### Bug Fixes

* **package:** update rxbeach to version 0.3.4 ([bb308cc](https://github.com/ardoq/rxbeach/commit/bb308ccfecf8ee6259de0e5111bf1ecb76b6825d))
* **reducers:** ensure reduceState replays values to derived streams ([2435696](https://github.com/ardoq/rxbeach/commit/24356969574536ea8aa223b0f9f880edb54b4807))

### [0.3.5](https://github.com/ardoq/rxbeach/compare/v0.3.4...v0.3.5) (2020-03-16)


### Bug Fixes

* **package:** update rxbeach to version 0.3.4 ([bb308cc](https://github.com/ardoq/rxbeach/commit/bb308ccfecf8ee6259de0e5111bf1ecb76b6825d))

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

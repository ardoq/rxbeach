![Beach with umbrella](docs/beach_with_umbrella.png)

# RxBeach
[![Coverage Status](https://coveralls.io/repos/github/ardoq/rxbeach/badge.svg?branch=master)](https://coveralls.io/github/ardoq/rxbeach?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/ardoq/rxbeach.svg)](https://greenkeeper.io/)
> Chill with streams at the RxBeach

RxBeach is a toolbox for creating applications that uses streams to manage
state. It is in the **very early stages** of implementation, and the API will
change continuously.


# Contributing
Code is hosted in the GitHub repo [ardoq/rxbeach](https://github.com/ardoq/rxbeach).

## Running the test example
`cd examples/create-react-app/ && yarn && yarn start`

## Publishing a new version of the package
1. Verify that "it works":  
   `yarn test && yarn lint && yarn check-types`
2. Bump the version
   `yarn standard-version`
2. Publish (DO NOT BUMP THE VERSION HERE!):  
   `yarn run publish`

![Beach with umbrella](docs/beach_with_umbrella.png)

# RxBeach
[![Coverage Status](https://coveralls.io/repos/github/ardoq/rxbeach/badge.svg?branch=master)](https://coveralls.io/github/ardoq/rxbeach?branch=master)
> Chill with streams at the RxBeach

RxBeach is a toolbox for creating applications that use streams to manage
state. It is in the **very early stages** of implementation, and the API will
change continuously.

# Documentation

The documentation is published at https://ardoq.github.io/rxbeach/ and there is also 
a good deal of JSDoc comments in the code.

# Contributing
Code is hosted in the GitHub repo [ardoq/rxbeach](https://github.com/ardoq/rxbeach).

We have a `.git-blame-ignore-revs` file for ignoring commits with style changes
in git blame. You can configure git to use it, and VSCode and others will
respect the setting:

    git config blame.ignoreRevsFile .git-blame-ignore-revs

## Dependabot
We use dependabot to keep dependencies up to date. This is nice, because it shows us exactly where dependencies breaks our build.
To satisfy Ardoq's review policy, you should merge Dependabot PRs by approving the PR with the message `@dependabot merge`.

## Publishing a new version of the package
1. Verify that "it works":  
   `yarn lint && yarn build && yarn test`
2. Bump the version
   `yarn standard-version`
3. Push your changes:
   `git push --follow-tags`
4. Publish to NPM (remember to **not** bump the version here, just hit enter):  
   `yarn publish`

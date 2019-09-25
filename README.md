![Beach with umbrella](docs/beach_with_umbrella.png)

# RxBeach
> Chill with streams at the RxBeach

RxBeach is a toolbox for creating applications that uses streams to manage
state.


# Contributing

## Publishing a new version of the package
1. Verify that "it works":  
   `yarn test && yarn lint && yarn check-types`
2. Prepare the package for publishing:  
  `yarn publish:prep`
3. Publish:  
   `cd dist/ && yarn publish`
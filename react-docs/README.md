# RxBeach docs

### How to develop locally?
1. `yarn install`
2. `yarn start`
3. Access http://localhost:9000

### How to add a new page
1. Add the page as a react component under [`/src/pages`](src/pages). Ensure that the file exports either a [Page or a PageGroup](src/types.ts).
2. Export it through [`/src/pages/index.tsx`](src/pages/index.tsx)
3. [See some of the other pages for examples](src/pages/index.tsx)

### Deploy your changes
1. Lint & check types: `yarn lint && yarn check-types`
2. Deploy to gh-pages branch: `yarn deploy-docs`
3. Once deployed your changes will be live in on [ardoq.github.io/rxbeach](https://ardoq.github.io/rxbeach/#/)


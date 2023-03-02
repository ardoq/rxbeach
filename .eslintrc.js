module.exports = {
  extends: ['eslint:recommended', 'prettier', './eslint-typescript.js'],
  plugins: ['prettier', 'import'],
  env: {
    es6: true,
    browser: true,
  },
  settings: {
    'import/ignore': ['node_modules'],
  },
  globals: {
    process: 'readonly',
  },
  rules: {
    'no-restricted-globals': [
      'error',
      {
        name: 'fdescribe',
        message: 'Do not commit "fdescribe". Use "describe" instead.',
      },
      {
        name: 'fit',
        message: 'Do not commit "fit". Use "it" instead.',
      },
    ],
    'no-restricted-properties': [
      'error',
      {
        object: 'describe',
        property: 'only',
        message: 'Do not commit "describe.only". Use "describe" instead.',
      },
      {
        object: 'it',
        property: 'only',
        message: 'Do not commit "it.only". Use "it" instead.',
      },
    ],
    'prettier/prettier': ['error'],
    'import/first': ['error'],
    'import/no-cycle': ['error'],
    camelcase: [
      'error',
      {
        allow: [
          '^UNSAFE_',
          '^LEGACY_',
          '^DANGEROUS_',
          '^DEPRECATED_',
          '^__DS_ONLY_',
        ],
      },
    ],
    'arrow-spacing': ['error'],
    'block-scoped-var': ['off'],
    'dot-notation': ['error'],
    'func-call-spacing': ['off'],
    'new-parens': ['error'],
    'no-array-constructor': ['error'],
    'no-console': ['error'],
    'no-debugger': ['error'],
    'no-empty': ['error'],
    'no-constant-condition': ['error', { checkLoops: false }],
    'no-irregular-whitespace': ['error', { skipTemplates: true }],
    'no-label-var': ['error'],
    'no-lonely-if': ['error'],
    'no-new-object': ['error'],
    'no-param-reassign': ['error'],
    'no-redeclare': ['error'],
    'no-return-assign': ['error'],
    'no-self-compare': ['error'],
    'no-shadow-restricted-names': ['error'],
    'no-trailing-spaces': ['error'],
    'no-undef-init': ['error'],
    'no-unneeded-ternary': ['error'],
    'no-useless-call': ['error'],
    'no-useless-escape': ['error'],
    'no-void': ['error'],
    radix: ['error'],
    strict: ['error', 'never'],
    eqeqeq: ['error', 'always'],
    'spaced-comment': ['error', 'always'],
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
      },
    ],
    'no-shadow': 'off', // https://typescript-eslint.io/rules/no-shadow
    'padded-blocks': ['error', 'never'],
    'no-unused-expressions': ['error'],
    'prefer-template': ['error'],
    'no-else-return': ['error'],
    'class-methods-use-this': [
      'error',
      {
        exceptMethods: [
          'componentDidMount',
          'componentDidUpdate',
          'componentWillMount',
          'componentWillReceiveProps',
          'componentWillUnmount',
          'componentWillUpdate',
          'render',
          'shouldComponentUpdate',
        ],
      },
    ],
    'sort-imports': ['warn', { ignoreDeclarationSort: true }],
    'no-restricted-imports': ['error', { patterns: ['rxbeach', 'rxbeach/*'] }],
    'func-style': ['error', 'expression'],
  },
  overrides: [
    {
      files: ['*.tspec.ts'],
      env: {
        mocha: true,
        node: true,
      },
      rules: {
        '@typescript-eslint/no-unused-vars': ['off'],
        camelcase: ['off'],
        'prefer-const': ['off'],
      },
    },
    {
      files: ['.eslintrc.js', 'eslint-typescript.js'],
      env: { node: true },
    },
  ],
};

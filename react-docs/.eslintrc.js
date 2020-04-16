module.exports = {
  extends: [
    './node_modules/@ardoq/shared-configs/eslint-app',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  env: {
    node: true,
  },
  rules: {
    'no-restricted-imports': ['error', { patterns: [''] }],
    'react/no-unescaped-entities': ['off'],
    // Prettier takes care of this
    'comma-dangle': ['off']
  },
};
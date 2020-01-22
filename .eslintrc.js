module.exports = {
  extends: './node_modules/@ardoq/shared-configs/eslint-lib',
  rules: {
    'no-restricted-imports': ['error', { patterns: ['./*', '../*'] }],
    'func-style': ['error', 'expression'],
  },
  overrides: [
    {
      files: ['*.tspec.ts'],
      env: {
        mocha: true,
      },
      rules: {
        '@typescript-eslint/camelcase': ['off'],
        '@typescript-eslint/no-unused-vars': ['off'],
        camelcase: ['off'],
        'prefer-const': ['off'],
      },
    },
  ],
};

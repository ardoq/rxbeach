module.exports = {
  extends: './node_modules/@ardoq/shared-configs/eslint-lib',
  rules: {
    'no-restricted-imports': ['error', { patterns: ['rxbeach', 'rxbeach/*'] }],
    'func-style': ['error', 'expression'],
  },
  globals: {
    'process': 'readonly'
  },
  rules: {
    'no-console': ['error', { allow: ["warn", "error"]}],
    'no-shadow': ['off'],
    '@typescript-eslint/no-shadow': ['error']
  },
  overrides: [
    {
      files: ['*.tspec.ts'],
      env: {
        mocha: true,
      },
      rules: {
        '@typescript-eslint/no-unused-vars': ['off'],
        camelcase: ['off'],
        'prefer-const': ['off'],
      },
    },
  ],
};

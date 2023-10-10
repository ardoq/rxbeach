module.exports = {
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
  ],
  plugins: ['@typescript-eslint', 'prettier', 'import'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2018,
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': ['off'],
    '@typescript-eslint/explicit-member-accessibility': ['off'],
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/no-non-null-assertion': ['off'],
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      {
        assertionStyle: 'as',
        objectLiteralTypeAssertions: 'allow',
      },
    ],
    '@typescript-eslint/no-shadow': ['error'],
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/no-use-before-define': ['off'],
    '@typescript-eslint/prefer-interface': ['off'],
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'default',
        filter: {
          regex: '^(?:UNSAFE|LEGACY|DANGEROUS|DEPRECATED)_',
          match: true,
        },
        format: null,
      },
    ],
    '@typescript-eslint/explicit-module-boundary-types': ['off'],
    '@typescript-eslint/func-call-spacing': ['error'],
    '@typescript-eslint/member-ordering': [
      'error',
      {
        classes: [
          'static-field',
          'static-method',
          'instance-field',
          'constructor',
          'instance-method',
        ],
      },
    ],
  },
};

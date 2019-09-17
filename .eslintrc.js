module.exports = {
  env: {
    es6: true,
    "shared-node-browser": true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    sourceType: "module",
    ecmaVersion: 2018,
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    "import/ignore": ["node_modules"]
  },
  overrides: [
    {
      files: ["*.spec.ts"],
      env: {
        mocha: true
      }
    }
  ],
  plugins: ["@typescript-eslint", "prettier", "import", "sort-class-members"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "prettier/@typescript-eslint",
    "plugin:import/typescript"
  ],
  /**
   * The following rules override any recommended ruleset in extends.
   * The goal is to remove these (same as setting them to ["error"]) */
  rules: {
    "@typescript-eslint/explicit-function-return-type": ["off"],
    "@typescript-eslint/explicit-member-accessibility": ["off"],
    "@typescript-eslint/no-explicit-any": ["off"],
    "@typescript-eslint/no-unused-vars": ["off"],
    "@typescript-eslint/no-use-before-define": ["off"],
    "@typescript-eslint/prefer-interface": ["off"],
    "@typescript-eslint/camelcase": [
      "off",
      {
        allow: ["^UNSAFE_", "^LEGACY_", "^DANGEROUS_", "^DEPRECATED_"]
      }
    ],
    "prettier/prettier": ["error"],
    "sort-class-members/sort-class-members": [
      "error",
      {
        order: [
          "[static-properties]",
          "[static-methods]",
          "[properties]",
          "[conventional-private-properties]",
          "constructor",
          "[methods]",
          "[conventional-private-methods]"
        ],
        accessorPairPositioning: "getThenSet"
      }
    ],
    "arrow-spacing": ["error"],
    "block-scoped-var": ["off"],
    "brace-style": ["error"],
    camelcase: ["off"],
    "dot-notation": ["error"],
    "func-call-spacing": ["error"],
    "new-parens": ["error"],
    "no-array-constructor": ["error"],
    "no-console": ["off"],
    "no-constant-condition": ["error", { checkLoops: false }],
    "no-irregular-whitespace": ["error", { skipTemplates: true }],
    "no-label-var": ["error"],
    "no-lonely-if": ["error"],
    "no-new-object": ["error"],
    "no-param-reassign": ["off", { props: false }],
    "no-redeclare": ["off"],
    "no-return-assign": ["error"],
    "no-self-compare": ["error"],
    "no-shadow-restricted-names": ["error"],
    "no-trailing-spaces": ["error"],
    "no-undef-init": ["error"],
    "no-unneeded-ternary": ["error"],
    "no-useless-call": ["error"],
    "no-useless-escape": ["off"],
    "no-void": ["error"],
    radix: ["error"],
    strict: ["error", "never"]
  }
};

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jquery: true,
  },
  extends: [
    // 'airbnb-base',
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 13,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "prefer-const": 0,
    "@typescript-eslint/no-var-requires": "off",
    indent: ["warn", 2],
    "space-infix-ops": "warn",
    "space-before-blocks": "warn",
    "object-curly-spacing": ["warn", "always"],
    "no-trailing-spaces": "warn",
    "space-before-function-paren": ["warn", "always"],
    "array-bracket-spacing": ["warn", "never"],
    "keyword-spacing": ["warn", { before: true, after: true }],
  },
};

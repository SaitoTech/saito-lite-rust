module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jquery: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:node/recommended",
    "plugin:promise/recommended",
    "prettier",
    "prettier/@typescript-eslint",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "import", "node", "promise", "prettier"],
  rules: {
    "prefer-const": "warn",
    "@typescript-eslint/no-var-requires": "off",
    "no-unused-vars": "warn",
    "consistent-return": "error",
    semi: ["error", "always"],
    "prettier/prettier": "error",
    // ... more customized rules ...
  },
};

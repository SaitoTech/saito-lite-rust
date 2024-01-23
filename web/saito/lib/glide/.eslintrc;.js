module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
		jquery: true
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 13,
		sourceType: 'module'
	},
	plugins: ['@typescript-eslint'],
	rules: {
		// Basic code style rules
		indent: ['error', 'tab'], // Update the indent rule to use tabs
		'linebreak-style': ['error', 'unix'],
		quotes: 'off',
		semi: 'off',
		// TypeScript specific rules
		'@typescript-eslint/no-unused-vars': 'off',
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-var-requires': 'off',
		'@typescript-eslint/no-this-alias': 'off',
		'no-fallthrough': 'off',
		'no-prototype-builtins': 'off',
		'no-cond-assign': 'off'
	}
};

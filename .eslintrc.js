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
        indent: ['error', 4],
        'linebreak-style': ['error', 'unix'], // Use Unix line endings
        quotes: ['error', 'single', { allowTemplateLiterals: true }], // Use single quotes for strings
        semi: ['error', 'always'] // Require semicolons at the end of statements

        // '@typescript-eslint/no-unused-vars': 'off', // Turn off unused variable warnings
        // '@typescript-eslint/no-empty-function': 'off', // Allow empty functions
        // '@typescript-eslint/no-var-requires': 'off', // Allow 'require' statements
        // '@typescript-eslint/no-this-alias': 'off', // Allow using 'this' alias
        // 'no-fallthrough': 'off', // Allow fallthrough in switch statements
        // 'no-prototype-builtins': 'off', // Allow prototype built-ins
        // 'no-cond-assign': 'off' // Allow assignment in conditional expressions
    }
};

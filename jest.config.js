/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testRegex: 'lib/saito/.*\\.spec.(ts|tsx)$',
    testPathIgnorePatterns: [
        "/node_modules/",
        "/mods/",
        "/bundler/"
    ],
};

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/app/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};

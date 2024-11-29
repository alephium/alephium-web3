// EVENT.TEST
/** @type {import('jest').Config} */
// eslint-disable-next-line header/header
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.json',
        isolatedModules: true
      }
    ]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: ['**/?(*.)+(spec|test).ts'],
  setupFilesAfterEnv: ['./src/jest.setup.js'],
  transformIgnorePatterns: ['node_modules/(?!(node-fetch)/)']
}

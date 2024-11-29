// EVENT.TEST
// eslint-disable-next-line @typescript-eslint/no-var-requires, header/header
/* eslint-disable */
// const fetch = require('node-fetch')

// global.fetch = fetch
// global.Headers = fetch.Headers
// global.Request = fetch.Request
// global.Response = fetch.Response

// // Add BigInt support
// BigInt.prototype.toJSON = function () {
//   return this.toString()
// }

// jest.setTimeout(30000) // 30 second timeout

// // Add any global test setup here
// beforeAll(() => {
//   // Setup code that runs before all tests
// })

// afterAll(() => {
//   // Cleanup code that runs after all tests
// })

const fetch = require('node-fetch')

global.fetch = fetch
global.Headers = fetch.Headers
global.Request = fetch.Request
global.Response = fetch.Response

BigInt.prototype.toJSON = function () {
  return this.toString()
}

// Increase timeout for async operations
jest.setTimeout(30000)

beforeAll(() => {
  // Reset all mocks before each test suite
  jest.clearAllMocks()
})

afterAll(async () => {
  // Clean up any remaining mocks
  jest.restoreAllMocks()
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection at:', reason)
})

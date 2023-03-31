const Sequencer = require('@jest/test-sequencer').default

class CustomSequencer extends Sequencer {
  sort(tests) {
    // Test structure information
    // https://github.com/facebook/jest/blob/6b8b1404a1d9254e7d5d90a8934087a9c9899dab/packages/jest-runner/src/types.ts#L17-L21
    const wcTests = tests.filter((test) => test.path.includes('walletconnect'))
    const nonwcTests = tests.filter((test) => !test.path.includes('walletconnect'))
    return nonwcTests.concat(wcTests)
  }
}

module.exports = CustomSequencer;

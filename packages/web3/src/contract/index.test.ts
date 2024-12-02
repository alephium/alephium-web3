/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// eslint-disable-next-line header/header
describe('Contract Module Exports', () => {
  it('should export all required modules', () => {
    const exports = require('./index')

    // Test that all expected modules are exported
    expect(exports).toHaveProperty('DappTransactionBuilder')
    expect(exports).toHaveProperty('ScriptSimulator')
    expect(exports).toHaveProperty('EventSubscription')
    expect(exports).toHaveProperty('subscribeToEvents')
  })

  it('should maintain correct module structure', () => {
    const { DappTransactionBuilder, ScriptSimulator, EventSubscription, subscribeToEvents } = require('./index')

    // Verify each export is of the correct type
    expect(DappTransactionBuilder).toBeDefined()
    expect(typeof DappTransactionBuilder).toBe('function')

    expect(ScriptSimulator).toBeDefined()
    expect(typeof ScriptSimulator).toBe('function')

    expect(EventSubscription).toBeDefined()
    expect(typeof EventSubscription).toBe('function')

    expect(subscribeToEvents).toBeDefined()
    expect(typeof subscribeToEvents).toBe('function')
  })

  it('should preserve module functionality through re-export', () => {
    const { DappTransactionBuilder } = require('./index')
    const { DappTransactionBuilder: DirectDappTransactionBuilder } = require('./dapp-tx-builder')

    // Verify that re-exported module is identical to direct import
    expect(DappTransactionBuilder).toBe(DirectDappTransactionBuilder)
  })
})

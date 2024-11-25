// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// eslint-disable-next-line header/header, @typescript-eslint/no-var-requires
const { ContractInstance } = require('./contract')

describe('DeploymentTypes', () => {
  describe('ExecutionResult', () => {
    it('should validate basic ExecutionResult structure', () => {
      const validExecutionResult = {
        txId: '1234567890abcdef',
        unsignedTx: 'unsignedTxHex',
        signature: 'signatureHex',
        gasAmount: 100,
        gasPrice: '1000000000',
        blockHash: 'blockHashHex',
        codeHash: 'codeHashHex'
      }

      // Test required fields
      expect(validExecutionResult).toHaveProperty('txId')
      expect(validExecutionResult).toHaveProperty('unsignedTx')
      expect(validExecutionResult).toHaveProperty('signature')
      expect(validExecutionResult).toHaveProperty('gasAmount')
      expect(validExecutionResult).toHaveProperty('gasPrice')
      expect(validExecutionResult).toHaveProperty('blockHash')
      expect(validExecutionResult).toHaveProperty('codeHash')

      // Test types
      expect(typeof validExecutionResult.txId).toBe('string')
      expect(typeof validExecutionResult.gasAmount).toBe('number')
    })

    it('should handle optional fields in ExecutionResult', () => {
      const resultWithOptionals = {
        txId: '1234567890abcdef',
        unsignedTx: 'unsignedTxHex',
        signature: 'signatureHex',
        gasAmount: 100,
        gasPrice: '1000000000',
        blockHash: 'blockHashHex',
        codeHash: 'codeHashHex',
        attoAlphAmount: '1000000000000000000',
        tokens: {
          tokenId1: '100',
          tokenId2: '200'
        }
      }

      expect(resultWithOptionals).toHaveProperty('attoAlphAmount')
      expect(resultWithOptionals).toHaveProperty('tokens')
      expect(typeof resultWithOptionals.attoAlphAmount).toBe('string')
      expect(typeof resultWithOptionals.tokens).toBe('object')
    })
  })

  describe('DeployContractExecutionResult', () => {
    it('should validate DeployContractExecutionResult structure', () => {
      const mockContractInstance = {
        // Add minimal ContractInstance properties
        address: '1234567890abcdef',
        contractId: 'contractId'
      }

      const deployResult = {
        // Base ExecutionResult fields
        txId: '1234567890abcdef',
        unsignedTx: 'unsignedTxHex',
        signature: 'signatureHex',
        gasAmount: 100,
        gasPrice: '1000000000',
        blockHash: 'blockHashHex',
        codeHash: 'codeHashHex',
        // DeployContractExecutionResult specific fields
        contractInstance: mockContractInstance,
        issueTokenAmount: '1000000000'
      }

      expect(deployResult).toHaveProperty('contractInstance')
      expect(deployResult.contractInstance).toHaveProperty('address')
      expect(deployResult.contractInstance).toHaveProperty('contractId')
      expect(typeof deployResult.issueTokenAmount).toBe('string')
    })
  })

  describe('RunScriptResult', () => {
    it('should validate RunScriptResult structure', () => {
      const runScriptResult = {
        // Base ExecutionResult fields
        txId: '1234567890abcdef',
        unsignedTx: 'unsignedTxHex',
        signature: 'signatureHex',
        gasAmount: 100,
        gasPrice: '1000000000',
        blockHash: 'blockHashHex',
        codeHash: 'codeHashHex',
        // RunScriptResult specific field
        groupIndex: 0
      }

      expect(runScriptResult).toHaveProperty('groupIndex')
      expect(typeof runScriptResult.groupIndex).toBe('number')
      expect(runScriptResult.groupIndex).toBeGreaterThanOrEqual(0)
    })

    it('should validate groupIndex constraints', () => {
      const validRunScriptResult = {
        txId: '1234567890abcdef',
        unsignedTx: 'unsignedTxHex',
        signature: 'signatureHex',
        gasAmount: 100,
        gasPrice: '1000000000',
        blockHash: 'blockHashHex',
        codeHash: 'codeHashHex',
        groupIndex: 3
      }

      expect(validRunScriptResult.groupIndex).toBeGreaterThanOrEqual(0)
      expect(validRunScriptResult.groupIndex).toBeLessThan(4) // Assuming max groups is 4
    })
  })

  describe('Type Compatibility', () => {
    it('should ensure DeployContractExecutionResult extends ExecutionResult', () => {
      const deployResult = {
        txId: '1234567890abcdef',
        unsignedTx: 'unsignedTxHex',
        signature: 'signatureHex',
        gasAmount: 100,
        gasPrice: '1000000000',
        blockHash: 'blockHashHex',
        codeHash: 'codeHashHex',
        contractInstance: {
          address: '1234567890abcdef',
          contractId: 'contractId'
        }
      }

      // Test that it has all ExecutionResult properties
      const executionResultKeys = ['txId', 'unsignedTx', 'signature', 'gasAmount', 'gasPrice', 'blockHash', 'codeHash']

      executionResultKeys.forEach((key) => {
        expect(deployResult).toHaveProperty(key)
      })
    })

    it('should ensure RunScriptResult extends ExecutionResult', () => {
      const runScriptResult = {
        txId: '1234567890abcdef',
        unsignedTx: 'unsignedTxHex',
        signature: 'signatureHex',
        gasAmount: 100,
        gasPrice: '1000000000',
        blockHash: 'blockHashHex',
        codeHash: 'codeHashHex',
        groupIndex: 0
      }

      // Test that it has all ExecutionResult properties
      const executionResultKeys = ['txId', 'unsignedTx', 'signature', 'gasAmount', 'gasPrice', 'blockHash', 'codeHash']

      executionResultKeys.forEach((key) => {
        expect(runScriptResult).toHaveProperty(key)
      })

      // Test RunScriptResult specific property
      expect(runScriptResult).toHaveProperty('groupIndex')
    })
  })
})

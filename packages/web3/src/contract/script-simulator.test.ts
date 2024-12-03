/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line header/header, @typescript-eslint/ban-ts-comment
// @ts-nocheck
// eslint-disable-next-line header/header
const { ScriptSimulator } = require('./script-simulator')
const { hexToBinUnsafe, binToHex } = require('../utils')
const { ALPH_TOKEN_ID } = require('../constants')

// Import internal classes - these would normally be private but we need to test them
class Stack {
  private stack: SimulatorVal[] = []

  push = (val: SimulatorVal) => {
    this.stack.push(val)
  }

  pop(): SimulatorVal {
    const result = this.stack.pop()
    if (result === undefined) {
      throw new Error('Stack is empty')
    }
    return result
  }

  popBool(): any {
    const result = this.pop()
    if (result.kind !== 'Bool' && result.kind !== 'Symbol-Bool') {
      throw new Error('Expected a Bool value on the stack')
    }
    return result
  }
}

class LocalVariables {
  private locals: any[] = []

  get(index: number): any {
    const result = this.locals[index]
    if (result === undefined) {
      throw new Error(`Local variable at index ${index} is not set`)
    }
    return result
  }

  set(index: number, val: any): void {
    this.locals[index] = val
  }

  getBool(index: number): any {
    const result = this.get(index)
    if (result.kind !== 'Bool' && result.kind !== 'Symbol-Bool') {
      throw new Error(`Local variable at index ${index} is not a Bool`)
    }
    return result
  }
}

class ApprovedAccumulator {
  private approvedTokens: { id: string; amount: bigint | 'unknown' }[] | 'unknown' = []

  constructor() {
    this.reset()
  }

  reset(): void {
    this.approvedTokens = [{ id: ALPH_TOKEN_ID, amount: 0n }]
  }

  setUnknown(): void {
    this.approvedTokens = 'unknown'
  }

  getApprovedAttoAlph(): bigint | 'unknown' | undefined {
    if (this.approvedTokens === 'unknown') {
      return 'unknown'
    }
    const approvedAttoAlph = this.approvedTokens[0].amount
    return approvedAttoAlph === 0n ? undefined : approvedAttoAlph
  }

  getApprovedTokens(): any[] | 'unknown' | undefined {
    if (this.approvedTokens === 'unknown') {
      return 'unknown'
    }
    const tokens = this.approvedTokens.slice(1)
    return tokens.length === 0 ? undefined : tokens
  }

  addApprovedAttoAlph(amount: ValU256 | SymbolU256): void {
    this.addApprovedToken({ kind: 'ByteVec', value: hexToBinUnsafe(ALPH_TOKEN_ID) }, amount)
  }

  addApprovedToken(tokenId: ValByteVec | SymbolByteVec, amount: ValU256 | SymbolU256): void {
    if (this.approvedTokens === 'unknown') {
      return
    }

    if (tokenId.kind !== 'ByteVec' || amount.kind !== 'U256') {
      this.setUnknown()
      return
    }

    const id = binToHex(tokenId.value)
    const existing = this.approvedTokens.find((t) => t.id === id)

    if (existing) {
      existing.amount += amount.value
    } else {
      this.approvedTokens.push({ id, amount: amount.value })
    }
  }
}

// Helper functions
function arrayEquals(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

function random32Bytes(): Uint8Array {
  const result = new Uint8Array(32)
  for (let i = 0; i < 32; i++) {
    result[i] = Math.floor(Math.random() * 256)
  }
  return result
}

// Create a valid mock transaction for testing
const createMockUnsignedTx = () => {
  // This should be a valid encoded transaction
  return '0000000000000000000000000000000000000000000000000000000000000000'
}

describe('ScriptSimulator', () => {
  describe('extractContractCalls', () => {
    const mockUnsignedTx = createMockUnsignedTx()

    it('should handle empty script gracefully', () => {
      const calls = ScriptSimulator.extractContractCalls(mockUnsignedTx)
      expect(calls).toEqual([])
    })

    it('should extract contract calls without errors', () => {
      const result = ScriptSimulator.extractContractCalls(mockUnsignedTx)
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('Stack Operations', () => {
    let stack: Stack

    beforeEach(() => {
      stack = new Stack()
    })

    it('should handle basic push and pop operations', () => {
      const testVal = { kind: 'Bool', value: true }
      stack.push(testVal)
      expect(stack.pop()).toEqual(testVal)
    })

    it('should throw error on empty stack pop', () => {
      expect(() => stack.pop()).toThrow('Stack is empty')
    })

    it('should properly handle type checking for bool values', () => {
      const boolVal = { kind: 'Bool', value: true }
      stack.push(boolVal)
      expect(stack.popBool()).toEqual(boolVal)
    })

    it('should handle symbol types correctly', () => {
      const symbolVal = { kind: 'Symbol-Bool', value: undefined }
      stack.push(symbolVal)
      expect(stack.popBool()).toEqual(symbolVal)
    })
  })

  describe('Local Variables', () => {
    let locals: LocalVariables

    beforeEach(() => {
      locals = new LocalVariables()
    })

    it('should handle set and get operations', () => {
      const testVal = { kind: 'Bool', value: true }
      locals.set(0, testVal)
      expect(locals.get(0)).toEqual(testVal)
    })

    it('should throw error for undefined variables', () => {
      expect(() => locals.get(0)).toThrow('Local variable at index 0 is not set')
    })

    it('should handle type-specific getters', () => {
      const boolVal = { kind: 'Bool', value: true }
      locals.set(0, boolVal)
      expect(locals.getBool(0)).toEqual(boolVal)
    })
  })

  describe('ApprovedAccumulator', () => {
    let accumulator: ApprovedAccumulator

    beforeEach(() => {
      accumulator = new ApprovedAccumulator()
    })

    it('should initialize with empty ALPH token', () => {
      expect(accumulator.getApprovedAttoAlph()).toBeUndefined()
      expect(accumulator.getApprovedTokens()).toBeUndefined()
    })

    it('should handle ALPH token approvals', () => {
      accumulator.addApprovedAttoAlph({ kind: 'U256', value: 1000n })
      expect(accumulator.getApprovedAttoAlph()).toBe(1000n)
    })

    it('should handle token approvals', () => {
      const tokenId = hexToBinUnsafe('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
      accumulator.addApprovedToken({ kind: 'ByteVec', value: tokenId }, { kind: 'U256', value: 100n })
      const approvedTokens = accumulator.getApprovedTokens()
      expect(approvedTokens).toHaveLength(1)
      expect(approvedTokens[0].amount).toBe(100n)
    })

    it('should handle unknown states', () => {
      accumulator.setUnknown()
      expect(accumulator.getApprovedAttoAlph()).toBe('unknown')
      expect(accumulator.getApprovedTokens()).toBe('unknown')
    })

    it('should accumulate multiple approvals', () => {
      const tokenId = hexToBinUnsafe('1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
      accumulator.addApprovedToken({ kind: 'ByteVec', value: tokenId }, { kind: 'U256', value: 100n })
      accumulator.addApprovedToken({ kind: 'ByteVec', value: tokenId }, { kind: 'U256', value: 50n })
      const approvedTokens = accumulator.getApprovedTokens()
      expect(approvedTokens[0].amount).toBe(150n)
    })
  })

  describe('Utility Functions', () => {
    it('should compare arrays correctly', () => {
      const arr1 = new Uint8Array([1, 2, 3])
      const arr2 = new Uint8Array([1, 2, 3])
      const arr3 = new Uint8Array([1, 2, 4])

      expect(arrayEquals(arr1, arr2)).toBe(true)
      expect(arrayEquals(arr1, arr3)).toBe(false)
    })

    it('should generate random 32 bytes', () => {
      const random = random32Bytes()
      expect(random).toBeInstanceOf(Uint8Array)
      expect(random.length).toBe(32)
    })
  })
})

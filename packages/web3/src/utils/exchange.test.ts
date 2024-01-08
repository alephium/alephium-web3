/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { PrivateKeyWallet } from '@alephium/web3-wallet'
import { FixedAssetOutput, OutputRef, Transaction, UnsignedTx } from '../api/api-alephium'
import { DUST_AMOUNT, ONE_ALPH } from '../constants'
import {
  getAddressFromUnlockScript,
  getSenderAddress,
  getALPHDepositInfo,
  isSimpleALPHTransferTx,
  isSimpleTokenTransferTx,
  validateExchangeAddress,
  isALPHTransferTx
} from './exchange'
import { NodeProvider } from '../api'

describe('exchange', function () {
  it('should get address from unlock script', () => {
    expect(getAddressFromUnlockScript('0003498dc83e77e9b5c82b88e2bba7c737fd5aee041dc6bbb4402fefa3e7460a95bb')).toEqual(
      '18Y5mtrpu9kaEW9PoyipNQcFwVtA8X5yrGYhTZwYBwXHN'
    )

    expect(
      getAddressFromUnlockScript(
        '0201010000000004581440200000000000000000000000000000000000000000000000000000000000000000868500'
      )
    ).toEqual('qCG5ZXg3b7AuGDS4HoEAhzqhCc2yxMqBYjYimBj1QFFT')

    expect(() =>
      getAddressFromUnlockScript(
        '01024437e4e935b8c50558c361ec99255bf393bf9862af7a3c24a813ae155284211f4a01c3c6f3f8614f159e7373f4837ef95432c82dc47a5489df50046e7e7e3dcb227db403'
      )
    ).toThrow('Naive multi-sig address is not supported for exchanges as it will be replaced by P2SH')

    expect(() => getAddressFromUnlockScript('')).toThrow('UnlockScript is empty')
    expect(() => getAddressFromUnlockScript('030011223344')).toThrow('Invalid unlock script type')
  })

  it('should validate exchange address', () => {
    expect(() => validateExchangeAddress('18Y5mtrpu9kaEW9PoyipNQcFwVtA8X5yrGYhTZwYBwXHN')).not.toThrow()
    expect(() => validateExchangeAddress('qCG5ZXg3b7AuGDS4HoEAhzqhCc2yxMqBYjYimBj1QFFT')).not.toThrow()
    expect(() => validateExchangeAddress('22sTaM5xer7h81LzaGA2JiajRwHwECpAv9bBuFUH5rrnr')).toThrow(
      'Invalid address type'
    )
    expect(() =>
      validateExchangeAddress(
        'X3RMnvb8h3RFrrbBraEouAWU9Ufu4s2WTXUQfLCvDtcmqCWRwkVLc69q2NnwYW2EMwg4QBN2UopkEmYLLLgHP9TQ38FK15RnhhEwguRyY6qCuAoRfyjHRnqYnTvfypPgD7w1ku'
      )
    ).toThrow('Invalid address type')
    expect(() => validateExchangeAddress('18Y5mtrpu9kaEW9PoyipNQcFwVtA8X5yrGYhTZwYBw')).toThrow(
      'Invalid address length'
    )
    expect(() => validateExchangeAddress('qCG5ZXg3b7AuGDS4HoEAhzqhCc2yxMqBYjYimBj1Q')).toThrow('Invalid address type')
    expect(() => validateExchangeAddress('')).toThrow('Address is empty')
    expect(() => validateExchangeAddress('6aac0693404223ed9c492bc61fd3cbf9')).toThrow('Invalid base58 string')
    expect(() => validateExchangeAddress('I8Y5mtrpu9kaEW9PoyipNQcFwVtA8X5yrGYhTZwYBwXHN')).toThrow(
      'Invalid base58 string'
    )
    expect(() => validateExchangeAddress('1GKWggDapVjTdU2vyna3YjVgdpnwHkKzx8FHA9gU7uoeY')).not.toThrow()
    expect(() => validateExchangeAddress('1fvbFEFML2F2GZmNDHd9uafFALMG8QSwbCJHfQipw6sz')).not.toThrow()
    const nodeProvider = new NodeProvider('http://127.0.0.1:22973')
    for (let i = 0; i < 20; i++) {
      const wallet0 = PrivateKeyWallet.Random(undefined, nodeProvider, 'default')
      expect(() => validateExchangeAddress(wallet0.address)).not.toThrow()
      const wallet1 = PrivateKeyWallet.Random(undefined, nodeProvider, 'bip340-schnorr')
      expect(() => validateExchangeAddress(wallet1.address)).not.toThrow()
    }
  })

  const exchangeAddress = '1khyjTYdKEyCSyg6SqyDf97Vq3EmSJF9zPugb3KYERP8'
  const exchangeUnlockScript = '000266eb23454a04cf86e7a86a494a79d347ee27bffde4b44d1feeb8de146ddb2f48'
  expect(getAddressFromUnlockScript(exchangeUnlockScript)).toEqual(exchangeAddress)

  const fromAddress = '1BPp69hdr78Fm6Qsh5N5FTmbgw5jEgg4P1K5oyvUBK8fw'
  const fromUnlockScript = '00023d7d9b04c6729c1e7ca27e08c295e3f45bdb5de9adcf2598b29c717595e7b1bf'
  const invalidUnlockupScript = '0003498dc83e77e9b5c82b88e2bba7c737fd5aee041dc6bbb4402fefa3e7460a95bb'
  const invalidToAddress = '18Y5mtrpu9kaEW9PoyipNQcFwVtA8X5yrGYhTZwYBwXHN'
  const outputRef: OutputRef = { hint: 0, key: '' }
  const outputTemplate: FixedAssetOutput = {
    hint: 0,
    key: '',
    lockTime: 0,
    message: '',
    attoAlphAmount: '10',
    address: '',
    tokens: []
  }

  const unsignedTxTemplate: UnsignedTx = {
    txId: '6aac0693404223ed9c492bc61fd3cbf99f36927925bb2f3dc237fcf92b39d684',
    version: 0,
    networkId: 0,
    gasAmount: 78580,
    gasPrice: '100000000000',
    inputs: [
      { outputRef, unlockScript: fromUnlockScript },
      { outputRef, unlockScript: fromUnlockScript },
      { outputRef, unlockScript: fromUnlockScript }
    ],
    fixedOutputs: [
      { ...outputTemplate, address: fromAddress },
      { ...outputTemplate, address: fromAddress },
      { ...outputTemplate, address: exchangeAddress }
    ]
  }
  const txTemplate: Transaction = {
    unsigned: unsignedTxTemplate,
    scriptExecutionOk: true,
    contractInputs: [],
    generatedOutputs: [],
    inputSignatures: [],
    scriptSignatures: []
  }

  it('should validate deposit ALPH transaction', () => {
    expect(isSimpleALPHTransferTx(txTemplate)).toEqual(true)
    expect(isALPHTransferTx(txTemplate)).toEqual(true)
    expect(getSenderAddress(txTemplate)).toEqual(fromAddress)
    expect(getALPHDepositInfo(txTemplate)).toEqual([{ targetAddress: exchangeAddress, depositAmount: 10n }])

    const tx0: Transaction = { ...txTemplate, unsigned: { ...unsignedTxTemplate, scriptOpt: '00112233' } }
    const tx1: Transaction = { ...txTemplate, contractInputs: [outputRef] }
    const tx2: Transaction = { ...txTemplate, generatedOutputs: [{ ...outputTemplate, type: 'AssetOutput' }] }
    const tx3: Transaction = { ...txTemplate, unsigned: { ...unsignedTxTemplate, inputs: [] } }
    ;[tx0, tx1, tx2, tx3].forEach((tx) => expect(isALPHTransferTx(tx)).toEqual(false))
    const invalidInput = { outputRef, unlockScript: invalidUnlockupScript }
    const tx4: Transaction = {
      ...txTemplate,
      unsigned: { ...unsignedTxTemplate, inputs: [...unsignedTxTemplate.inputs, invalidInput] }
    }
    const invalidOutput1 = { ...outputTemplate, address: invalidToAddress }
    const tx5: Transaction = {
      ...txTemplate,
      unsigned: { ...unsignedTxTemplate, fixedOutputs: [...unsignedTxTemplate.fixedOutputs, invalidOutput1] }
    }
    const invalidOutput2 = { ...outputTemplate, address: exchangeAddress, tokens: [{ id: '', amount: '10' }] }
    const tx6: Transaction = {
      ...txTemplate,
      unsigned: {
        ...unsignedTxTemplate,
        fixedOutputs: [...unsignedTxTemplate.fixedOutputs.slice(0, -1), invalidOutput2]
      }
    }
    const tx7: Transaction = {
      ...txTemplate,
      unsigned: {
        ...unsignedTxTemplate,
        inputs: [{ outputRef, unlockScript: exchangeUnlockScript }],
        fixedOutputs: unsignedTxTemplate.fixedOutputs.slice(2)
      }
    }
    const tx8: Transaction = {
      ...txTemplate,
      unsigned: {
        ...unsignedTxTemplate,
        fixedOutputs: [...unsignedTxTemplate.fixedOutputs.slice(2), invalidOutput1]
      }
    }
    const tx9: Transaction = {
      ...txTemplate,
      unsigned: {
        ...unsignedTxTemplate,
        fixedOutputs: [...unsignedTxTemplate.fixedOutputs.slice(0, 2)]
      }
    }
    const invalidTxs = [tx0, tx1, tx2, tx3, tx4, tx5, tx6, tx7, tx8, tx9]
    invalidTxs.forEach((tx) => expect(isSimpleALPHTransferTx(tx)).toEqual(false))

    const multipleTargetAddressOutputTx: Transaction = {
      ...txTemplate,
      unsigned: {
        ...unsignedTxTemplate,
        fixedOutputs: [...unsignedTxTemplate.fixedOutputs, { ...outputTemplate, address: exchangeAddress }]
      }
    }
    expect(isSimpleALPHTransferTx(multipleTargetAddressOutputTx)).toEqual(true)
    expect(getALPHDepositInfo(multipleTargetAddressOutputTx)).toEqual([
      {
        targetAddress: exchangeAddress,
        depositAmount: 20n
      }
    ])

    const sweepTx: Transaction = {
      ...txTemplate,
      unsigned: {
        ...unsignedTxTemplate,
        fixedOutputs: [unsignedTxTemplate.fixedOutputs[2], { ...outputTemplate, address: exchangeAddress }]
      }
    }
    expect(isSimpleALPHTransferTx(sweepTx)).toEqual(true)
    expect(getALPHDepositInfo(sweepTx)).toEqual([
      {
        targetAddress: exchangeAddress,
        depositAmount: 20n
      }
    ])

    const newAddress = PrivateKeyWallet.Random(undefined, new NodeProvider(''), 'default').address
    const poolRewardTx: Transaction = {
      ...txTemplate,
      unsigned: {
        ...unsignedTxTemplate,
        fixedOutputs: [
          ...unsignedTxTemplate.fixedOutputs,
          { ...outputTemplate, address: exchangeAddress },
          { ...outputTemplate, address: newAddress },
          { ...outputTemplate, address: newAddress },
          { ...outputTemplate, address: newAddress }
        ]
      }
    }
    expect(getALPHDepositInfo(poolRewardTx)).toEqual([
      {
        targetAddress: exchangeAddress,
        depositAmount: 20n
      },
      {
        targetAddress: newAddress,
        depositAmount: 30n
      }
    ])
  })

  it('should validate deposit token transaction', () => {
    expect(isSimpleTokenTransferTx(txTemplate)).toEqual(false)

    const tokenId = '1a281053ba8601a658368594da034c2e99a0fb951b86498d05e76aedfe666800'
    const exchangeTokenOutput: FixedAssetOutput = {
      ...outputTemplate,
      tokens: [{ id: tokenId, amount: '10' }],
      address: exchangeAddress,
      attoAlphAmount: DUST_AMOUNT.toString()
    }
    const tokenUnsignedTxTemplate = {
      ...unsignedTxTemplate,
      fixedOutputs: [...unsignedTxTemplate.fixedOutputs.slice(0, -1), exchangeTokenOutput]
    }
    const tokenTxTemplate: Transaction = { ...txTemplate, unsigned: tokenUnsignedTxTemplate }
    expect(isSimpleTokenTransferTx(tokenTxTemplate)).toEqual(true)

    const tx0: Transaction = { ...tokenTxTemplate, unsigned: { ...tokenUnsignedTxTemplate, scriptOpt: '00112233' } }
    const tx1: Transaction = { ...tokenTxTemplate, contractInputs: [outputRef] }
    const tx2: Transaction = { ...tokenTxTemplate, generatedOutputs: [{ ...outputTemplate, type: 'AssetOutput' }] }
    const tx3: Transaction = { ...tokenTxTemplate, unsigned: { ...tokenUnsignedTxTemplate, inputs: [] } }
    const invalidInput = { outputRef, unlockScript: invalidUnlockupScript }
    const tx4: Transaction = {
      ...txTemplate,
      unsigned: { ...tokenUnsignedTxTemplate, inputs: [...tokenUnsignedTxTemplate.inputs, invalidInput] }
    }
    const invalidOutput1 = { ...tokenUnsignedTxTemplate.fixedOutputs[2], address: invalidToAddress }
    const tx5: Transaction = {
      ...txTemplate,
      unsigned: { ...tokenUnsignedTxTemplate, fixedOutputs: [...tokenUnsignedTxTemplate.fixedOutputs, invalidOutput1] }
    }
    const invalidOutput2 = { ...tokenUnsignedTxTemplate.fixedOutputs[2], attoAlphAmount: ONE_ALPH.toString() }
    const tx6: Transaction = {
      ...txTemplate,
      unsigned: {
        ...tokenUnsignedTxTemplate,
        fixedOutputs: [...tokenUnsignedTxTemplate.fixedOutputs.slice(0, -1), invalidOutput2]
      }
    }
    const tx7: Transaction = {
      ...txTemplate,
      unsigned: {
        ...tokenUnsignedTxTemplate,
        inputs: [{ outputRef, unlockScript: exchangeUnlockScript }],
        fixedOutputs: tokenUnsignedTxTemplate.fixedOutputs.slice(2)
      }
    }
    const tx8: Transaction = {
      ...txTemplate,
      unsigned: {
        ...tokenUnsignedTxTemplate,
        fixedOutputs: [...tokenUnsignedTxTemplate.fixedOutputs.slice(2), invalidOutput1]
      }
    }
    const tx9: Transaction = {
      ...txTemplate,
      unsigned: {
        ...tokenUnsignedTxTemplate,
        fixedOutputs: [...tokenUnsignedTxTemplate.fixedOutputs.slice(0, 2)]
      }
    }

    const invalidTxs = [tx0, tx1, tx2, tx3, tx4, tx5, tx6, tx7, tx8, tx9]
    invalidTxs.forEach((tx) => expect(isSimpleTokenTransferTx(tx)).toEqual(false))
  })
})

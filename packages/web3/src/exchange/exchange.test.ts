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
import {
  getAddressFromUnlockScript,
  getSenderAddress,
  getALPHDepositInfo,
  validateExchangeAddress,
  isALPHTransferTx,
  isTokenTransferTx,
  getTokenDepositInfo
} from './exchange'
import { NodeProvider } from '../api'
import { binToHex } from '../utils'

describe('exchange', function () {
  it('should get address from unlock script', () => {
    expect(() =>
      getAddressFromUnlockScript('0003498dc83e77e9b5c82b88e2bba7c737fd5aee041dc6bbb4402fefa3e7460a95bz')
    ).toThrow(`expected a hex string`)
    expect(getAddressFromUnlockScript('0003498dc83e77e9b5c82b88e2bba7c737fd5aee041dc6bbb4402fefa3e7460a95bb')).toEqual(
      '18Y5mtrpu9kaEW9PoyipNQcFwVtA8X5yrGYhTZwYBwXHN'
    )
    expect(() =>
      getAddressFromUnlockScript('0003498dc83e77e9b5c82b88e2bba7c737fd5aee041dc6bbb4402fefa3e7460a95')
    ).toThrow('Invalid p2pkh unlock script')

    expect(
      getAddressFromUnlockScript(
        '0201010000000004581440200000000000000000000000000000000000000000000000000000000000000000868500'
      )
    ).toEqual('qCG5ZXg3b7AuGDS4HoEAhzqhCc2yxMqBYjYimBj1QFFT')
    expect(() =>
      getAddressFromUnlockScript(
        '02010100000000045814402000000000000000000000000000000000000000000000000000000000000000008685'
      )
    ).toThrow('Invalid p2sh unlock script')

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
    expect(isALPHTransferTx(txTemplate)).toEqual(true)
    expect(isTokenTransferTx(txTemplate)).toEqual(false)
    expect(getSenderAddress(txTemplate)).toEqual(fromAddress)
    expect(getALPHDepositInfo(txTemplate)).toEqual([{ targetAddress: exchangeAddress, depositAmount: 10n }])

    const tx0: Transaction = { ...txTemplate, unsigned: { ...unsignedTxTemplate, scriptOpt: '00112233' } }
    const tx1: Transaction = { ...txTemplate, contractInputs: [outputRef] }
    const tx2: Transaction = { ...txTemplate, generatedOutputs: [{ ...outputTemplate, type: 'AssetOutput' }] }
    const tx3: Transaction = { ...txTemplate, unsigned: { ...unsignedTxTemplate, inputs: [] } }
    const tx4: Transaction = {
      ...txTemplate,
      unsigned: { ...unsignedTxTemplate, fixedOutputs: [{ ...outputTemplate, tokens: [{ id: '00', amount: '10' }] }] }
    }
    ;[tx0, tx1, tx2, tx3, tx4].forEach((tx) => expect(isALPHTransferTx(tx)).toEqual(false))

    const multipleTargetAddressOutputTx: Transaction = {
      ...txTemplate,
      unsigned: {
        ...unsignedTxTemplate,
        fixedOutputs: [...unsignedTxTemplate.fixedOutputs, { ...outputTemplate, address: exchangeAddress }]
      }
    }
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
    const tokenId0 = '25469eb0d0d0a55deea832924547b7b166c70a3554fe321e81886d3c18f19d64'
    const tokenOutputTemplate = { ...outputTemplate, tokens: [{ id: tokenId0, amount: '10' }] }
    const unsignedTokenTxTemplate = {
      ...unsignedTxTemplate,
      fixedOutputs: unsignedTxTemplate.fixedOutputs.map((o) => ({ ...tokenOutputTemplate, address: o.address }))
    }
    const tokenTxTemplate = { ...txTemplate, unsigned: unsignedTokenTxTemplate }
    expect(isALPHTransferTx(tokenTxTemplate)).toEqual(false)
    expect(isTokenTransferTx(tokenTxTemplate)).toEqual(true)
    expect(getSenderAddress(tokenTxTemplate)).toEqual(fromAddress)

    const tx0: Transaction = { ...tokenTxTemplate, unsigned: { ...unsignedTokenTxTemplate, scriptOpt: '00112233' } }
    const tx1: Transaction = { ...tokenTxTemplate, contractInputs: [outputRef] }
    const tx2: Transaction = { ...tokenTxTemplate, generatedOutputs: [{ ...outputTemplate, type: 'AssetOutput' }] }
    const tx3: Transaction = { ...tokenTxTemplate, unsigned: { ...unsignedTokenTxTemplate, inputs: [] } }
    ;[txTemplate, tx0, tx1, tx2, tx3].forEach((tx) => expect(isTokenTransferTx(tx)).toEqual(false))

    const multipleTargetAddressOutputTx: Transaction = {
      ...tokenTxTemplate,
      unsigned: {
        ...unsignedTokenTxTemplate,
        fixedOutputs: [...unsignedTokenTxTemplate.fixedOutputs, { ...tokenOutputTemplate, address: exchangeAddress }]
      }
    }
    expect(getTokenDepositInfo(multipleTargetAddressOutputTx)).toEqual([
      {
        tokenId: tokenId0,
        targetAddress: exchangeAddress,
        depositAmount: 20n
      }
    ])

    const sweepTx: Transaction = {
      ...tokenTxTemplate,
      unsigned: {
        ...unsignedTokenTxTemplate,
        fixedOutputs: [unsignedTokenTxTemplate.fixedOutputs[2], { ...tokenOutputTemplate, address: exchangeAddress }]
      }
    }
    expect(getTokenDepositInfo(sweepTx)).toEqual([
      {
        tokenId: tokenId0,
        targetAddress: exchangeAddress,
        depositAmount: 20n
      }
    ])

    const tokenId1 = '3de370f893cb1383c828c0eb22c89aceb13fa56ddced1848db27ce7fa419c80c'
    const multipleTokenTx: Transaction = {
      ...tokenTxTemplate,
      unsigned: {
        ...unsignedTokenTxTemplate,
        fixedOutputs: [
          ...unsignedTokenTxTemplate.fixedOutputs,
          { ...tokenOutputTemplate, tokens: [{ id: tokenId1, amount: '10' }], address: exchangeAddress },
          { ...tokenOutputTemplate, tokens: [{ id: tokenId0, amount: '10' }], address: exchangeAddress },
          { ...tokenOutputTemplate, tokens: [{ id: tokenId1, amount: '10' }], address: exchangeAddress }
        ]
      }
    }
    expect(getTokenDepositInfo(multipleTokenTx)).toEqual([
      {
        tokenId: tokenId0,
        targetAddress: exchangeAddress,
        depositAmount: 20n
      },
      {
        tokenId: tokenId1,
        targetAddress: exchangeAddress,
        depositAmount: 20n
      }
    ])
  })
})

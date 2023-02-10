/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  web3,
  Contract as ContractArtifact,
  SignerProvider,
  Address,
  Token,
  toApiVals,
  ContractState,
  node,
  binToHex,
  TestContractResult,
  InputAsset,
  Asset,
  HexString,
  SignDeployContractTxResult,
  contractIdFromAddress,
  fromApiArray,
} from "@alephium/web3";

export namespace Warnings {
  export type Fields = {
    a: bigint;
    b: bigint;
  };

  export type State = Fields & Omit<ContractState, "fields">;

  export async function deploy(
    signer: SignerProvider,
    initFields: Warnings.Fields,
    deployParams?: {
      initialAttoAlphAmount?: bigint;
      initialTokenAmounts?: Token[];
      issueTokenAmount?: bigint;
      gasAmount?: number;
      gasPrice?: bigint;
    }
  ): Promise<Contract> {
    const deployResult = await artifact.deploy(signer, {
      initialFields: initFields,
      initialAttoAlphAmount: deployParams?.initialAttoAlphAmount,
      initialTokenAmounts: deployParams?.initialTokenAmounts,
      issueTokenAmount: deployParams?.issueTokenAmount,
      gasAmount: deployParams?.gasAmount,
      gasPrice: deployParams?.gasPrice,
    });
    return new Contract(
      deployResult.contractAddress,
      deployResult.contractId,
      deployResult.fromGroup,
      deployResult
    );
  }

  export function attach(
    address: string,
    deployResult?: SignDeployContractTxResult
  ): Contract {
    const contractId = binToHex(contractIdFromAddress(address));
    const groupIndex = parseInt(contractId.slice(-2));
    return new Contract(address, contractId, groupIndex, deployResult);
  }

  export class Contract {
    readonly address: Address;
    readonly contractId: string;
    readonly groupIndex: number;
    deployResult: SignDeployContractTxResult | undefined;

    constructor(
      address: Address,
      contractId: string,
      groupIndex: number,
      deployResult?: SignDeployContractTxResult
    ) {
      this.address = address;
      this.contractId = contractId;
      this.groupIndex = groupIndex;
      this.deployResult = deployResult;
    }

    async fetchState(): Promise<State> {
      const state = await artifact.fetchState(this.address, this.groupIndex);
      return {
        ...state,
        a: state.fields["a"] as bigint,
        b: state.fields["b"] as bigint,
      };
    }

    // This is used for testing contract functions
    static stateForTest(
      a: bigint,
      b: bigint,
      asset?: Asset,
      address?: string
    ): ContractState {
      const newAsset = {
        alphAmount: asset?.alphAmount ?? BigInt(1000000000000000000),
        tokens: asset?.tokens,
      };
      return artifact.toState({ a: a, b: b }, newAsset, address);
    }

    static async testFooMethod(
      args: { x: bigint; y: bigint },
      initFields: Warnings.Fields,
      testParams?: {
        group?: number;
        address?: string;
        initialAsset?: Asset;
        existingContracts?: ContractState[];
        inputAssets?: InputAsset[];
      }
    ): Promise<Omit<TestContractResult, "returns"> & { returns: [] }> {
      const initialAsset = {
        alphAmount:
          testParams?.initialAsset?.alphAmount ?? BigInt(1000000000000000000),
        tokens: testParams?.initialAsset?.tokens,
      };
      const _testParams = {
        ...testParams,
        testMethodIndex: 0,
        testArgs: args,
        initialFields: initFields,
        initialAsset: initialAsset,
      };
      const testResult = await artifact.testPublicMethod("foo", _testParams);
      return { ...testResult, returns: testResult.returns as [] };
    }
  }

  export const artifact = ContractArtifact.fromJson(
    JSON.parse(`{
  "version": "v1.7.0",
  "name": "Warnings",
  "bytecode": "02010701000202000102",
  "codeHash": "9a0c90d67d729a478062d6794cf7b75c27483c50f6fe2ad13c5ed8873ad1fde2",
  "fieldsSig": {
    "names": [
      "a",
      "b"
    ],
    "types": [
      "U256",
      "U256"
    ],
    "isMutable": [
      false,
      false
    ]
  },
  "eventsSig": [],
  "functions": [
    {
      "name": "foo",
      "usePreapprovedAssets": false,
      "useAssetsInContract": false,
      "isPublic": true,
      "paramNames": [
        "x",
        "y"
      ],
      "paramTypes": [
        "U256",
        "U256"
      ],
      "paramIsMutable": [
        false,
        false
      ],
      "returnTypes": []
    }
  ]
}`)
  );
}

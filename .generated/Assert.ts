import {
  web3,
  Contract,
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
  Fields,
  SignDeployContractTxResult,
  contractIdFromAddress,
  fromApiArray,
} from "@alephium/web3";

export type _AssertState = Omit<ContractState, "fields">;

export class Assert {
  static readonly contract: Contract = Contract.fromJson(
    JSON.parse(`{
  "version": "v1.7.0",
  "name": "Assert",
  "bytecode": "00010b0100000000050d0e2f0f7b",
  "codeHash": "5bd05924fb9a23ea105df065a8c2dfa463b9ee53cc14a60320140d19dd6151ca",
  "fieldsSig": {
    "names": [],
    "types": [],
    "isMutable": []
  },
  "eventsSig": [],
  "functions": [
    {
      "name": "test",
      "usePreapprovedAssets": false,
      "useAssetsInContract": false,
      "isPublic": true,
      "paramNames": [],
      "paramTypes": [],
      "paramIsMutable": [],
      "returnTypes": []
    }
  ]
}`)
  );

  readonly address: Address;
  readonly contractId: string;
  readonly groupIndex: number;
  deployResult: SignDeployContractTxResult | undefined;

  private constructor(
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

  static async deploy(
    signer: SignerProvider,
    _extraParams?: {
      initialAttoAlphAmount?: bigint;
      initialTokenAmounts?: Token[];
      issueTokenAmount?: bigint;
      gasAmount?: number;
      gasPrice?: bigint;
    }
  ): Promise<Assert> {
    const _deployResult = await Assert.contract.deploy(signer, {
      initialFields: {},
      initialAttoAlphAmount: _extraParams?.initialAttoAlphAmount,
      initialTokenAmounts: _extraParams?.initialTokenAmounts,
      issueTokenAmount: _extraParams?.issueTokenAmount,
      gasAmount: _extraParams?.gasAmount,
      gasPrice: _extraParams?.gasPrice,
    });
    return new Assert(
      _deployResult.contractAddress,
      _deployResult.contractId,
      _deployResult.fromGroup,
      _deployResult
    );
  }

  static connect(
    address: string,
    deployResult?: SignDeployContractTxResult
  ): Assert {
    const contractId = binToHex(contractIdFromAddress(address));
    const groupIndex = parseInt(contractId.slice(-2));
    return new Assert(address, contractId, groupIndex, deployResult);
  }

  async fetchState(): Promise<_AssertState> {
    const state = await Assert.contract.fetchState(
      this.address,
      this.groupIndex
    );
    return {
      ...state,
    };
  }

  // This is used for testing contract functions
  static stateForTest(asset?: Asset, address?: string): ContractState {
    const newAsset = {
      alphAmount: asset?.alphAmount ?? BigInt("1000000000000000000"),
      tokens: asset?.tokens,
    };
    return Assert.contract.toState({}, newAsset, address);
  }

  static async testTest(_extraParams?: {
    group?: number;
    address?: string;
    initialAsset?: Asset;
    existingContracts?: ContractState[];
    inputAssets?: InputAsset[];
  }): Promise<Omit<TestContractResult, "returns"> & { returns: [] }> {
    const _initialAsset = {
      alphAmount:
        _extraParams?.initialAsset?.alphAmount ?? BigInt("1000000000000000000"),
      tokens: _extraParams?.initialAsset?.tokens,
    };
    const _testParams = {
      ..._extraParams,
      testMethodIndex: 0,
      testArgs: {},
      initialFields: {},
      initialAsset: _initialAsset,
    };
    const _testResult = await Assert.contract.testPublicMethod(
      "test",
      _testParams
    );
    return { ..._testResult, returns: _testResult.returns as [] };
  }
}

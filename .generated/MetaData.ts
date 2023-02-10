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

export type _MetaDataState = Omit<ContractState, "fields">;

export class MetaData {
  static readonly contract: Contract = Contract.fromJson(
    JSON.parse(`{
  "version": "v1.7.0",
  "name": "MetaData",
  "bytecode": "0003144027402e010300000005b4b413c40de0b6b3a7640000a702000200000004b213c40de0b6b3a7640000a90200000000000102",
  "codeHash": "cade0de390b8e15960b263ac35aa013cb84f844bce6e3e53e6bfe2cc9166623f",
  "fieldsSig": {
    "names": [],
    "types": [],
    "isMutable": []
  },
  "eventsSig": [],
  "functions": [
    {
      "name": "foo",
      "usePreapprovedAssets": true,
      "useAssetsInContract": false,
      "isPublic": true,
      "paramNames": [],
      "paramTypes": [],
      "paramIsMutable": [],
      "returnTypes": []
    },
    {
      "name": "bar",
      "usePreapprovedAssets": false,
      "useAssetsInContract": true,
      "isPublic": false,
      "paramNames": [],
      "paramTypes": [],
      "paramIsMutable": [],
      "returnTypes": []
    },
    {
      "name": "baz",
      "usePreapprovedAssets": false,
      "useAssetsInContract": false,
      "isPublic": false,
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
  ): Promise<MetaData> {
    const _deployResult = await MetaData.contract.deploy(signer, {
      initialFields: {},
      initialAttoAlphAmount: _extraParams?.initialAttoAlphAmount,
      initialTokenAmounts: _extraParams?.initialTokenAmounts,
      issueTokenAmount: _extraParams?.issueTokenAmount,
      gasAmount: _extraParams?.gasAmount,
      gasPrice: _extraParams?.gasPrice,
    });
    return new MetaData(
      _deployResult.contractAddress,
      _deployResult.contractId,
      _deployResult.fromGroup,
      _deployResult
    );
  }

  static connect(
    address: string,
    deployResult?: SignDeployContractTxResult
  ): MetaData {
    const contractId = binToHex(contractIdFromAddress(address));
    const groupIndex = parseInt(contractId.slice(-2));
    return new MetaData(address, contractId, groupIndex, deployResult);
  }

  async fetchState(): Promise<_MetaDataState> {
    const state = await MetaData.contract.fetchState(
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
    return MetaData.contract.toState({}, newAsset, address);
  }

  static async testFoo(_extraParams?: {
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
    const _testResult = await MetaData.contract.testPublicMethod(
      "foo",
      _testParams
    );
    return { ..._testResult, returns: _testResult.returns as [] };
  }

  static async testBar(_extraParams?: {
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
      testMethodIndex: 1,
      testArgs: {},
      initialFields: {},
      initialAsset: _initialAsset,
    };
    const _testResult = await MetaData.contract.testPrivateMethod(
      "bar",
      _testParams
    );
    return { ..._testResult, returns: _testResult.returns as [] };
  }

  static async testBaz(_extraParams?: {
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
      testMethodIndex: 2,
      testArgs: {},
      initialFields: {},
      initialAsset: _initialAsset,
    };
    const _testResult = await MetaData.contract.testPrivateMethod(
      "baz",
      _testParams
    );
    return { ..._testResult, returns: _testResult.returns as [] };
  }
}

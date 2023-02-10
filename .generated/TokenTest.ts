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

export type _TokenTestFields = {
  symbol: string;
  name: string;
  decimals: bigint;
  totalSupply: bigint;
};

export type _TokenTestState = _TokenTestFields & Omit<ContractState, "fields">;

export class TokenTest {
  static readonly contract: Contract = Contract.fromJson(
    JSON.parse(`{
  "version": "v1.7.0",
  "name": "TokenTest",
  "bytecode": "040409121b4024010000000102ce0002010000000102ce0102010000000102ce0202010000000102ce0302",
  "codeHash": "d9c9fab84f779f2e90ca9e9b1fafd6d9c9dc0f8b84256169e20961f9c917bab8",
  "fieldsSig": {
    "names": [
      "symbol",
      "name",
      "decimals",
      "totalSupply"
    ],
    "types": [
      "ByteVec",
      "ByteVec",
      "U256",
      "U256"
    ],
    "isMutable": [
      false,
      false,
      false,
      false
    ]
  },
  "eventsSig": [],
  "functions": [
    {
      "name": "getSymbol",
      "usePreapprovedAssets": false,
      "useAssetsInContract": false,
      "isPublic": true,
      "paramNames": [],
      "paramTypes": [],
      "paramIsMutable": [],
      "returnTypes": [
        "ByteVec"
      ]
    },
    {
      "name": "getName",
      "usePreapprovedAssets": false,
      "useAssetsInContract": false,
      "isPublic": true,
      "paramNames": [],
      "paramTypes": [],
      "paramIsMutable": [],
      "returnTypes": [
        "ByteVec"
      ]
    },
    {
      "name": "getDecimals",
      "usePreapprovedAssets": false,
      "useAssetsInContract": false,
      "isPublic": true,
      "paramNames": [],
      "paramTypes": [],
      "paramIsMutable": [],
      "returnTypes": [
        "U256"
      ]
    },
    {
      "name": "getTotalSupply",
      "usePreapprovedAssets": false,
      "useAssetsInContract": false,
      "isPublic": true,
      "paramNames": [],
      "paramTypes": [],
      "paramIsMutable": [],
      "returnTypes": [
        "U256"
      ]
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
    symbol: string,
    name: string,
    decimals: bigint,
    totalSupply: bigint,
    _extraParams?: {
      initialAttoAlphAmount?: bigint;
      initialTokenAmounts?: Token[];
      issueTokenAmount?: bigint;
      gasAmount?: number;
      gasPrice?: bigint;
    }
  ): Promise<TokenTest> {
    const _deployResult = await TokenTest.contract.deploy(signer, {
      initialFields: {
        symbol: symbol,
        name: name,
        decimals: decimals,
        totalSupply: totalSupply,
      },
      initialAttoAlphAmount: _extraParams?.initialAttoAlphAmount,
      initialTokenAmounts: _extraParams?.initialTokenAmounts,
      issueTokenAmount: _extraParams?.issueTokenAmount,
      gasAmount: _extraParams?.gasAmount,
      gasPrice: _extraParams?.gasPrice,
    });
    return new TokenTest(
      _deployResult.contractAddress,
      _deployResult.contractId,
      _deployResult.fromGroup,
      _deployResult
    );
  }

  static connect(
    address: string,
    deployResult?: SignDeployContractTxResult
  ): TokenTest {
    const contractId = binToHex(contractIdFromAddress(address));
    const groupIndex = parseInt(contractId.slice(-2));
    return new TokenTest(address, contractId, groupIndex, deployResult);
  }

  async fetchState(): Promise<_TokenTestState> {
    const state = await TokenTest.contract.fetchState(
      this.address,
      this.groupIndex
    );
    return {
      ...state,
      symbol: state.fields["symbol"] as string,
      name: state.fields["name"] as string,
      decimals: state.fields["decimals"] as bigint,
      totalSupply: state.fields["totalSupply"] as bigint,
    };
  }

  // This is used for testing contract functions
  static stateForTest(
    symbol: string,
    name: string,
    decimals: bigint,
    totalSupply: bigint,
    asset?: Asset,
    address?: string
  ): ContractState {
    const newAsset = {
      alphAmount: asset?.alphAmount ?? BigInt("1000000000000000000"),
      tokens: asset?.tokens,
    };
    return TokenTest.contract.toState(
      {
        symbol: symbol,
        name: name,
        decimals: decimals,
        totalSupply: totalSupply,
      },
      newAsset,
      address
    );
  }

  static async testGetSymbol(
    _initFields: _TokenTestFields | Fields,
    _extraParams?: {
      group?: number;
      address?: string;
      initialAsset?: Asset;
      existingContracts?: ContractState[];
      inputAssets?: InputAsset[];
    }
  ): Promise<Omit<TestContractResult, "returns"> & { returns: [string] }> {
    const _initialAsset = {
      alphAmount:
        _extraParams?.initialAsset?.alphAmount ?? BigInt("1000000000000000000"),
      tokens: _extraParams?.initialAsset?.tokens,
    };
    const _testParams = {
      ..._extraParams,
      testMethodIndex: 0,
      testArgs: {},
      initialFields: _initFields as Fields,
      initialAsset: _initialAsset,
    };
    const _testResult = await TokenTest.contract.testPublicMethod(
      "getSymbol",
      _testParams
    );
    return { ..._testResult, returns: _testResult.returns as [string] };
  }

  static async testGetName(
    _initFields: _TokenTestFields | Fields,
    _extraParams?: {
      group?: number;
      address?: string;
      initialAsset?: Asset;
      existingContracts?: ContractState[];
      inputAssets?: InputAsset[];
    }
  ): Promise<Omit<TestContractResult, "returns"> & { returns: [string] }> {
    const _initialAsset = {
      alphAmount:
        _extraParams?.initialAsset?.alphAmount ?? BigInt("1000000000000000000"),
      tokens: _extraParams?.initialAsset?.tokens,
    };
    const _testParams = {
      ..._extraParams,
      testMethodIndex: 1,
      testArgs: {},
      initialFields: _initFields as Fields,
      initialAsset: _initialAsset,
    };
    const _testResult = await TokenTest.contract.testPublicMethod(
      "getName",
      _testParams
    );
    return { ..._testResult, returns: _testResult.returns as [string] };
  }

  static async testGetDecimals(
    _initFields: _TokenTestFields | Fields,
    _extraParams?: {
      group?: number;
      address?: string;
      initialAsset?: Asset;
      existingContracts?: ContractState[];
      inputAssets?: InputAsset[];
    }
  ): Promise<Omit<TestContractResult, "returns"> & { returns: [bigint] }> {
    const _initialAsset = {
      alphAmount:
        _extraParams?.initialAsset?.alphAmount ?? BigInt("1000000000000000000"),
      tokens: _extraParams?.initialAsset?.tokens,
    };
    const _testParams = {
      ..._extraParams,
      testMethodIndex: 2,
      testArgs: {},
      initialFields: _initFields as Fields,
      initialAsset: _initialAsset,
    };
    const _testResult = await TokenTest.contract.testPublicMethod(
      "getDecimals",
      _testParams
    );
    return { ..._testResult, returns: _testResult.returns as [bigint] };
  }

  static async testGetTotalSupply(
    _initFields: _TokenTestFields | Fields,
    _extraParams?: {
      group?: number;
      address?: string;
      initialAsset?: Asset;
      existingContracts?: ContractState[];
      inputAssets?: InputAsset[];
    }
  ): Promise<Omit<TestContractResult, "returns"> & { returns: [bigint] }> {
    const _initialAsset = {
      alphAmount:
        _extraParams?.initialAsset?.alphAmount ?? BigInt("1000000000000000000"),
      tokens: _extraParams?.initialAsset?.tokens,
    };
    const _testParams = {
      ..._extraParams,
      testMethodIndex: 3,
      testArgs: {},
      initialFields: _initFields as Fields,
      initialAsset: _initialAsset,
    };
    const _testResult = await TokenTest.contract.testPublicMethod(
      "getTotalSupply",
      _testParams
    );
    return { ..._testResult, returns: _testResult.returns as [bigint] };
  }

  async getSymbolCall(_extraParams?: {
    worldStateBlockHash?: string;
    txId?: string;
    existingContracts?: string[];
    inputAssets?: node.TestInputAsset[];
  }): Promise<string> {
    const _callResult = await web3
      .getCurrentNodeProvider()
      .contracts.postContractsCallContract({
        group: this.groupIndex,
        worldStateBlockHash: _extraParams?.worldStateBlockHash,
        txId: _extraParams?.txId,
        address: this.address,
        methodIndex: 0,
        args: [],
        existingContracts: _extraParams?.existingContracts,
        inputAssets: _extraParams?.inputAssets,
      });
    return fromApiArray(_callResult.returns, ["ByteVec"])[0] as string;
  }

  async getNameCall(_extraParams?: {
    worldStateBlockHash?: string;
    txId?: string;
    existingContracts?: string[];
    inputAssets?: node.TestInputAsset[];
  }): Promise<string> {
    const _callResult = await web3
      .getCurrentNodeProvider()
      .contracts.postContractsCallContract({
        group: this.groupIndex,
        worldStateBlockHash: _extraParams?.worldStateBlockHash,
        txId: _extraParams?.txId,
        address: this.address,
        methodIndex: 1,
        args: [],
        existingContracts: _extraParams?.existingContracts,
        inputAssets: _extraParams?.inputAssets,
      });
    return fromApiArray(_callResult.returns, ["ByteVec"])[0] as string;
  }

  async getDecimalsCall(_extraParams?: {
    worldStateBlockHash?: string;
    txId?: string;
    existingContracts?: string[];
    inputAssets?: node.TestInputAsset[];
  }): Promise<bigint> {
    const _callResult = await web3
      .getCurrentNodeProvider()
      .contracts.postContractsCallContract({
        group: this.groupIndex,
        worldStateBlockHash: _extraParams?.worldStateBlockHash,
        txId: _extraParams?.txId,
        address: this.address,
        methodIndex: 2,
        args: [],
        existingContracts: _extraParams?.existingContracts,
        inputAssets: _extraParams?.inputAssets,
      });
    return fromApiArray(_callResult.returns, ["U256"])[0] as bigint;
  }

  async getTotalSupplyCall(_extraParams?: {
    worldStateBlockHash?: string;
    txId?: string;
    existingContracts?: string[];
    inputAssets?: node.TestInputAsset[];
  }): Promise<bigint> {
    const _callResult = await web3
      .getCurrentNodeProvider()
      .contracts.postContractsCallContract({
        group: this.groupIndex,
        worldStateBlockHash: _extraParams?.worldStateBlockHash,
        txId: _extraParams?.txId,
        address: this.address,
        methodIndex: 3,
        args: [],
        existingContracts: _extraParams?.existingContracts,
        inputAssets: _extraParams?.inputAssets,
      });
    return fromApiArray(_callResult.returns, ["U256"])[0] as bigint;
  }
}

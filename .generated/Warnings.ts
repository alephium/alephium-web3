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

export type _WarningsFields = {
  a: bigint;
  b: bigint;
};

export type _WarningsState = _WarningsFields & Omit<ContractState, "fields">;

export class Warnings {
  static readonly contract: Contract = Contract.fromJson(
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
    a: bigint,
    b: bigint,
    _extraParams?: {
      initialAttoAlphAmount?: bigint;
      initialTokenAmounts?: Token[];
      issueTokenAmount?: bigint;
      gasAmount?: number;
      gasPrice?: bigint;
    }
  ): Promise<Warnings> {
    const _deployResult = await Warnings.contract.deploy(signer, {
      initialFields: { a: a, b: b },
      initialAttoAlphAmount: _extraParams?.initialAttoAlphAmount,
      initialTokenAmounts: _extraParams?.initialTokenAmounts,
      issueTokenAmount: _extraParams?.issueTokenAmount,
      gasAmount: _extraParams?.gasAmount,
      gasPrice: _extraParams?.gasPrice,
    });
    return new Warnings(
      _deployResult.contractAddress,
      _deployResult.contractId,
      _deployResult.fromGroup,
      _deployResult
    );
  }

  static connect(
    address: string,
    deployResult?: SignDeployContractTxResult
  ): Warnings {
    const contractId = binToHex(contractIdFromAddress(address));
    const groupIndex = parseInt(contractId.slice(-2));
    return new Warnings(address, contractId, groupIndex, deployResult);
  }

  async fetchState(): Promise<_WarningsState> {
    const state = await Warnings.contract.fetchState(
      this.address,
      this.groupIndex
    );
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
      alphAmount: asset?.alphAmount ?? BigInt("1000000000000000000"),
      tokens: asset?.tokens,
    };
    return Warnings.contract.toState({ a: a, b: b }, newAsset, address);
  }

  static async testFoo(
    args: { x: bigint; y: bigint },
    _initFields: _WarningsFields | Fields,
    _extraParams?: {
      group?: number;
      address?: string;
      initialAsset?: Asset;
      existingContracts?: ContractState[];
      inputAssets?: InputAsset[];
    }
  ): Promise<Omit<TestContractResult, "returns"> & { returns: [] }> {
    const _initialAsset = {
      alphAmount:
        _extraParams?.initialAsset?.alphAmount ?? BigInt("1000000000000000000"),
      tokens: _extraParams?.initialAsset?.tokens,
    };
    const _testParams = {
      ..._extraParams,
      testMethodIndex: 0,
      testArgs: args,
      initialFields: _initFields as Fields,
      initialAsset: _initialAsset,
    };
    const _testResult = await Warnings.contract.testPublicMethod(
      "foo",
      _testParams
    );
    return { ..._testResult, returns: _testResult.returns as [] };
  }
}

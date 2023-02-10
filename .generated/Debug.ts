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

export type _DebugState = Omit<ContractState, "fields">;

export class Debug {
  static readonly contract: Contract = Contract.fromJson(
    JSON.parse(`{
  "version": "v1.7.0",
  "name": "Debug",
  "bytecode": "000106010000000000",
  "codeHash": "928360bf58942dd1fdd8d197e0e2ef59ecddbf71a6e8fe25d2c0665274f80ce3",
  "fieldsSig": {
    "names": [],
    "types": [],
    "isMutable": []
  },
  "eventsSig": [],
  "functions": [
    {
      "name": "debug",
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
  ): Promise<Debug> {
    const _deployResult = await Debug.contract.deploy(signer, {
      initialFields: {},
      initialAttoAlphAmount: _extraParams?.initialAttoAlphAmount,
      initialTokenAmounts: _extraParams?.initialTokenAmounts,
      issueTokenAmount: _extraParams?.issueTokenAmount,
      gasAmount: _extraParams?.gasAmount,
      gasPrice: _extraParams?.gasPrice,
    });
    return new Debug(
      _deployResult.contractAddress,
      _deployResult.contractId,
      _deployResult.fromGroup,
      _deployResult
    );
  }

  static connect(
    address: string,
    deployResult?: SignDeployContractTxResult
  ): Debug {
    const contractId = binToHex(contractIdFromAddress(address));
    const groupIndex = parseInt(contractId.slice(-2));
    return new Debug(address, contractId, groupIndex, deployResult);
  }

  async fetchState(): Promise<_DebugState> {
    const state = await Debug.contract.fetchState(
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
    return Debug.contract.toState({}, newAsset, address);
  }

  static async testDebug(_extraParams?: {
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
    const _testResult = await Debug.contract.testPublicMethod(
      "debug",
      _testParams
    );
    return { ..._testResult, returns: _testResult.returns as [] };
  }
}

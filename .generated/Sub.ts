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
  fromApiVals,
  subscribeToEvents,
  SubscribeOptions,
  Subscription,
  EventSubscription,
} from "@alephium/web3";

export interface SubSub {
  blockHash: string;
  txId: string;
  eventIndex: number;
  x: bigint;
  y: bigint;
}

export type _SubFields = {
  result: bigint;
};

export type _SubState = _SubFields & Omit<ContractState, "fields">;

export class Sub {
  static readonly contract: Contract = Contract.fromJson(
    JSON.parse(`{
  "version": "v1.7.0",
  "name": "Sub",
  "bytecode": "01011901000202010c05160016015fa00016002a16012ba100a00002",
  "codeHash": "513645f5c95a28d55a51070f3d5c51edbda05a98f46b23cad59952e2ee4846a1",
  "fieldsSig": {
    "names": [
      "result"
    ],
    "types": [
      "U256"
    ],
    "isMutable": [
      true
    ]
  },
  "eventsSig": [
    {
      "name": "Sub",
      "fieldNames": [
        "x",
        "y"
      ],
      "fieldTypes": [
        "U256",
        "U256"
      ]
    }
  ],
  "functions": [
    {
      "name": "sub",
      "usePreapprovedAssets": false,
      "useAssetsInContract": false,
      "isPublic": true,
      "paramNames": [
        "array"
      ],
      "paramTypes": [
        "[U256;2]"
      ],
      "paramIsMutable": [
        false
      ],
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
    result: bigint,
    _extraParams?: {
      initialAttoAlphAmount?: bigint;
      initialTokenAmounts?: Token[];
      issueTokenAmount?: bigint;
      gasAmount?: number;
      gasPrice?: bigint;
    }
  ): Promise<Sub> {
    const _deployResult = await Sub.contract.deploy(signer, {
      initialFields: { result: result },
      initialAttoAlphAmount: _extraParams?.initialAttoAlphAmount,
      initialTokenAmounts: _extraParams?.initialTokenAmounts,
      issueTokenAmount: _extraParams?.issueTokenAmount,
      gasAmount: _extraParams?.gasAmount,
      gasPrice: _extraParams?.gasPrice,
    });
    return new Sub(
      _deployResult.contractAddress,
      _deployResult.contractId,
      _deployResult.fromGroup,
      _deployResult
    );
  }

  static connect(
    address: string,
    deployResult?: SignDeployContractTxResult
  ): Sub {
    const contractId = binToHex(contractIdFromAddress(address));
    const groupIndex = parseInt(contractId.slice(-2));
    return new Sub(address, contractId, groupIndex, deployResult);
  }

  async fetchState(): Promise<_SubState> {
    const state = await Sub.contract.fetchState(this.address, this.groupIndex);
    return {
      ...state,
      result: state.fields["result"] as bigint,
    };
  }

  private decodeSub(event: node.ContractEvent): SubSub {
    if (event.eventIndex !== 0) {
      throw new Error(
        "Invalid event index: " + event.eventIndex + ", expected: 0"
      );
    }
    const fields = fromApiVals(event.fields, ["x", "y"], ["U256", "U256"]);
    return {
      blockHash: event.blockHash,
      txId: event.txId,
      eventIndex: event.eventIndex,
      x: fields["x"] as bigint,
      y: fields["y"] as bigint,
    };
  }

  subscribeSub(
    options: SubscribeOptions<SubSub>,
    fromCount?: number
  ): EventSubscription {
    const messageCallback = (event: node.ContractEvent): Promise<void> => {
      if (event.eventIndex !== 0) {
        return Promise.resolve();
      }
      return options.messageCallback(this.decodeSub(event));
    };

    const errorCallback = (
      err: any,
      subscription: Subscription<node.ContractEvent>
    ): Promise<void> => {
      return options.errorCallback(
        err,
        subscription as unknown as Subscription<SubSub>
      );
    };
    const opt: SubscribeOptions<node.ContractEvent> = {
      pollingInterval: options.pollingInterval,
      messageCallback: messageCallback,
      errorCallback: errorCallback,
    };
    return subscribeToEvents(opt, this.address, fromCount);
  }

  // This is used for testing contract functions
  static stateForTest(
    result: bigint,
    asset?: Asset,
    address?: string
  ): ContractState {
    const newAsset = {
      alphAmount: asset?.alphAmount ?? BigInt("1000000000000000000"),
      tokens: asset?.tokens,
    };
    return Sub.contract.toState({ result: result }, newAsset, address);
  }

  static async testSub(
    args: { array: [bigint, bigint] },
    _initFields: _SubFields | Fields,
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
      testMethodIndex: 0,
      testArgs: args,
      initialFields: _initFields as Fields,
      initialAsset: _initialAsset,
    };
    const _testResult = await Sub.contract.testPublicMethod("sub", _testParams);
    return { ..._testResult, returns: _testResult.returns as [bigint] };
  }

  async subCall(
    array: [bigint, bigint],
    _extraParams?: {
      worldStateBlockHash?: string;
      txId?: string;
      existingContracts?: string[];
      inputAssets?: node.TestInputAsset[];
    }
  ): Promise<bigint> {
    const _callResult = await web3
      .getCurrentNodeProvider()
      .contracts.postContractsCallContract({
        group: this.groupIndex,
        worldStateBlockHash: _extraParams?.worldStateBlockHash,
        txId: _extraParams?.txId,
        address: this.address,
        methodIndex: 0,
        args: toApiVals({ array: array }, ["array"], ["[U256;2]"]),
        existingContracts: _extraParams?.existingContracts,
        inputAssets: _extraParams?.inputAssets,
      });
    return fromApiArray(_callResult.returns, ["U256"])[0] as bigint;
  }
}

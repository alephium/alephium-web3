/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  Address,
  Contract,
  ContractState,
  TestContractResult,
  HexString,
  ContractFactory,
  EventSubscribeOptions,
  EventSubscription,
  CallContractParams,
  CallContractResult,
  TestContractParams,
  ContractEvent,
  subscribeContractEvent,
  subscribeContractEvents,
  testMethod,
  callMethod,
  multicallMethods,
  fetchContractState,
  ContractInstance,
  getContractEventsCurrentCount,
  TestContractParamsWithoutMaps,
  TestContractResultWithoutMaps,
  SignExecuteContractMethodParams,
  SignExecuteScriptTxResult,
  signExecuteMethod,
  addStdIdToFields,
  encodeContractFields,
} from "@alephium/web3";
import { default as NFTTestStdContractJson } from "../nft/NFTTestStd.ral.json";
import { getContractByCodeHash } from "./contracts";
import {
  AddStruct1,
  AddStruct2,
  Balances,
  MapValue,
  TokenBalance,
  AllStructs,
} from "./types";

// Custom types for the contract
export namespace NFTTestStdTypes {
  export type Fields = {
    collectionId: HexString;
    nftIndex: bigint;
    uri: HexString;
  };

  export type State = ContractState<Fields>;

  export interface CallMethodTable {
    getTokenUri: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<HexString>;
    };
    getCollectionIndex: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<[HexString, bigint]>;
    };
    newMethod: {
      params: Omit<CallContractParams<{}>, "args">;
      result: CallContractResult<null>;
    };
  }
  export type CallMethodParams<T extends keyof CallMethodTable> =
    CallMethodTable[T]["params"];
  export type CallMethodResult<T extends keyof CallMethodTable> =
    CallMethodTable[T]["result"];
  export type MultiCallParams = Partial<{
    [Name in keyof CallMethodTable]: CallMethodTable[Name]["params"];
  }>;
  export type MultiCallResults<T extends MultiCallParams> = {
    [MaybeName in keyof T]: MaybeName extends keyof CallMethodTable
      ? CallMethodTable[MaybeName]["result"]
      : undefined;
  };
  export type MulticallReturnType<Callss extends MultiCallParams[]> = {
    [index in keyof Callss]: MultiCallResults<Callss[index]>;
  };

  export interface SignExecuteMethodTable {
    getTokenUri: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    getCollectionIndex: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
    newMethod: {
      params: Omit<SignExecuteContractMethodParams<{}>, "args">;
      result: SignExecuteScriptTxResult;
    };
  }
  export type SignExecuteMethodParams<T extends keyof SignExecuteMethodTable> =
    SignExecuteMethodTable[T]["params"];
  export type SignExecuteMethodResult<T extends keyof SignExecuteMethodTable> =
    SignExecuteMethodTable[T]["result"];
}

class Factory extends ContractFactory<
  NFTTestStdInstance,
  NFTTestStdTypes.Fields
> {
  encodeFields(fields: NFTTestStdTypes.Fields) {
    return encodeContractFields(
      addStdIdToFields(this.contract, fields),
      this.contract.fieldsSig,
      AllStructs
    );
  }

  at(address: string): NFTTestStdInstance {
    return new NFTTestStdInstance(address);
  }

  tests = {
    getTokenUri: async (
      params: Omit<
        TestContractParamsWithoutMaps<NFTTestStdTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<HexString>> => {
      return testMethod(this, "getTokenUri", params, getContractByCodeHash);
    },
    getCollectionIndex: async (
      params: Omit<
        TestContractParamsWithoutMaps<NFTTestStdTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<[HexString, bigint]>> => {
      return testMethod(
        this,
        "getCollectionIndex",
        params,
        getContractByCodeHash
      );
    },
    newMethod: async (
      params: Omit<
        TestContractParamsWithoutMaps<NFTTestStdTypes.Fields, never>,
        "testArgs"
      >
    ): Promise<TestContractResultWithoutMaps<null>> => {
      return testMethod(this, "newMethod", params, getContractByCodeHash);
    },
  };
}

// Use this object to test and deploy the contract
export const NFTTestStd = new Factory(
  Contract.fromJson(
    NFTTestStdContractJson,
    "",
    "b7ff3fa8dfacc7ae5edbabd6573d0699dffc5a0f07ad14023f682a201b7bce55",
    AllStructs
  )
);

// Use this class to interact with the blockchain
export class NFTTestStdInstance extends ContractInstance {
  constructor(address: Address) {
    super(address);
  }

  async fetchState(): Promise<NFTTestStdTypes.State> {
    return fetchContractState(NFTTestStd, this);
  }

  view = {
    getTokenUri: async (
      params?: NFTTestStdTypes.CallMethodParams<"getTokenUri">
    ): Promise<NFTTestStdTypes.CallMethodResult<"getTokenUri">> => {
      return callMethod(
        NFTTestStd,
        this,
        "getTokenUri",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    getCollectionIndex: async (
      params?: NFTTestStdTypes.CallMethodParams<"getCollectionIndex">
    ): Promise<NFTTestStdTypes.CallMethodResult<"getCollectionIndex">> => {
      return callMethod(
        NFTTestStd,
        this,
        "getCollectionIndex",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
    newMethod: async (
      params?: NFTTestStdTypes.CallMethodParams<"newMethod">
    ): Promise<NFTTestStdTypes.CallMethodResult<"newMethod">> => {
      return callMethod(
        NFTTestStd,
        this,
        "newMethod",
        params === undefined ? {} : params,
        getContractByCodeHash
      );
    },
  };

  transact = {
    getTokenUri: async (
      params: NFTTestStdTypes.SignExecuteMethodParams<"getTokenUri">
    ): Promise<NFTTestStdTypes.SignExecuteMethodResult<"getTokenUri">> => {
      return signExecuteMethod(NFTTestStd, this, "getTokenUri", params);
    },
    getCollectionIndex: async (
      params: NFTTestStdTypes.SignExecuteMethodParams<"getCollectionIndex">
    ): Promise<
      NFTTestStdTypes.SignExecuteMethodResult<"getCollectionIndex">
    > => {
      return signExecuteMethod(NFTTestStd, this, "getCollectionIndex", params);
    },
    newMethod: async (
      params: NFTTestStdTypes.SignExecuteMethodParams<"newMethod">
    ): Promise<NFTTestStdTypes.SignExecuteMethodResult<"newMethod">> => {
      return signExecuteMethod(NFTTestStd, this, "newMethod", params);
    },
  };

  async multicall<Callss extends NFTTestStdTypes.MultiCallParams[]>(
    ...callss: Callss
  ): Promise<NFTTestStdTypes.MulticallReturnType<Callss>> {
    return (await multicallMethods(
      NFTTestStd,
      this,
      callss,
      getContractByCodeHash
    )) as NFTTestStdTypes.MulticallReturnType<Callss>;
  }
}

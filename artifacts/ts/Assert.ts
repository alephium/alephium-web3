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
} from "@alephium/web3";
import { default as AssertContractJson } from "../test/Assert.ral.json";
import { getContractByCodeHash } from "./contracts";
import { Balances, TokenBalance, AllStructs } from "./types";

// Custom types for the contract
export namespace AssertTypes {
  export type State = Omit<ContractState<any>, "fields">;
}

class Factory extends ContractFactory<AssertInstance, {}> {
  consts = {
    Error: BigInt(3),
    A: BigInt(-3),
    B: "1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH",
    C: "0011",
    Addresses: {
      A: "1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH",
      B: "14UAjZ3qcmEVKdTo84Kwf4RprTQi86w2TefnnGFjov9xF",
    },
    Numbers: { A: BigInt(0), B: BigInt(1) },
    ByteVecs: { A: "00", B: "11" },
  };

  at(address: string): AssertInstance {
    return new AssertInstance(address);
  }

  tests = {
    test: async (
      params?: Omit<
        TestContractParams<never, never>,
        "testArgs" | "initialFields"
      >
    ): Promise<TestContractResult<null>> => {
      return testMethod(this, "test", params === undefined ? {} : params);
    },
  };
}

// Use this object to test and deploy the contract
export const Assert = new Factory(
  Contract.fromJson(
    AssertContractJson,
    "",
    "5bd05924fb9a23ea105df065a8c2dfa463b9ee53cc14a60320140d19dd6151ca",
    AllStructs
  )
);

// Use this class to interact with the blockchain
export class AssertInstance extends ContractInstance {
  constructor(address: Address) {
    super(address);
  }

  async fetchState(): Promise<AssertTypes.State> {
    return fetchContractState(Assert, this);
  }
}

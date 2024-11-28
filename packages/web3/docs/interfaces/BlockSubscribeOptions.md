[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / BlockSubscribeOptions

# Interface: BlockSubscribeOptions

## Extends

- [`SubscribeOptions`](../namespaces/utils/interfaces/SubscribeOptions.md)\<[`BlockEntry`](../namespaces/node/interfaces/BlockEntry.md)[]\>

## Properties

### errorCallback

> **errorCallback**: `ErrorCallback`\<[`BlockEntry`](../namespaces/node/interfaces/BlockEntry.md)[]\>

#### Inherited from

[`SubscribeOptions`](../namespaces/utils/interfaces/SubscribeOptions.md).[`errorCallback`](../namespaces/utils/interfaces/SubscribeOptions.md#errorcallback)

#### Defined in

[src/utils/subscription.ts:27](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/utils/subscription.ts#L27)

***

### messageCallback

> **messageCallback**: `MessageCallback`\<[`BlockEntry`](../namespaces/node/interfaces/BlockEntry.md)[]\>

#### Inherited from

[`SubscribeOptions`](../namespaces/utils/interfaces/SubscribeOptions.md).[`messageCallback`](../namespaces/utils/interfaces/SubscribeOptions.md#messagecallback)

#### Defined in

[src/utils/subscription.ts:26](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/utils/subscription.ts#L26)

***

### pollingInterval

> **pollingInterval**: `number`

#### Inherited from

[`SubscribeOptions`](../namespaces/utils/interfaces/SubscribeOptions.md).[`pollingInterval`](../namespaces/utils/interfaces/SubscribeOptions.md#pollinginterval)

#### Defined in

[src/utils/subscription.ts:25](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/utils/subscription.ts#L25)

***

### reorgCallback?

> `optional` **reorgCallback**: [`ReorgCallback`](../type-aliases/ReorgCallback.md)

#### Defined in

[src/block/block.ts:36](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/block/block.ts#L36)

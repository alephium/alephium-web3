[**Web3 SDK v1.9.0**](../../../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../../../globals.md) / [utils](../README.md) / Subscription

# Class: `abstract` Subscription\<Message\>

## Extended by

- [`EventSubscription`](../../../classes/EventSubscription.md)
- [`TxStatusSubscription`](../../../classes/TxStatusSubscription.md)

## Type Parameters

• **Message**

## Constructors

### new Subscription()

> **new Subscription**\<`Message`\>(`options`): [`Subscription`](Subscription.md)\<`Message`\>

#### Parameters

• **options**: [`SubscribeOptions`](../interfaces/SubscribeOptions.md)\<`Message`\>

#### Returns

[`Subscription`](Subscription.md)\<`Message`\>

#### Defined in

[src/utils/subscription.ts:39](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/utils/subscription.ts#L39)

## Properties

### cancelled

> `protected` **cancelled**: `boolean`

#### Defined in

[src/utils/subscription.ts:37](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/utils/subscription.ts#L37)

***

### errorCallback

> `protected` **errorCallback**: `ErrorCallback`\<`Message`\>

#### Defined in

[src/utils/subscription.ts:34](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/utils/subscription.ts#L34)

***

### eventEmitter

> `protected` **eventEmitter**: `EventEmitter`\<`string` \| `symbol`, `any`\>

#### Defined in

[src/utils/subscription.ts:36](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/utils/subscription.ts#L36)

***

### messageCallback

> `protected` **messageCallback**: `MessageCallback`\<`Message`\>

#### Defined in

[src/utils/subscription.ts:33](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/utils/subscription.ts#L33)

***

### pollingInterval

> **pollingInterval**: `number`

#### Defined in

[src/utils/subscription.ts:31](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/utils/subscription.ts#L31)

***

### task

> `protected` **task**: `undefined` \| `Timeout`

#### Defined in

[src/utils/subscription.ts:35](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/utils/subscription.ts#L35)

## Methods

### isCancelled()

> **isCancelled**(): `boolean`

#### Returns

`boolean`

#### Defined in

[src/utils/subscription.ts:67](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/utils/subscription.ts#L67)

***

### polling()

> `abstract` `protected` **polling**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[src/utils/subscription.ts:71](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/utils/subscription.ts#L71)

***

### subscribe()

> **subscribe**(): `void`

#### Returns

`void`

#### Defined in

[src/utils/subscription.ts:48](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/utils/subscription.ts#L48)

***

### unsubscribe()

> **unsubscribe**(): `void`

#### Returns

`void`

#### Defined in

[src/utils/subscription.ts:59](https://github.com/Mystic-Nayy/alephium-web3/blob/ee41f5e0e7d7fb0b155fe62f05b2ac03772895ca/packages/web3/src/utils/subscription.ts#L59)

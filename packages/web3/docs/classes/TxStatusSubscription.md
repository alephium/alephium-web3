[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / TxStatusSubscription

# Class: TxStatusSubscription

## Extends

- [`Subscription`](../namespaces/utils/classes/Subscription.md)\<[`TxStatus`](../type-aliases/TxStatus.md)\>

## Constructors

### new TxStatusSubscription()

> **new TxStatusSubscription**(`options`, `txId`, `fromGroup`?, `toGroup`?, `confirmations`?): [`TxStatusSubscription`](TxStatusSubscription.md)

#### Parameters

• **options**: [`SubscribeOptions`](../namespaces/utils/interfaces/SubscribeOptions.md)\<[`TxStatus`](../namespaces/node/type-aliases/TxStatus.md)\>

• **txId**: `string`

• **fromGroup?**: `number`

• **toGroup?**: `number`

• **confirmations?**: `number`

#### Returns

[`TxStatusSubscription`](TxStatusSubscription.md)

#### Overrides

[`Subscription`](../namespaces/utils/classes/Subscription.md).[`constructor`](../namespaces/utils/classes/Subscription.md#constructors)

#### Defined in

[src/transaction/status.ts:31](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/transaction/status.ts#L31)

## Properties

### cancelled

> `protected` **cancelled**: `boolean`

#### Inherited from

[`Subscription`](../namespaces/utils/classes/Subscription.md).[`cancelled`](../namespaces/utils/classes/Subscription.md#cancelled)

#### Defined in

[src/utils/subscription.ts:37](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/utils/subscription.ts#L37)

***

### confirmations

> `readonly` **confirmations**: `number`

#### Defined in

[src/transaction/status.ts:29](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/transaction/status.ts#L29)

***

### errorCallback

> `protected` **errorCallback**: `ErrorCallback`\<[`TxStatus`](../namespaces/node/type-aliases/TxStatus.md)\>

#### Inherited from

[`Subscription`](../namespaces/utils/classes/Subscription.md).[`errorCallback`](../namespaces/utils/classes/Subscription.md#errorcallback)

#### Defined in

[src/utils/subscription.ts:34](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/utils/subscription.ts#L34)

***

### eventEmitter

> `protected` **eventEmitter**: `EventEmitter`\<`string` \| `symbol`, `any`\>

#### Inherited from

[`Subscription`](../namespaces/utils/classes/Subscription.md).[`eventEmitter`](../namespaces/utils/classes/Subscription.md#eventemitter)

#### Defined in

[src/utils/subscription.ts:36](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/utils/subscription.ts#L36)

***

### fromGroup?

> `readonly` `optional` **fromGroup**: `number`

#### Defined in

[src/transaction/status.ts:27](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/transaction/status.ts#L27)

***

### messageCallback

> `protected` **messageCallback**: `MessageCallback`\<[`TxStatus`](../namespaces/node/type-aliases/TxStatus.md)\>

#### Inherited from

[`Subscription`](../namespaces/utils/classes/Subscription.md).[`messageCallback`](../namespaces/utils/classes/Subscription.md#messagecallback)

#### Defined in

[src/utils/subscription.ts:33](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/utils/subscription.ts#L33)

***

### pollingInterval

> **pollingInterval**: `number`

#### Inherited from

[`Subscription`](../namespaces/utils/classes/Subscription.md).[`pollingInterval`](../namespaces/utils/classes/Subscription.md#pollinginterval)

#### Defined in

[src/utils/subscription.ts:31](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/utils/subscription.ts#L31)

***

### task

> `protected` **task**: `undefined` \| `Timeout`

#### Inherited from

[`Subscription`](../namespaces/utils/classes/Subscription.md).[`task`](../namespaces/utils/classes/Subscription.md#task)

#### Defined in

[src/utils/subscription.ts:35](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/utils/subscription.ts#L35)

***

### toGroup?

> `readonly` `optional` **toGroup**: `number`

#### Defined in

[src/transaction/status.ts:28](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/transaction/status.ts#L28)

***

### txId

> `readonly` **txId**: `string`

#### Defined in

[src/transaction/status.ts:26](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/transaction/status.ts#L26)

## Methods

### isCancelled()

> **isCancelled**(): `boolean`

#### Returns

`boolean`

#### Inherited from

[`Subscription`](../namespaces/utils/classes/Subscription.md).[`isCancelled`](../namespaces/utils/classes/Subscription.md#iscancelled)

#### Defined in

[src/utils/subscription.ts:67](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/utils/subscription.ts#L67)

***

### polling()

> **polling**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

[`Subscription`](../namespaces/utils/classes/Subscription.md).[`polling`](../namespaces/utils/classes/Subscription.md#polling)

#### Defined in

[src/transaction/status.ts:45](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/transaction/status.ts#L45)

***

### subscribe()

> **subscribe**(): `void`

#### Returns

`void`

#### Inherited from

[`Subscription`](../namespaces/utils/classes/Subscription.md).[`subscribe`](../namespaces/utils/classes/Subscription.md#subscribe)

#### Defined in

[src/utils/subscription.ts:48](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/utils/subscription.ts#L48)

***

### unsubscribe()

> **unsubscribe**(): `void`

#### Returns

`void`

#### Inherited from

[`Subscription`](../namespaces/utils/classes/Subscription.md).[`unsubscribe`](../namespaces/utils/classes/Subscription.md#unsubscribe)

#### Defined in

[src/utils/subscription.ts:59](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/utils/subscription.ts#L59)

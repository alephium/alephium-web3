[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / BlockSubscription

# Class: BlockSubscription

## Extends

- `BlockSubscriptionBase`

## Constructors

### new BlockSubscription()

> **new BlockSubscription**(`options`, `fromTimeStamp`, `nodeProvider`): [`BlockSubscription`](BlockSubscription.md)

#### Parameters

• **options**: [`BlockSubscribeOptions`](../interfaces/BlockSubscribeOptions.md)

• **fromTimeStamp**: `number`

• **nodeProvider**: `undefined` \| [`NodeProvider`](NodeProvider.md) = `undefined`

#### Returns

[`BlockSubscription`](BlockSubscription.md)

#### Overrides

`BlockSubscriptionBase.constructor`

#### Defined in

[src/block/block.ts:92](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/block/block.ts#L92)

## Properties

### cancelled

> `protected` **cancelled**: `boolean`

#### Inherited from

`BlockSubscriptionBase.cancelled`

#### Defined in

[src/utils/subscription.ts:37](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/utils/subscription.ts#L37)

***

### errorCallback

> `protected` **errorCallback**: `ErrorCallback`\<[`BlockEntry`](../namespaces/node/interfaces/BlockEntry.md)[]\>

#### Inherited from

`BlockSubscriptionBase.errorCallback`

#### Defined in

[src/utils/subscription.ts:34](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/utils/subscription.ts#L34)

***

### eventEmitter

> `protected` **eventEmitter**: `EventEmitter`\<`string` \| `symbol`, `any`\>

#### Inherited from

`BlockSubscriptionBase.eventEmitter`

#### Defined in

[src/utils/subscription.ts:36](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/utils/subscription.ts#L36)

***

### messageCallback

> `protected` **messageCallback**: `MessageCallback`\<[`BlockEntry`](../namespaces/node/interfaces/BlockEntry.md)[]\>

#### Inherited from

`BlockSubscriptionBase.messageCallback`

#### Defined in

[src/utils/subscription.ts:33](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/utils/subscription.ts#L33)

***

### nodeProvider

> `readonly` **nodeProvider**: [`NodeProvider`](NodeProvider.md)

#### Defined in

[src/block/block.ts:86](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/block/block.ts#L86)

***

### pollingInterval

> **pollingInterval**: `number`

#### Inherited from

`BlockSubscriptionBase.pollingInterval`

#### Defined in

[src/utils/subscription.ts:31](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/utils/subscription.ts#L31)

***

### reorgCallback?

> `readonly` `optional` **reorgCallback**: [`ReorgCallback`](../type-aliases/ReorgCallback.md)

#### Overrides

`BlockSubscriptionBase.reorgCallback`

#### Defined in

[src/block/block.ts:87](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/block/block.ts#L87)

***

### task

> `protected` **task**: `undefined` \| `Timeout`

#### Inherited from

`BlockSubscriptionBase.task`

#### Defined in

[src/utils/subscription.ts:35](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/utils/subscription.ts#L35)

## Methods

### getBlockByHash()

> **getBlockByHash**(`hash`): `Promise`\<[`BlockEntry`](../namespaces/node/interfaces/BlockEntry.md)\>

#### Parameters

• **hash**: `string`

#### Returns

`Promise`\<[`BlockEntry`](../namespaces/node/interfaces/BlockEntry.md)\>

#### Overrides

`BlockSubscriptionBase.getBlockByHash`

#### Defined in

[src/block/block.ts:110](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/block/block.ts#L110)

***

### getHashesAtHeight()

> **getHashesAtHeight**(`fromGroup`, `toGroup`, `height`): `Promise`\<`string`[]\>

#### Parameters

• **fromGroup**: `number`

• **toGroup**: `number`

• **height**: `number`

#### Returns

`Promise`\<`string`[]\>

#### Overrides

`BlockSubscriptionBase.getHashesAtHeight`

#### Defined in

[src/block/block.ts:105](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/block/block.ts#L105)

***

### getParentHash()

> `protected` **getParentHash**(`block`): `string`

#### Parameters

• **block**: [`BlockEntry`](../namespaces/node/interfaces/BlockEntry.md)

#### Returns

`string`

#### Inherited from

`BlockSubscriptionBase.getParentHash`

#### Defined in

[src/block/block.ts:45](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/block/block.ts#L45)

***

### handleReorg()

> `protected` **handleReorg**(`fromGroup`, `toGroup`, `orphanBlockHash`, `newBlockHash`): `Promise`\<`void`\>

#### Parameters

• **fromGroup**: `number`

• **toGroup**: `number`

• **orphanBlockHash**: `string`

• **newBlockHash**: `string`

#### Returns

`Promise`\<`void`\>

#### Inherited from

`BlockSubscriptionBase.handleReorg`

#### Defined in

[src/block/block.ts:50](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/block/block.ts#L50)

***

### isCancelled()

> **isCancelled**(): `boolean`

#### Returns

`boolean`

#### Inherited from

`BlockSubscriptionBase.isCancelled`

#### Defined in

[src/utils/subscription.ts:67](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/utils/subscription.ts#L67)

***

### polling()

> **polling**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Overrides

`BlockSubscriptionBase.polling`

#### Defined in

[src/block/block.ts:161](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/block/block.ts#L161)

***

### subscribe()

> **subscribe**(): `void`

#### Returns

`void`

#### Inherited from

`BlockSubscriptionBase.subscribe`

#### Defined in

[src/utils/subscription.ts:48](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/utils/subscription.ts#L48)

***

### unsubscribe()

> **unsubscribe**(): `void`

#### Returns

`void`

#### Inherited from

`BlockSubscriptionBase.unsubscribe`

#### Defined in

[src/utils/subscription.ts:59](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/utils/subscription.ts#L59)

[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / EventSubscription

# Class: EventSubscription

## Extends

- [`Subscription`](../namespaces/utils/classes/Subscription.md)\<[`ContractEvent`](../namespaces/node/interfaces/ContractEvent.md)\>

## Constructors

### new EventSubscription()

> **new EventSubscription**(`options`, `contractAddress`, `fromCount`?): [`EventSubscription`](EventSubscription.md)

#### Parameters

• **options**: [`EventSubscribeOptions`](../interfaces/EventSubscribeOptions.md)\<[`ContractEvent`](../namespaces/node/interfaces/ContractEvent.md)\>

• **contractAddress**: `string`

• **fromCount?**: `number`

#### Returns

[`EventSubscription`](EventSubscription.md)

#### Overrides

[`Subscription`](../namespaces/utils/classes/Subscription.md).[`constructor`](../namespaces/utils/classes/Subscription.md#constructors)

#### Defined in

[src/contract/events.ts:32](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/events.ts#L32)

## Properties

### cancelled

> `protected` **cancelled**: `boolean`

#### Inherited from

[`Subscription`](../namespaces/utils/classes/Subscription.md).[`cancelled`](../namespaces/utils/classes/Subscription.md#cancelled)

#### Defined in

[src/utils/subscription.ts:37](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/utils/subscription.ts#L37)

***

### contractAddress

> `readonly` **contractAddress**: `string`

#### Defined in

[src/contract/events.ts:28](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/events.ts#L28)

***

### errorCallback

> `protected` **errorCallback**: `ErrorCallback`\<[`ContractEvent`](../namespaces/node/interfaces/ContractEvent.md)\>

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

### messageCallback

> `protected` **messageCallback**: `MessageCallback`\<[`ContractEvent`](../namespaces/node/interfaces/ContractEvent.md)\>

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

## Methods

### currentEventCount()

> **currentEventCount**(): `number`

#### Returns

`number`

#### Defined in

[src/contract/events.ts:39](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/events.ts#L39)

***

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

[src/contract/events.ts:43](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/events.ts#L43)

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

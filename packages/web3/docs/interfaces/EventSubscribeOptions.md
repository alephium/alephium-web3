[**Web3 SDK v1.9.0**](../README.md) • **Docs**

***

[Web3 SDK v1.9.0](../globals.md) / EventSubscribeOptions

# Interface: EventSubscribeOptions\<Message\>

## Extends

- [`SubscribeOptions`](../namespaces/utils/interfaces/SubscribeOptions.md)\<`Message`\>

## Type Parameters

• **Message**

## Properties

### errorCallback

> **errorCallback**: `ErrorCallback`\<`Message`\>

#### Inherited from

[`SubscribeOptions`](../namespaces/utils/interfaces/SubscribeOptions.md).[`errorCallback`](../namespaces/utils/interfaces/SubscribeOptions.md#errorcallback)

#### Defined in

[src/utils/subscription.ts:27](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/utils/subscription.ts#L27)

***

### messageCallback

> **messageCallback**: `MessageCallback`\<`Message`\>

#### Inherited from

[`SubscribeOptions`](../namespaces/utils/interfaces/SubscribeOptions.md).[`messageCallback`](../namespaces/utils/interfaces/SubscribeOptions.md#messagecallback)

#### Defined in

[src/utils/subscription.ts:26](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/utils/subscription.ts#L26)

***

### onEventCountChanged()?

> `optional` **onEventCountChanged**: (`eventCount`) => `void` \| `Promise`\<`void`\>

#### Parameters

• **eventCount**: `number`

#### Returns

`void` \| `Promise`\<`void`\>

#### Defined in

[src/contract/events.ts:24](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/contract/events.ts#L24)

***

### pollingInterval

> **pollingInterval**: `number`

#### Inherited from

[`SubscribeOptions`](../namespaces/utils/interfaces/SubscribeOptions.md).[`pollingInterval`](../namespaces/utils/interfaces/SubscribeOptions.md#pollinginterval)

#### Defined in

[src/utils/subscription.ts:25](https://github.com/Mystic-Nayy/alephium-web3/blob/c1afd789a197ce5fe21f08c2965942090157c33d/packages/web3/src/utils/subscription.ts#L25)

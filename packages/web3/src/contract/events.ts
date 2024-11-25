// eslint-disable-next-line header/header
import * as web3 from '../global'
import { node } from '../api'
import { Subscription, SubscribeOptions } from '../utils'
import { ContractEvents, HttpResponse } from '../api/api-alephium'

export interface EventSubscribeOptions<Message> extends SubscribeOptions<Message> {
  onEventCountChanged?: (eventCount: number) => Promise<void> | void
}

export class EventSubscription extends Subscription<node.ContractEvent> {
  readonly contractAddress: string
  private fromCount: number
  private onEventCountChanged?: (eventCount: number) => Promise<void> | void

  constructor(options: EventSubscribeOptions<node.ContractEvent>, contractAddress: string, fromCount?: number) {
    super(options)
    this.contractAddress = contractAddress
    this.fromCount = typeof fromCount === 'undefined' ? 0 : fromCount
    this.onEventCountChanged = options.onEventCountChanged
  }

  currentEventCount(): number {
    return this.fromCount
  }

  override async polling(): Promise<void> {
    try {
      const response = await web3
        .getCurrentNodeProvider()
        .events.getEventsContractContractaddress(this.contractAddress, {
          start: this.fromCount
        })

      const events = response.data
      if (this.fromCount === events.nextStart) {
        return
      }

      const promises = events.events.map((event) => this.messageCallback(event))
      await Promise.all(promises)
      this.fromCount = events.nextStart

      if (this.onEventCountChanged !== undefined) {
        await this.onEventCountChanged(this.fromCount)
      }

      await this.polling()
    } catch (err) {
      await this.errorCallback(err, this)
    }
  }
}

export function subscribeToEvents(
  options: EventSubscribeOptions<node.ContractEvent>,
  contractAddress: string,
  fromCount?: number
): EventSubscription {
  const subscription = new EventSubscription(options, contractAddress, fromCount)
  subscription.subscribe()
  return subscription
}

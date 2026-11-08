import SignClient from '@walletconnect/sign-client'
import { WalletConnectProvider, formatChain } from '../src'
import { WalletClient } from './shared'

const proposalHandlers = new Map<string, (event: unknown) => Promise<void>>()
const approve = vi.fn(() => Promise.resolve({ acknowledged: () => Promise.resolve({ topic: 'test-topic' }) }))

beforeEach(() => {
  proposalHandlers.clear()
  approve.mockClear()
  vi.spyOn(SignClient, 'init').mockResolvedValue({
    on: (event: string, handler: (event: unknown) => Promise<void>) => proposalHandlers.set(event, handler),
    approve
  } as unknown as SignClient)
})

afterEach(() => vi.restoreAllMocks())

const initializeWallet = () => WalletClient.init({ on: vi.fn() } as unknown as WalletConnectProvider, {})
const propose = (namespaces: object) => {
  const handler = proposalHandlers.get('session_proposal')
  if (!handler) throw new Error('Session proposal handler was not registered')
  return handler({ params: { id: 1, relays: [{ protocol: 'irn' }], ...namespaces } })
}
const namespace = (group: number) => ({
  chains: [formatChain('devnet', group)],
  methods: ['alph_signMessage'],
  events: ['accountChanged']
})

it('approves optional namespaces from modern relay proposals before legacy namespaces', async () => {
  const wallet = await initializeWallet()
  await propose({
    optionalNamespaces: { alephium: namespace(wallet.group) },
    requiredNamespaces: { alephium: namespace((wallet.group + 1) % 4) }
  })
  expect(wallet.permittedAddressGroup).toBe(wallet.group)
  expect(wallet.topic).toBe('test-topic')
  expect(approve).toHaveBeenCalledWith(
    expect.objectContaining({
      id: 1,
      namespaces: { alephium: expect.objectContaining({ methods: ['alph_signMessage'] }) }
    })
  )
})

it('still approves legacy proposals when the optional Alephium namespace is absent', async () => {
  const wallet = await initializeWallet()
  await propose({ optionalNamespaces: {}, requiredNamespaces: { alephium: namespace(wallet.group) } })
  expect(wallet.topic).toBe('test-topic')
  expect(approve).toHaveBeenCalledTimes(1)
})

it('rejects a proposal that has no Alephium namespace without approving it', async () => {
  await initializeWallet()
  await expect(propose({ optionalNamespaces: {}, requiredNamespaces: {} })).rejects.toThrow(
    'alephium namespace is required'
  )
  expect(approve).not.toHaveBeenCalled()
})

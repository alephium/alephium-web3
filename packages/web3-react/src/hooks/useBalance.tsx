import { Balance } from '@alephium/web3/dist/src/api/api-alephium';
import { useEffect, useState } from 'react';
import { useContext } from '../components/AlephiumConnect';

export function useBalance() {
  const context = useContext()
  const [balance, setBalance] = useState<Balance>()

  useEffect(() => {
    const handler = async () => {
      const nodeProvider = context.signerProvider?.nodeProvider
      if (nodeProvider && context.account) {
        const result = await nodeProvider.addresses.getAddressesAddressBalance(context.account.address)
        setBalance(result)
      }
    }

    handler()
  }, [context.signerProvider?.nodeProvider, context.account])

  return { balance }
}

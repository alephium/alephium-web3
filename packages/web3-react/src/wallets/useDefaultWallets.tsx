import { getWallets } from './';
import { WalletProps } from './wallet';

function useDefaultWallets(): WalletProps[] | any {
  return getWallets({});
}

export default useDefaultWallets;

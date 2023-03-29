import { injected } from './connectors/injected';
import { walletConnect } from './connectors/walletConnect';

export const getWallets = ({
}: {
  appName?: string;
  shimDisconnect?: boolean;
}) => {
  return [
    injected({}),
    walletConnect({}),
  ];
};

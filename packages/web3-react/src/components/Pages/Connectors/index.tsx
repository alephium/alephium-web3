import React from 'react';
import { useContext, routes } from '../../AlephiumConnect';
import supportedConnectors from '../../../constants/supportedConnectors';

import {
  PageContent,
} from '../../Common/Modal/styles';

import {
  ConnectorsContainer,
  ConnectorButton,
  ConnectorLabel,
  ConnectorIcon,
  MobileConnectorsContainer,
  MobileConnectorButton,
  MobileConnectorLabel,
  MobileConnectorIcon,
} from './styles';

import { isMobile } from '../../../utils';
import useDefaultWallets from '../../../wallets/useDefaultWallets';

const Wallets: React.FC = () => {
  const context = useContext();
  const mobile = isMobile();
  const wallets = useDefaultWallets();

  const findInjectedConnectorInfo = (name: string) => {
    let walletList = name.split(/[(),]+/);
    walletList.shift(); // remove "Injected" from array
    walletList = walletList.map((x) => x.trim());

    const hasWalletLogo = walletList.filter((x) => {
      const a = wallets.map((wallet: any) => wallet.name).includes(x);
      if (a) return x;
      return null;
    });
    if (hasWalletLogo.length === 0) return null;

    const foundInjector = wallets.filter(
      (wallet: any) => wallet.installed && wallet.name === hasWalletLogo[0]
    )[0];

    return foundInjector;
  };

  return (
    <PageContent style={{ width: 312 }}>
      {mobile ? (
        <>
          <MobileConnectorsContainer>
            {supportedConnectors.map((connector) => {
              const info = supportedConnectors.filter(
                (c) => c.id === connector.id
              )[0];
              if (!info) return null;

              let logos = info.logos;
              let name = info.shortName ?? info.name ?? connector.name;

              if (info.id === 'injected') {
                const foundInjector = findInjectedConnectorInfo(connector.name ?? "");
                if (foundInjector) {
                  logos = foundInjector.logos;
                  name = foundInjector.name.replace(' Wallet', '');
                }
              }

              if (info.id === 'walletConnect') {
                name = "Wallet Connect"
              }

              return (
                <MobileConnectorButton
                  key={`m-${connector.id}`}
                  //disabled={!connector.ready}
                  onClick={() => {
                    context.setRoute(routes.CONNECT);
                    context.setConnector(connector.id);
                  }}
                >
                  <MobileConnectorIcon>
                    {logos.mobile ??
                      logos.appIcon ??
                      logos.connectorButton ??
                      logos.default}
                  </MobileConnectorIcon>
                  <MobileConnectorLabel>{name}</MobileConnectorLabel>
                </MobileConnectorButton>
              );
            })}
          </MobileConnectorsContainer>
        </>
      ) : (
        <>
          <ConnectorsContainer>
            {supportedConnectors.map((connector) => {
              const info = supportedConnectors.filter(
                (c) => c.id === connector.id
              )[0];
              if (!info) return null;

              let logos = info.logos;

              let name = info.name ?? connector.name;
              if (info.id === 'walletConnect') {
                name = "Wallet Connect"
              }

              if (info.id === 'injected') {
                const foundInjector = findInjectedConnectorInfo(connector.name ?? "");
                if (foundInjector) {
                  logos = foundInjector.logos;
                  name = foundInjector.name;
                }
              }

              let logo = logos.connectorButton ?? logos.default;
              if (info.extensionIsInstalled && logos.appIcon) {
                if (info.extensionIsInstalled()) {
                  logo = logos.appIcon;
                }
              }
              return (
                <ConnectorButton
                  key={connector.id}
                  disabled={context.route !== routes.CONNECTORS}
                  onClick={() => {
                    //connect()
                    context.setRoute(routes.CONNECT);
                    context.setConnector(connector.id);
                  }}
                >
                  <ConnectorIcon>{logo}</ConnectorIcon>
                  <ConnectorLabel>{name}</ConnectorLabel>
                </ConnectorButton>
              );
            })}
          </ConnectorsContainer>
        </>
      )}
    </PageContent>
  );
};

export default Wallets;

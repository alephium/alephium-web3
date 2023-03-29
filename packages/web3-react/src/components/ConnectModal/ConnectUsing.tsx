import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import supportedConnectors from './../../constants/supportedConnectors';

import { contentVariants } from '../Common/Modal';
import ConnectWithInjector from './ConnectWithInjector';

import Alert from '../Common/Alert';

const states = {
  QRCODE: 'qrcode',
  INJECTOR: 'injector',
};
const ConnectUsing: React.FC<{ connectorId: string }> = ({ connectorId }) => {
  const [id, setId] = useState<string>(connectorId);

  const connector = supportedConnectors.filter((c) => c.id === id)[0];

  const hasExtensionInstalled =
    connector.extensionIsInstalled && connector.extensionIsInstalled();

  // If cannot be scanned, display injector flow, which if extension is not installed will show CTA to install it
  const useInjector = !connector.scannable || hasExtensionInstalled;

  const [status, setStatus] = useState(
    useInjector ? states.INJECTOR : states.QRCODE
  );

  if (!connector) return <Alert>Connector not found</Alert>;

  // TODO: Add WalletConnect
  if (status === states.QRCODE) return <Alert>WalletConnect soon!</Alert>;

  return (
    <AnimatePresence>
      {status === states.INJECTOR && (
        <motion.div
          key={states.INJECTOR}
          initial={'initial'}
          animate={'animate'}
          exit={'exit'}
          variants={contentVariants}
        >
          <ConnectWithInjector
            connectorId={id}
            switchConnectMethod={(id?: string) => {
              if (id) setId(id);
              setStatus(states.QRCODE);
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectUsing;

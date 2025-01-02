/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import {ONE_ALPH, SignerProviderSimple, SignTransferTxResult, utils, web3, WebSocketClient} from '@alephium/web3';
import {getSigner, randomContractAddress} from '@alephium/web3-test';

const NODE_PROVIDER = 'http://127.0.0.1:22973'
const WS_ENDPOINT = 'ws://127.0.0.1:22973/ws';

describe('WebSocketClient', () => {
  let client: WebSocketClient;
  let signer: SignerProviderSimple;
  
  async function signAndSubmitTx(): Promise<SignTransferTxResult> {
    const address = (await signer.getSelectedAccount()).address;
    const attoAlphAmount = ONE_ALPH;
    return await signer.signAndSubmitTransferTx({
      signerAddress: address,
      destinations: [{ address, attoAlphAmount }],
    });
  }
  
  beforeEach(async () => {
    client = new WebSocketClient(WS_ENDPOINT);
    signer = await getSigner();
    web3.setCurrentNodeProvider(NODE_PROVIDER, undefined, fetch);
  });

  afterEach(() => {
    client.disconnect();
  });

  test('should subscribe, receive notifications and unsubscribe', (done) => {
    let notificationCount = 0;
    let blockNotificationReceived = false;
    let txNotificationReceived = false;
    let blockSubscriptionId: string;
    let txSubscriptionId: string;
    let contractEventsSubscriptionId: string;

    
    client.onConnected(async () => {
      try {
        blockSubscriptionId = await client.subscribeToBlock();
        txSubscriptionId = await client.subscribeToTx();
        contractEventsSubscriptionId = await client.subscribeToContractEvents(0, [randomContractAddress()]);
        await signAndSubmitTx();
      } catch (error) {
        done(error);
      }
    });
    
    client.onNotification(async (params) => {
      expect(params).toBeDefined();
      if (params.result.block) {
        blockNotificationReceived = true;
      } else if (params.result.unsigned) {
        txNotificationReceived = true;
      }

      notificationCount += 1;
      if (notificationCount === 2) {
        try {
          expect(blockNotificationReceived).toBe(true);
          expect(txNotificationReceived).toBe(true);
          const blockUnsubscriptionResponse = await client.unsubscribe(blockSubscriptionId);
          expect(blockUnsubscriptionResponse).toBe(true);
          const txUnsubscriptionResponse = await client.unsubscribe(txSubscriptionId);
          expect(txUnsubscriptionResponse).toBe(true);
          const contractEventsUnsubscriptionResponse = await client.unsubscribe(contractEventsSubscriptionId);
          expect(contractEventsUnsubscriptionResponse).toBe(true);
          done();
        } catch (error) {
          done(error);
        }
      }
    });
  });
});

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

import { ONE_ALPH, SignerProviderSimple, web3, WebSocketClient } from '@alephium/web3';
import { getSigner } from '@alephium/web3-test';

const WS_ENDPOINT = 'ws://127.0.0.1:22973/ws';

describe('WebSocketClient', () => {
  let signer: SignerProviderSimple;
  let wsClient: WebSocketClient;

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch);
    signer = await getSigner();
  });

  it('should connect, subscribe, and receive block event after a transaction is submitted', async () => {
    await new Promise<boolean>((resolve, reject) => {
      wsClient = new WebSocketClient(WS_ENDPOINT, [
        ['block', async (params: any) => {
          console.log('Received block event:', params);
          expect(params).toBeDefined();
        }],
      ]);
      wsClient.onOpen(() => {
        (async () => {
          try {
            const address = (await signer.getSelectedAccount()).address;
            const attoAlphAmount = ONE_ALPH;

            await signer.signAndSubmitTransferTx({
              signerAddress: address,
              destinations: [{ address, attoAlphAmount }],
            });
            resolve(true);
            wsClient.close();
          } catch (error) {
            console.error('Error during transaction submission:', error);
            reject(error);
          }
        })();
      });
    });
  });
});

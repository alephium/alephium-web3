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

import WebSocket from 'ws';
import { DEFAULT_GAS_ALPH_AMOUNT, ONE_ALPH, NodeProvider, sleep, web3 } from '@alephium/web3';
import { getSigner } from '@alephium/web3-test';

const WS_ENDPOINT = 'ws://127.0.0.1:22973/ws';

describe('WebSocket and Transaction Test', () => {
  let signer;

  beforeAll(async () => {
    web3.setCurrentNodeProvider('http://127.0.0.1:22973', undefined, fetch);
    signer = await getSigner();
  });

  it('should connect, subscribe, and receive block event after a transaction is submitted', async () => {
    const ws = new WebSocket(WS_ENDPOINT);

    await new Promise<void>((resolve, reject) => {
      ws.on('open', async () => {
        try {
          ws.send('subscribe:block');

          const address = (await signer.getSelectedAccount()).address;
          const fee = 0.01;
          const attoAlphAmount = ONE_ALPH;

          await signer.signAndSubmitTransferTx({
            signerAddress: address,
            destinations: [{ address, attoAlphAmount }],
            fee,
          });
        } catch (error) {
          console.error('Error during transaction submission:', error);
          reject(error);
        }
      });

      ws.on('message', (data) => {
        try {
          console.log('Received:', data.toString());
          const parsedData = JSON.parse(data.toString());
          expect(parsedData).toBeDefined();
          expect(parsedData.method).toBe('block');
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          ws.close();
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      });
    });
  });
});

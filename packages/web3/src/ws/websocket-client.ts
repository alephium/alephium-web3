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

type WsMessageType = string;
type WsSubscription = [WsMessageType, (params: any) => void];

export class WebSocketClient {
  private ws: WebSocket;
  private subscriptions: WsSubscription[] = [];

  constructor(endpoint: string, eventSubscriptions: WsSubscription[] = []) {
    this.ws = new WebSocket(endpoint);
    eventSubscriptions.forEach(([messageType, callback]) => {
      this.subscriptions.push([messageType, callback]);
    });

    this.ws.on('open', () => {
      console.log('WebSocket connection opened');
      this.subscribeToEvents();
    });

    this.ws.on('message', (data) => {
      try {
        const parsedData = JSON.parse(data.toString());
        this.subscriptions.forEach(([method, callback]) => {
          if (parsedData.method === method) {
            callback(parsedData.params);
          }
        });
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    this.ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  }

  private subscribeToEvents() {
    this.subscriptions.forEach(([method]) => {
      console.log(`Subscribing to ${method}`);
      this.ws.send(`subscribe:${method}`);
    });
  }

  onOpen(callback: () => void) {
    this.ws.on('open', callback);
  }

  close() {
    this.ws.close();
  }
}


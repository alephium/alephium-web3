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
import EventEmitter from 'eventemitter3';

export type WsMessageType = string;
export type WsSubscription = [WsMessageType, (params: any) => void];

export class WebSocketClient extends EventEmitter {
  private ws: WebSocket;

  constructor(endpoint: string, eventSubscriptions: WsSubscription[] = []) {
    super();
    this.ws = new WebSocket(endpoint);

    this.ws.on('open', () => {
      console.log('WebSocket connection opened');
      this.emit('open');
      this.subscribeToEvents(eventSubscriptions);
    });

    this.ws.on('message', (data) => {
      try {
        const parsedData = JSON.parse(data.toString());
        this.emit(parsedData.method, parsedData.params);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    });

    this.ws.on('close', () => {
      console.log('WebSocket connection closed');
      this.emit('close');
    });
  }

  private subscribeToEvents(eventSubscriptions: WsSubscription[]) {
    eventSubscriptions.forEach(([messageType, callback]) => {
      this.on(messageType, callback);
      console.log(`Subscribing to ${messageType}`);
      this.ws.send(`subscribe:${messageType}`);
    });
  }

  onOpen(callback: () => void) {
    this.ws.on('open', callback);
  }

  close() {
    this.ws.close();
  }
}
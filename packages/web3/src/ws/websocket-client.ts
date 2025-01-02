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
import { EventEmitter } from 'eventemitter3';

export class WebSocketClient extends EventEmitter {
  private ws: WebSocket;
  private requestId: number;
  private isConnected: boolean;
  private notifications: any[];

  constructor(url: string) {
    super();
    this.ws = new WebSocket(url);
    this.requestId = 0;
    this.isConnected = false;
    this.notifications = [];

    this.ws.on('open', () => {
      this.isConnected = true;
      this.emit('connected');
    });

    this.ws.on('message', (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.method === 'subscription') {
          // Emit and store notifications
          const params = message.params;
          this.notifications.push(params);
          this.emit('notification', params);
        } else {
          this.emit(`response_${message.id}`, message);
        }
      } catch (error) {
        this.emit('error', error);
      }
    });

    this.ws.on('close', () => {
      this.isConnected = false;
      this.emit('disconnected');
    });
  }

  public subscribe(method: string, params: unknown[] = []): Promise<string> {
    const id = this.getRequestId();
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      this.once(`response_${id}`, (response) => {
        if (response.result) {
          resolve(response.result);
        } else {
          reject(response.error);
        }
      });
      this.ws.send(JSON.stringify(request));
    });
  }

  public unsubscribe(subscriptionId: string): Promise<boolean> {
    const id = this.getRequestId();
    const request = {
      jsonrpc: '2.0',
      id,
      method: 'unsubscribe',
      params: [subscriptionId]
    };

    return new Promise((resolve, reject) => {
      this.once(`response_${id}`, (response) => {
        if (response.result === true) {
          resolve(true);
        } else {
          reject(response.error);
        }
      });
      this.ws.send(JSON.stringify(request));
    });
  }

  public async subscribeToBlock(): Promise<string> {
    return this.subscribe('subscribe', ['block']);
  }

  public async subscribeToTx(): Promise<string> {
    return this.subscribe('subscribe', ['tx']);
  }

  public async subscribeToContractEvents(eventIndex: number, addresses: string[]): Promise<string> {
    return this.subscribe('subscribe', ['contract', eventIndex, addresses]);
  }

  public onConnected(callback: () => void) {
    if (this.isConnected) {
      callback();
    } else {
      this.on('connected', callback);
    }
  }

  public onNotification(callback: (params: any) => void) {
    for (const notification of this.notifications) {
      callback(notification);
    }

    this.on('notification', callback);
  }

  public disconnect() {
    this.ws.close();
  }

  private getRequestId(): number {
    return ++this.requestId;
  }
}

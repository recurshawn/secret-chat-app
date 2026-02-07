import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { io as ClientIO, Socket as ClientSocket } from 'socket.io-client';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { AddressInfo } from 'net';
import { setupSocketHandlers } from '../../lib/socket-handler.mjs';

describe('Socket.io Integration', () => {
  let io: Server, clientSocket: ClientSocket, port: number;

  beforeAll(async () => {
    return new Promise<void>((resolve) => {
      const httpServer = createServer();
      io = new Server(httpServer);
      setupSocketHandlers(io);

      httpServer.listen(() => {
        port = (httpServer.address() as AddressInfo).port;
        clientSocket = ClientIO(`http://localhost:${port}`);
        clientSocket.on('connect', resolve);
      });
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });

  it('should connect to the socket server', () => {
    expect(clientSocket.connected).toBe(true);
  });

  it('should join a room and communicate', () => {
    return new Promise<void>((resolve) => {
      const roomName = 'test-room';
      const messageData = { room: roomName, message: 'Hello spy!' };

      clientSocket.emit('join-room', roomName);

      clientSocket.on('receive-message', (data) => {
        expect(data).toEqual(messageData);
        resolve();
      });

      // Give a small delay to ensure join-room is processed
      setTimeout(() => {
        clientSocket.emit('send-message', messageData);
      }, 50);
    });
  });
});

import { io } from 'socket.io-client';

const socket = io();

export function getSocket() {
    return socket;
}

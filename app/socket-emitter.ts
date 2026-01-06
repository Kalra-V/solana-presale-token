import { Server as SocketIOServer } from "socket.io";

let ioInstance: SocketIOServer | null = null;

export function setSocketIOInstance(io: SocketIOServer) {
  ioInstance = io;
}

export function emitEvent(eventName: string, data: any) {
  if (ioInstance) {
    ioInstance.emit(eventName, data);
    console.log(`Emitted event: ${eventName}`, data);
  } else {
    console.warn("Socket.io instance not set, event not emitted:", eventName);
  }
}


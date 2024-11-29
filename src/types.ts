import makeWASocket, { BaileysEventMap } from '@whiskeysockets/baileys';

export type Socket = ReturnType<typeof makeWASocket>;
export type SocketEvents = Partial<BaileysEventMap>;

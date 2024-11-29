import makeWASocket, {
  BaileysEventMap,
  DisconnectReason,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import logger from './logger';
import { Socket } from './types';

const waLogger = logger.child({ whatsapp_logs: true });
waLogger.level = 'info';
const MAX_RETRY = 1;
/**
 *  Whatsapp Socket singleton
 */
class WASocket {
  online: boolean = false;
  private socket: Socket | null = null;
  private retries: number = 0;
  private credsPath: string;
  private listeners: (
    socket: Socket
  ) => (events: Partial<BaileysEventMap>) => void;

  /**
   *
   * @param phoneNumber - client phone number
   * @param credsPath - Path to whatsapp credentials
   * @param listeners - Handlers to manage socket events
   */
  constructor(
    phoneNumber: string,
    credsPath: string,
    listeners: (socket: Socket) => (events: Partial<BaileysEventMap>) => void
  ) {
    this.credsPath = credsPath;
    this.listeners = listeners;
  }

  /**
   * Start the Whatsapp Socket
   * @param message - success message
   * @param isManualLogin - is true if user initated login manually
   */
  async start(message: string) {
    if (this.socket !== null) {
      this.close();
      this.socket = null;
    }
    //credetial management
    const { state, saveCreds } = await useMultiFileAuthState(this.credsPath);

    // create whatsapp socket
    this.socket = makeWASocket({
      logger: waLogger as any,
      auth: {
        creds: state.creds,
        keys: state.keys,
      },
      printQRInTerminal: true,
      syncFullHistory: false,
      shouldSyncHistoryMessage: () => false,
    });

    // save wa creds whenever they are updated
    this.socket.ev.on('creds.update', () => {
      saveCreds();
    });

    this.socket.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'open') {
        this.online = true;
        logger.info('Socked connected', { message });
      }
      if (connection === 'close') {
        this.online = false;
        const connectionClosed =
          (lastDisconnect?.error as any)?.output.statusCode ===
          DisconnectReason.connectionClosed;
        const isLoggedOut =
          (lastDisconnect?.error as any)?.output.statusCode ===
          DisconnectReason.loggedOut;

        if (connectionClosed) {
          logger.info('socket connection closed');
          return;
        }
        if (isLoggedOut) {
          // TODO: 1.notify admin that device has been logged
          logger.info('whatsapp agent logged out');
          return;
        }
        if (this.retries === MAX_RETRY) {
          // TODO: 1.notify admin that connectionhas failed
          logger.info('maximum retries reached');
          logger.error('Socket connection failed', {
            reason:
              (lastDisconnect?.error as any)?.output.statusCode || 'unknown',
          });
          return;
        }
        logger.info('retrying failed connection', {
          reason:
            (lastDisconnect?.error as any)?.output.statusCode || 'unknown',
        });
        this.start(message);
        this.retries++;
      }
    });

    // batch process socket events
    this.socket.ev.process(this.listeners(this.socket));
  }

  close() {
    if (this.socket == null) {
      throw Error('DisconnectSocketError: No socket found');
    }
    this.online = false;
    this.socket.end(undefined);
    this.socket = null;
  }
}

export default WASocket;

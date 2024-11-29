import { Socket, SocketEvents } from './types';
import * as helpers from './helpers';
import getTranslation from './translations';
import execInstruction from './instructions';
import logger from './logger';
import { proto } from '@whiskeysockets/baileys';

const listeners = (sock: Socket) => async (events: SocketEvents) => {
  if (events['messages.upsert']) {
    const upsert = events['messages.upsert'];
    if (upsert.type == 'append' /* append message to chat*/) return;
    for (const msg of upsert.messages) {
      if (
        msg.message?.protocolMessage?.type ===
        proto.Message.ProtocolMessage.Type.HISTORY_SYNC_NOTIFICATION
      ) {
        logger.warn('intercepted history sync message');
        return;
      }
      // Ignore messages from self
      if (msg.key.fromMe) return;
      const jid = msg.key!.remoteJid!;
      logger.info('message received', {
        jid,
      });
      // Ignore non group messages
      const isGroupMessage = helpers.checkIsGroup(jid);
      if (!isGroupMessage) {
        logger.info('intercepted message thats not from group', {
          jid,
        });
        return;
      }

      // Ignore messages that dont contain text
      const text = helpers.extractMessageText(msg);
      if (!text) return;

      // Check if message is instruction
      const isInstruction = helpers.isInstruction(msg);
      if (isInstruction) {
        const reply = execInstruction(jid, text);
        if (reply) {
          await sock.sendMessage(jid, {
            text: reply,
          });
          return;
        }
      }

      // Ignore if translations have been paused
      const translationPaused = helpers.translationsArePaused(jid);
      if (translationPaused) return;

      const shouldTranslateText = helpers.shouldTranslateText(text);
      if (!shouldTranslateText) {
        logger.info('intercepted message that should not be translated');
        return;
      }
      console.log(shouldTranslateText, text);
      // Translate text
      const translatedText = await getTranslation(text);
      if (!translatedText) return;

      const mentions = helpers.hasMentions(msg);
      // Send message back to group
      if (mentions) {
        await sock.sendMessage(jid, {
          text: translatedText,
          mentions,
        });
        logger.info('translation sent', {
          remotejid: jid,
          charLentgh: text.length,
        });
      } else {
        await sock.sendMessage(jid, {
          text: translatedText,
        });
        logger.info('translation sent', {
          remotejid: jid,
          charLentgh: text.length,
        });
      }
    }
  }
};

export default listeners;

/**
 *  check if its instruction
 * process instruction [pause and unpause]
 * pause sets group jid with paused  with ttl 30 mins
 *
 *
 * store
 * store
 */

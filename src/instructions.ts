import { mentionsRe } from './helpers';
import logger from './logger';
import store from './store';
const execInstruction = (jid: string, text: string): string | void => {
  text = text.replaceAll(mentionsRe, '').trim();
  if (text == 'pause') {
    store.set(jid, true);
    logger.info('chat translations paused', { jid });
    return 'Translations have been paused for 15 mins.';
  }
  if (text == 'unpause') {
    try {
      store.del(jid);
      return 'chat ranslations resumed.';
    } catch (e) {
      return;
    }
  }
  return;
};
export default execInstruction;

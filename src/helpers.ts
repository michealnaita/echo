import { proto } from '@whiskeysockets/baileys';
import store from './store';
import settings from './settings';

const urlRe =
  /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/gi;
export const mentionsRe = /@\d{5,}/gi;
export const checkIsGroup = (jid: string) => /.+@g.us/.test(jid);

export const translationsArePaused = (jid: string) => {
  return !!store.get(jid);
};

export const stripExtendedText = (text: string): [string, string[]] => {
  let i = 0;
  const v: string[] = [];
  text = text.replaceAll(mentionsRe, (match) => {
    v.push(match);
    return `{${++i}}`;
  });
  text = text.replaceAll(urlRe, (match) => {
    v.push(match);
    return `{${++i}}`;
  });
  return [text, v];
};

export const mergeExtendedText = (str: string, values: string[]) => {
  let i = 0;
  str = str.replaceAll(/\{\d\}/g, () => values[i++]);
  return str;
};

export const shouldTranslateText = (text: string) => {
  // remove all urls
  text = text.replaceAll(urlRe, '');
  // remove all mentions
  text = text.replaceAll(mentionsRe, '');
  // remove whitespaces
  text = text.trim();
  // check if text has words
  return /((\p{L}){2,})+/gu.test(text);
};

export const extractMessageText = (
  msg: proto.IWebMessageInfo
): string | undefined => {
  let text: string | undefined = undefined;
  if (!msg.message) return text;
  if (msg.message.conversation) text = msg.message.conversation;
  if (msg.message.imageMessage?.caption)
    text = msg.message.imageMessage.caption;
  if (msg.message.videoMessage?.caption)
    text = msg.message.videoMessage.caption;
  if (msg.message.extendedTextMessage?.text)
    text = msg.message.extendedTextMessage.text!;
  return text;
};

export const isInstruction = (msg: proto.IWebMessageInfo) => {
  const mentions = hasMentions(msg);
  if (mentions && mentions.length === 1 && mentions.includes(settings.agentJid))
    return true;
  return false;
};

export const hasMentions = (msg: proto.IWebMessageInfo): string[] | false => {
  if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid)
    return msg.message.extendedTextMessage?.contextInfo.mentionedJid;
  return false;
};

import T from '@google-cloud/translate';
import logger from './logger';

const LANGUAGES = ['en', 'tr'];

const translate = new T.v2.Translate();

const detectLanguage = async (text: string): Promise<string | void> => {
  const [result] = await translate.detect(text);
  const { confidence, language } = result;
  if (confidence < 0.8) {
    logger.info('langauge detection has low confidence');
    return;
  }
  if (!LANGUAGES.includes(language)) {
    logger.info('langauge detected is not english or turkish');
    return language;
  }
  return language;
};

const translateText = async (text: string, lang: string): Promise<string> => {
  const [str] = await translate.translate(text, lang);
  return str;
};

const getTranslation = async (text: string): Promise<string | void> => {
  const lang = await detectLanguage(text);
  const langTo = lang == 'en' ? 'tr' : 'en';
  if (!lang) return;
  const translation = await translateText(text, langTo);
  logger.info(`lanaguage translated from ${lang} to ${langTo}`);
  return translation;
};

export default getTranslation;

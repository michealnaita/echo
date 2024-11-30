import winston from 'winston';
import Transport from 'winston-transport';
import settings from './settings';
import path from 'path';
import { Logging } from '@google-cloud/logging';

const { combine, timestamp, json } = winston.format;

let cloudLogging: any;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS && settings.isProd) {
  cloudLogging = new Logging({ projectId: settings.projectId });
}

class CloudLogger extends Transport {
  constructor(opts?: any) {
    super(opts);
  }
  log(info: any, next: () => void) {
    const { level, message, ...rest } = info;
    setImmediate(() => {
      this.emit('logged', info);
    });
    const log = cloudLogging.log('tBot-server-logs');
    const entry = log.entry(
      {
        severity: level.toUpperCase(),
        message,
        ...rest,
      },
      message
    );
    // write log to cloud
    log.write(entry).then(() => {
      next();
    });
  }
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4,
};

const logger = winston.createLogger({
  format: combine(timestamp(), json()),
  levels: levels,
});

if (settings.isDev) {
  logger.level = 'debug';
  logger.add(new winston.transports.Console());
} else {
  logger.level = 'info';
  logger.add(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
    })
  );
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // enable cloud loging if service account key exists
    logger.add(new CloudLogger());
  }
  logger.add(new winston.transports.Console());
}
if (settings.isTesting) logger.silent = true;

export default logger;

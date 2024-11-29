import path from 'path';
import WASocket from './waSocket';
import listeners from './listeners';
import morgan from 'morgan';
import express from 'express';
import fs from 'fs';
import settings from './settings';
import logger from './logger';
import createHttpError from 'http-errors';
import https from 'https';
import('./store');

const app = express();
app.use(express.json());

//make sure that logs folder exists
const logsDirExists = fs.existsSync(path.join(process.cwd(), 'logs'));
if (!logsDirExists) {
  fs.mkdirSync(path.join(process.cwd(), 'logs'));
}

// access logs
const accessLogStream = fs.createWriteStream(
  path.join(process.cwd(), 'logs', 'access.log'),
  {
    flags: 'a',
  }
);
if (settings.isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
  app.use(morgan('combined', { stream: accessLogStream }));
}

// Whatsapp agent Conf
const credentials = path.join(process.cwd(), '.wa-auth');
const agent = new WASocket(credentials, listeners);

app.use((req, _res, next) => {
  if (settings.isDev) return next();
  if (req.headers['x-secret'] && req.headers['x-secret'] === process.env.SECRET)
    return next();
  next(createHttpError(401));
});

app.get('/__/startAgent', async (_req, res, next) => {
  try {
    if (agent.online) {
      res.sendStatus(200);
      return;
    }
    agent.start((err) => {
      if (err) {
        logger.error(err.message);
        res.status(500).json({
          message: err.message,
        });
        return;
      }
      logger.info('Translation bot is up and online! 🚀');
      res.sendStatus(200);
    });
  } catch (e) {
    next(e);
  }
});

app.get('/__/pingAgent', async (_req, res) => {
  if (agent.online) {
    res.sendStatus(200);
  } else {
    res.sendStatus(503);
  }
});

app.get('/__/killAgent', async (_req, res, next) => {
  try {
    if (!agent.online) {
      res.send(200);
      return;
    }
    agent.close();
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: any, req: any, res: any, next: any) => {
  logger.error(error.message, {
    error_object: JSON.stringify(error),
    path: req.path,
  });
  res.sendStatus(error.statusCode || 500);
});

let httpServer: any;

const cb = () => {
  logger.info('app is running on port: ' + settings.port);
  // start whatsapp socket
  try {
    agent.start((err) => {
      if (err) {
        logger.error(err.message);
        return;
      }
      logger.info('Translation bot is up and online! 🚀');
    });
  } catch (e: any) {
    logger.error(e.message, { error_object: JSON.stringify(e) });
    agent.close();
  }
};

// server over https in production
if (settings.isProd) {
  httpServer = https
    .createServer(
      {
        cert: fs.readFileSync(path.join(process.cwd(), 'ssl', 'server.crt')),
        key: fs.readFileSync(path.join(process.cwd(), 'ssl', 'server.key')),
      },
      app
    )
    .listen(settings.port, cb);
} else {
  httpServer = app.listen(settings.port, cb);
}

// shutdownserver and disconnect whatsapp agent
const shutdown = () => {
  try {
    if (process.env.TS_NODE_DEV) {
      console.log('closing process due to file changes');
      return process.exit(1);
    }
    logger.info('Shutting down server...');
    console.log('\nShutting down server...');
    agent.close();
    httpServer.close(() => {
      process.exit(0);
    });
    setTimeout(() => {
      console.log('\nForcing shutdown...');
      logger.info('Forcing shutdown...');
      process.exit(1);
    }, 5000);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    console.log('\nErrors occured while shutting down');
    console.log('Forcing shutdown...');
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// test deploy
// documentation and contributing, editor config, prettier

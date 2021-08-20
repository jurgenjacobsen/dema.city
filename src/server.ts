import express from 'express';
import morgan from 'morgan';
import greenlock from 'greenlock-express';
import { Server, Socket } from 'socket.io';
import { join } from 'path';
import { createServer } from 'http';
import { vhost, print } from './utils';

import { bot } from './bot';
bot;
import { api, dev, app } from './sub-servers/index';
import { access } from './database';

const server = express();
const httpServer = createServer(server);
let io: Server = new Server();

server.use(morgan('dev'));
server.use(express.urlencoded({ extended: true }));
server.use(express.json());
server.use('/assets', express.static(join(__dirname, '../assets')));

server.use((req, res, next) => {
  let ua = req.headers['user-agent'] ?? '';
  if (ua.includes('Electron')) {
    (req as any).isElectron = true;
  } else {
    (req as any).isElectron = false;
  }
  next();
});

if (process.env.IS_PROD) {
  server.use(vhost('api.dema.city', api));
  server.use(vhost('dev.dema.city', dev));

  server.use(vhost('www.dema.city', app));
  server.use(vhost('dema.city', app));
} else {
  server.use(vhost('api.localhost', api));
  server.use(vhost('dev.localhost', dev));

  server.use(vhost('www.localhost', app));
  server.use(vhost('localhost', app));
}

if (process.env.IS_PROD) {
  print('Production Mode');
  greenlock.init({ packageRoot: join(__dirname, '../'), maintainerEmail: 'jurgenjacobsen2005@gmail.com', configDir: './greenlock.d', cluster: false }).ready((glx: any) => {
    io = new Server(glx.httpsServer());
    glx.serveApp(server);
  });
} else {
  print('Development Mode');
  io = new Server(httpServer);
  httpServer.listen(process.env.PORT, () => print(`Listening on port: ${process.env.PORT}`));
}

io.use(async (socket, next) => {
  if (!socket.handshake.headers.host?.startsWith('api.')) return socket.disconnect();
  if (!socket.handshake?.auth?.token) return socket.disconnect();
  let authorized = await access.schema.findOne({ 'data.token': socket.handshake.auth.token });
  if (!authorized) return socket.disconnect();
  next();
});

io.on('connection', (socket) => {
  let lastPing = new Date();

  let interv = setInterval(() => {
    if (new Date().getTime() - lastPing.getTime() > 60 * 1000 + 1000) {
      socket.disconnect();
      clearInterval(interv);
    }
  }, 60 * 1000);

  socket.on('ping', () => (lastPing = new Date()));
});

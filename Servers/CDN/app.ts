import express from 'express';
import path from 'path';
import { SubServer } from  '../../Utils/Servers/SubServer';

const app = express();
export const server = new SubServer({
  hostname: 'cdn.dema.city',
  app: app,
  www: true,
  status: 'ONLINE',
});

app.get('/', (req, res) => {
  res.send(`Clancy's not here :/`);
});

let files = path.resolve('./Files');
app.use("/images", express.static(files + '/images'));
app.use("/audios", express.static(files + '/audios'));
app.use("/videos", express.static(files + '/videos'));
app.use("/styles", express.static(files + '/styles'));
app.use("/scripts", express.static(files + '/scripts'));

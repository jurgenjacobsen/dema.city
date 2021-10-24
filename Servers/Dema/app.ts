import express from 'express';
import { SubServer } from  '../../Utils/Servers/SubServer';

const app = express();
export const server = new SubServer({
  hostname: 'dema.city',
  app: app,
  www: true,
  status: 'MAINTENANCE',
});

app.get('/', (req, res) => {
  res.send('HELLO WORLD!')
});
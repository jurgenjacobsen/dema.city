import express from 'express';
import path from 'path';
import { SubServer } from '../structures/Hosts';

const app = express();

app.use('/images', express.static(path.join(__dirname, `../../assets/images`)));
app.use('/audios', express.static(path.join(__dirname, `../../assets/audio`)));
app.use('/videos', express.static(path.join(__dirname, `../../assets/videos`)));

app.get('/', (req, res) => {
  res.sendStatus(200);
});

export const server = new SubServer("cdn.dema.city", app);

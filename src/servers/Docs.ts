import express from 'express';
import path from 'path';
import { readdirSync } from 'fs';
import { SubServer } from '../structures/Hosts';

const app = express();

let documentations: string[] = [];

for(let folder of readdirSync(path.join(__dirname, '../../docs/'))) {
  if(!folder.endsWith('.ejs')) {
    app.use(`/${folder}`, express.static(path.join(__dirname, `../../docs/${folder}`)));
    documentations.push(folder);
  }
}

app.get('/', (req, res) => {
  res.render(path.join(__dirname, '../../docs/index.ejs'), {
    documentations: documentations,
  });
})

export const server = new SubServer("docs.dema.city", app);

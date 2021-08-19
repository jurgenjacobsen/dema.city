import express from 'express';
import { renderFile } from 'ejs';
import { join } from 'path';

const app = express();

app.set('views', join(__dirname, '../../pages'));
app.set('view engine', 'ejs');
app.engine('html', renderFile);

app.get('/', (req, res) => {
  res.render('index/home');
});

export { app };

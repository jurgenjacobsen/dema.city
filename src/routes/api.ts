import express from 'express';
import { renderFile } from 'ejs';
import { join } from 'path';

const api = express();

api.set('views', join(__dirname, '../../pages'));
api.set('view engine', 'ejs');
api.engine('html', renderFile);

api.get('/', (req, res) => {
  res.render('api/index');
});

export { api };
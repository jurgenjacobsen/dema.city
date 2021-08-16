import express from 'express';

const dev = express();

dev.get('/', (req, res) => {
  res.end('dev');
});

export { dev };
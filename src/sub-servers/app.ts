import express from 'express';
import marked from 'marked';
import { renderFile } from 'ejs';
import { join } from 'path';
import { readFileSync } from 'fs';
import { markdownTemplate } from '../utils';

const app = express();

let docsPath = join(__dirname, '../../docs');

app.set('views', join(__dirname, '../../pages'));
app.set('view engine', 'ejs');
app.engine('html', renderFile);

app.get('/'); // Home Page

app.get('/sign');

app.get('/profile'); // Own User profile

app.get('/post/:id'); // Post

app.get('/u/:username'); // User profile
app.get('/search'); // Searches for a user or post
app.get('/explore'); // Feed of global posts

// Bureaucratic
app.get('/terms', (req, res) => {
  let file = readFileSync(`${docsPath}/terms.md`);
  res.send(markdownTemplate(`Terms of Service`, `/terms`, marked(file.toString())));
}); // Terms of service and privacy

app.get('/guidelines'); // Community and user behavior guidelines

app.get('/dsc', (req, res) => {
  res.redirect('https://discord.gg/GtaxXxNYaD');
});

export { app };

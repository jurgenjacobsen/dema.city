import express from 'express';
import { renderFile } from 'ejs';
import { join } from 'path';

const app = express();

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
app.get('/terms'); // Terms of service and privacy

app.get('/guidelines'); // Community and user behavior guidelines

export { app };

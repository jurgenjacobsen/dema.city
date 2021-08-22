import express, { Request } from 'express';
import marked from 'marked';
import passport from 'passport';
import twitterApi from 'passport-twitter';
import discordApi from 'passport-discord';
import session from 'express-session';
import flash from 'connect-flash';

import { renderFile } from 'ejs';
import { join } from 'path';
import { readFileSync } from 'fs';
import { markdownTemplate } from '../utils';
import { users } from '../database';

const app = express();

let discordScopes = ['identify', 'guilds.join', 'email'];
let docsPath = join(__dirname, '../../docs');

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj as any));

passport.use(
  new twitterApi.Strategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY as string,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET as string,
    } as any,
    async (token, tokenSecret, profile, done) => {
      let raw = await users.schema.findOne({ 'data.twitterId': profile.id });

      if (!raw) {
        raw = await users.schema.findOne({ 'data.email': profile.emails?.[0]?.value });
      }
      
      if (!raw) return done({ message: 'User not found' }, null);

      return done(null, raw.data);
    },
  ),
);

passport.use(
  new discordApi.Strategy(
    {
      clientID: '845048506535378946',
      clientSecret: process.env.CLIENT_SECRET as string,
      callbackURL: 'http://localhost/auth/discord/cb',
      scope: discordScopes,
    },
    async (accessToken, refreshToken, profile, done) => {
      let raw = await users.schema.findOne({ 'data.discordId': profile.id });
      if (!raw) {
        raw = await users.schema.findOne({ 'data.email': profile.email });
      }

      if (!raw) {
        return done({ name: '', message: 'User not found' }, undefined);
      }

      return done(null, raw.data);
    },
  ),
);

app.use(express.json());
app.use(session({ secret: 'jtJa6wnZHcasdaksjhdkjasdasdasd', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.set('views', join(__dirname, '../../pages'));
app.set('view engine', 'ejs');
app.engine('html', renderFile);

app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/discord', passport.authenticate('discord'));

app.get(
  '/auth/twitter/cb',
  passport.authenticate('twitter', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  }),

);

app.use(
  '/auth/discord/cb',
  passport.authenticate('discord', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  }),
);

app.use((req, res, next) => {
  if(!req.isAuthenticated() && req.path !== '/login') {
    res.redirect('/login');
  } else {
    next();
  }
});

app.get('/', (req, res) => {
  console.log(req.user);
  res.sendStatus(200);
}); // Home Page

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

app.get('/guidelines', (req, res) => {
  let file = readFileSync(`${docsPath}/guidelines.md`);
  res.send(markdownTemplate(`Guidelines`, `/guidelines`, marked(file.toString())));
}); // Community and user behavior guidelines

app.get('/logout', (req, res) => {
  req.logout();
});

app.get('/login', (req, res) => {
  if(req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('index/login', {
    err: req.flash(),
  });
});


app.get('/dsc', (req, res) => {
  res.redirect('https://discord.gg/GtaxXxNYaD');
});

export { app };

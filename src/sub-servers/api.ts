import express from 'express';
import { renderFile } from 'ejs';
import { join } from 'path';
import { token } from '../utils';
import { Strategy } from 'passport-discord';
import passport from 'passport';
import session from 'express-session';
import { users, access, User, news, posts, badges } from '../database';

const api = express();
const scopes = ['identify', 'guilds.join', 'email'];

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj: any, done) => done(null, obj));

passport.use(
  new Strategy(
    {
      clientID: '845048506535378946',
      clientSecret: process.env.CLIENT_SECRET as string,
      callbackURL: process.env.CALLBACK,
      scope: scopes,
    },
    async (accessToken, refreshToken, profile, done) => {
      process.nextTick(function () {
        return done(null, profile);
      });
    },
  ),
);

api.use(session({ secret: 'SESSION-' + token(10), resave: false, saveUninitialized: false }));
api.use(passport.initialize());
api.use(passport.session());

api.set('views', join(__dirname, '../../pages'));
api.set('view engine', 'ejs');
api.engine('html', renderFile);

api.get('/login', passport.authenticate('discord', { scope: scopes }), (req, res) => {});

api.get('/auth', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/');
});

api.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

api.get('/', (req, res) => {
  res.render('api/index', {
    user: req.user,
    auth: req.isAuthenticated(),
  });
});

api.get('/documentation', (req, res) => {
  res.render('api/documentation', {
    user: req.user,
    auth: req.isAuthenticated(),
  });
});

api.get('/application', (req, res) => {
  res.render('api/application', {
    user: req.user,
    auth: req.isAuthenticated(),
  });
});

//
// Actual Api
//

api.use(async (req, res, next) => {
  let auth = req.headers.authorization?.split('Bearer')[1]?.trim();
  if (auth) {
    let data = await access.schema.findOne({ 'data.token': auth });
    if (data) {
      (req as any).applicationId = data.applicationId;
      next();
    }
  }
});

api.get('/users/:query', async (req, res) => {
  let raw: any | undefined = undefined;
  let dataByID = await users.schema.findOne({ ID: req.params.query });
  if (dataByID) raw = dataByID;

  let dataByUsername = await users.schema.findOne({ 'data.username': req.params.query });
  if (dataByUsername) raw = dataByUsername;

  raw = raw.data as User;

  if (!raw) return res.json({});

  if (raw.options.private && !(raw.follows.includes((req as any).applicationId) && raw.followers.includes((req as any).followers))) return res.json({});

  let data = {
    id: raw.id,
    username: raw.username,
    name: raw.name,
    banner: raw.banner,
    icon: raw.icon,
    birthday: raw.birthday,
    aboutme: raw.aboutme,
    location: raw.location,
    discordId: raw.discordId,
    instagram: raw.instagram,
    twitter: raw.twitter,
    website: raw.website,
    staff: raw.staff,
    verified: raw.verified,
    partner: raw.partner,
    developer: raw.developer,
    badges: raw.badges,
    likes: raw.likes,
    posts: raw.posts,
    followers: raw.followers,
    follows: raw.follows,
  };

  return res.json(data);
});

api.get('/news/:id', async (req, res) => {
  let raw = await news.schema.findOne({ ID: req.params.id });
  if (!raw) return res.json({});

  raw = raw?.data;
  res.json(raw);
});

api.get('/posts/:id', async (req, res) => {
  let raw = await posts.schema.findOne({ ID: req.params.id });
  if (!raw) return res.json({});

  raw = raw?.data;
  res.json(raw);
});

api.get('/badges/:id', async (req, res) => {
  let raw = await badges.schema.findOne({ ID: req.params.id });
  if (!raw) return res.json({});

  raw = raw?.data;
  res.json(raw);
});

export { api };

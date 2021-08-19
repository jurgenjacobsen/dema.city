import express from 'express';
import { renderFile } from 'ejs';
import { join } from 'path';
import { token } from '../utils';
import { Strategy } from 'passport-discord';
import passport from 'passport';
import session from 'express-session';
import { users, access } from '../database';

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

api.use(session({ secret: 'SESSION-=-' + token(10), resave: false, saveUninitialized: false }));
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
      (req as any).isPrivileged = data.privileged ?? false;
      next();
    }
  }
});

api.get('/users/list', (req, res) => {
  users.schema.find({}, (err: Error, data: any) => {
    if (err) {
      return res.json([]);
    }

    if (!data) {
      return res.json([]);
    }

    res.json((req as any).isPrivileged ? data.map((d: any) => d.data) : data.map((d: any) => d.data).slice(0, 256));
  });
});

api.get('/users/:id', (req, res) => {
  users.schema.findOne({ ID: req.params.id }, (err: Error, data: any) => {
    if (err) {
      return res.json({});
    }

    if (!data) {
      return res.json({});
    }

    res.json(data.data);
  });
});

export { api };

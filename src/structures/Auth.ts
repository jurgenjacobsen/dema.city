import axios from "axios";
import md5 from "md5";
import dotenv from "dotenv";

import { NextFunction, Request, Response } from "express";
import { LastFmUsers, Raindrop } from "./Database";
import { Strategy as DiscordAuth } from "passport-discord";
import { Strategy as TwitterAuth } from "passport-twitter";
import { Email, users } from "../Managers/UsersManager";

dotenv.config();

export const LastFmAuthentication = (redirectTo: string) => async (req: Request, res: Response) => {
  const api_sig = md5(`api_key${process.env.LAST_FM_KEY}methodauth.getSessiontoken${req.query.token}${process.env.LAST_FM_SECRET}`);
  const response = await axios.get(`http://ws.audioscrobbler.com/2.0/?format=json&method=auth.getSession&api_key=${process.env.LAST_FM_KEY}&api_sig=${encodeURI(api_sig)}&token=${req.query.token}`);
  LastFmUsers.set(response.data.session.name, {
    ...response.data,
    api_sig,
  });
  return res.redirect(redirectTo);
};

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.redirect("/login");
  }
};

export const TwitterAuthenication = new TwitterAuth(
  {
    consumerKey: process.env.TWITTER_CONSUMER_KEY as string,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET as string,
    callbackURL: "https://dema.city/auth/twitter",
    includeEmail: true,
  },
  async (token, tokenSecret, profile, done) => {
    const email = profile.emails?.[0].value;

    let user = (await users.raw({ "data.twitterId": profile.id })) ?? (await users.raw({ "data.email": email }));

    if (user) {
      return done(null, user);
    }

    if (email) {
      user = await users.create({ email: email as Email, twitterId: profile.id as Raindrop });
      user = await users.raw(user.id);
      return done(null, user);
    }

    return done("Account not found!", undefined);
  }
);

export const DiscordAuthentication = new DiscordAuth(
  {
    clientID: process.env.DISCORD_CLIENT_ID as string,
    clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    callbackURL: "https://dema.city/auth/discord",
    scope: ["identify", "guilds.join", "email"],
  },
  async (accessToken, refreshToken, profile, done) => {
    let user = (await users.raw({ "data.discordId": profile.id })) ?? (await users.raw({ "data.email": profile.email }));

    if (user) {
      return done(null, user);
    }

    if (profile.email) {
      user = await users.create({ email: profile.email as Email, discordId: profile.id as Raindrop });
      user = await users.raw(user.id);
      return done(null, user);
    }

    return done("Account not found!" as any, undefined);
  }
);

import colors from 'colors';
import { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import { Snowflake, User } from './database';
import { SnowflakeUtil } from 'discord.js';

dotenv.config();

export const mongoInfo = {
  mongoURL: process.env.MONGO as string,
  mongoPass: process.env.MONGO_PASS as string,
  mongoUser: process.env.MONGO_USER as string,
};

export function print(value: string | number) {
  let d = new Date();
  let m = d.getMonth() + 1;
  let dd = d.getDate();
  let h = d.getHours();
  let min = d.getMinutes();
  return console.log(`${colors.gray(`[${dd > 9 ? dd : `0${dd}`}/${m > 9 ? m : `0${m}`}/${d.getFullYear()}@${h > 9 ? h : `0${h}`}:${min > 9 ? min : `0${min}`}]`)} ${value}`);
}

export const vhost = (hostname: string, app: any) => (req: Request, res: Response, next: NextFunction) => {
  const host = req.hostname;
  if (host === hostname) {
    return app(req, res, next);
  } else {
    next();
  }
};

export function token(length: number) {
  var a = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('');
  var b = [];
  for (var i = 0; i < length; i++) {
    var j = (Math.random() * (a.length - 1)).toFixed(0);
    b[i] = a[j as any];
  }
  return b.join('');
}

export function newUser(): User {
  return {
    id: SnowflakeUtil.generate() as Snowflake,
    username: 'string',

    name: null,
    banner: null,
    icon: null,
    birthday: null,
    aboutme: null,
    location: null,

    phoneNumber: null,
    discordId: null,
    instagram: null,
    twitter: null,
    website: null,
    email: '@',

    staff: true,
    verified: true,
    partner: true,
    developer: true,

    badges: [],
    likes: [],
    posts: [],
    followers: [],
    follows: [],
    notifications: {
      red: [],
      unreads: [],
    },

    options: {
      devUpdates: true,
      emailNotifications: true,
      private: true,
    },
  };
}

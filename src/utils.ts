import colors from 'colors';
import { NextFunction, Request, Response } from 'express';

export function print(value: string | number) {
  let d = new Date();
  let m = d.getMonth() + 1;
  let dd = d.getDate();
  let h = d.getHours();
  let min = d.getMinutes();
  return console.log(`${colors.gray(`[${dd > 9 ? dd : `0${dd}`}/${m > 9 ? m : `0${m}`}/${d.getFullYear()}@${h > 9 ? h : `0${h}`}:${min > 9 ? min : `0${min}`}]`)} ${value}`)
};

export const vhost = (hostname: string, app: any) => (req: Request, res: Response, next: NextFunction) => {
  const host = req.hostname;
  if(host === hostname) {
    return app(req, res, next);
  } else {
    next();
  }
};
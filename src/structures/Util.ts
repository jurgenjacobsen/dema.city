import colors from "colors";
import { Request } from "express";
import { promisify } from 'util';

export function print(value: string | number): void {
  const d = new Date();
  const m = d.getMonth() + 1;
  const dd = d.getDate();
  const h = d.getHours();
  const min = d.getMinutes();
  return console.log(`${colors.gray(`[${dd > 9 ? dd : `0${dd}`}/${m > 9 ? m : `0${m}`}/${d.getFullYear()}@${h > 9 ? h : `0${h}`}:${min > 9 ? min : `0${min}`}]`)} ${value}`);
}

export const wait = promisify(setTimeout);

export const cdn = (req: Request): string => {
  return !req.hostname.includes('localhost') ? `${req.protocol}://cdn.dema.city` : `${req.protocol}://cdn.localhost`;
}
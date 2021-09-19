import colors from "colors";
import { NextFunction, Request, Response } from "express";
import { promisify } from "util";
import ms from "ms";
import { ApiAccess, ApplicationData, Applications, Raindrop } from "./Database";

const EPOCH = 1_420_070_400_000;
let INCREMENT = 0;

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
  return !req.hostname.includes("localhost") ? `${req.protocol}://cdn.dema.city` : `${req.protocol}://cdn.localhost`;
};

export const VisitCache = new Map<string, number>();
export const RateLimiter =
  (limit: number, time: string, points?: number) =>
  (req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined => {
    let existing = VisitCache.get(req.ip);
    if (existing) {
      existing = existing + (points ?? 1);
    } else {
      existing = points ?? 1;
    }
    if (existing > limit) {
      return res.status(418).json({
        error: true,
        message: `Rate limited! You exceeded the rate limit of ${limit} points per ${ms(time)}ms`,
      });
    }
    VisitCache.set(req.ip, existing);
    next();
    setTimeout(() => {
      let existing = VisitCache.get(req.ip);
      if (existing) {
        existing = existing - (points ?? 1);
      }
    }, ms(time));
  };

export const AuthenticateApi = async (token?: string): Promise<Raindrop | false> => {
  if (!token) return false;
  const raw = await ApiAccess.fetch({ "data.token": token });
  if (!raw) return false;
  return raw.data.applicationId;
};

export const PipeApi = (opt: { auth: boolean; limit: number; time: string; points: number }) => async (req: Request, res: Response, next: NextFunction) => {
  const err = { error: true, message: `There's a problem with the authentication!` };
  if (opt.auth) {
    const authenticated = await AuthenticateApi(req.headers.authorization);
    if (authenticated) {
      (req as ExtendedApiRequest).application = await Applications.fetch(authenticated).then((r) => r?.data);
    } else {
      return res.json(err);
    }
  }
  RateLimiter(opt.limit, opt.time, opt.points)(req, res, next);
};

export interface ExtendedApiRequest extends Request {
  application?: ApplicationData;
}

/**
 * Generate an Raindrop
 */
export const Rain = (timestamp: Date | number = Date.now()) => {
  if (timestamp instanceof Date) timestamp = timestamp.getTime();
  if (typeof timestamp !== "number" || isNaN(timestamp)) {
    throw new TypeError(`"timestamp" argument must be a number (received ${isNaN(timestamp) ? "NaN" : typeof timestamp})`);
  }
  if (INCREMENT >= 4095) INCREMENT = 0;
  const BINARY = `${(timestamp - EPOCH).toString(2).padStart(42, "0")}0000100000${(INCREMENT++).toString(2).padStart(12, "0")}`;
  return binaryToId(BINARY);
};

export const binaryToId = (num: any): string => {
  let dec = "";
  while (num.length > 50) {
    const high = parseInt(num.slice(0, -32), 2);
    const low = parseInt((high % 10).toString(2) + num.slice(-32), 2);
    dec = (low % 10).toString() + dec;
    num =
      Math.floor(high / 10).toString(2) +
      Math.floor(low / 10)
        .toString(2)
        .padStart(32, "0");
  }

  num = parseInt(num, 2);
  while (num > 0) {
    dec = (num % 10).toString() + dec;
    num = Math.floor(num / 10);
  }

  return dec;
};

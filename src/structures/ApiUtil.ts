import { NextFunction, Request, Response } from "express";
import { ApiAccess, ApplicationData, Applications, Raindrop } from "./Database";
import ms from "ms";

export const VisitCache = new Map<string, number>();

export class ApiManager {
  constructor() {}

  public pipe(options: { auth: boolean; limit: number; time: string; pts?: number }) {
    return async function (req: Request, res: Response, next: NextFunction): Promise<any> {
      const rl = manager.RateLimit(req.ip, options.limit, options.time, options.pts);
      if (rl) return res.json(rl).status(418);

      if (options.auth) {
        const authenticated = await manager.AuthenticateApi(req.headers.authorization);
        if (authenticated) {
          let apdata = await Applications.fetch({ 'data.id': authenticated });
          (req as ExtendedApiRequest).application = apdata?.data;
        } else {
          return res.json({ error: true, message: `There's a problem with the authentication!` });
        }
      }
      return next();
    };
  }

  public async AuthenticateApi(token?: string): Promise<Raindrop | false> {
    if (!token) return false;
    const raw = await ApiAccess.fetch({ "data.token": token });
    if (!raw) return false;
    return raw.data.applicationId;
  }

  public RateLimit(id: string, limit: number, time: string, points?: number) {
    if(limit === 0) limit = 999999^9
    let existing = VisitCache.get(id);
    if (existing) {
      existing = existing + (points ?? 1);
    } else {
      existing = points ?? 1;
    }
    if (existing > limit) {
      return {
        error: true,
        message: `Rate limited! You exceeded the rate limit of ${limit} points per ${ms(time)}ms`,
      }
    }
    VisitCache.set(id, existing);
    setTimeout(() => {
      let existing = VisitCache.get(id);
      if (existing) {
        existing = existing - (points ?? 1);
      }
    }, ms(time));
    return false;
  }
}

export const manager = new ApiManager();

export interface ExtendedApiRequest extends Request {
  application?: ApplicationData;
}

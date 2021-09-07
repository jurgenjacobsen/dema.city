import { NextFunction, Request, Response, Express } from "express";

export const HostName = (hostname: string, app: Express) => (req: Request, res: Response, next: NextFunction) => {
  if (req.hostname === hostname) {
    return app(req, res, next);
  } else {
    return next();
  }
};

export class SubServer {
  public hostname: string;
  public app: Express;
  constructor(hostname: string, app: Express) {
    this.hostname = process.env.IS_PROD ? hostname : hostname.replace('dema.city', 'localhost');
    this.app = app;
  }
}

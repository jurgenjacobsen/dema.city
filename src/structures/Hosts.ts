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
  public www: boolean;
  constructor(hostname: string, app: Express, www?: boolean) {
    this.hostname = process.env.IS_PROD ? hostname : hostname.replace('dema.city', 'localhost');
    this.app = app;
    this.www = www ?? false;
  }
}

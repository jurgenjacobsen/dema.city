import { NextFunction, Request, Response, Express } from "express";

export const HostName =
  (hostname: string, app: Express) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (req.hostname === hostname) {
      return app(req, res, next);
    } else {
      return next();
    }
  };

export class SubServer {
  public hostname: string;
  public server: Express;
  public www: boolean;
  public status: SubServerStatus;
  constructor(options: { hostname: string; server: Express; www?: boolean; status?: SubServerStatus }) {
    this.hostname = process.env.IS_PROD ? options.hostname : options.hostname.replace("dema.city", "localhost");
    this.server = options.server;
    this.www = options.www ?? false;
    this.status = options.status ?? "OFFLINE";
  }
}

export type SubServerStatus = "OFFLINE" | "ONLINE" | "MAINTENANCE" | "CONSTRUCTION";

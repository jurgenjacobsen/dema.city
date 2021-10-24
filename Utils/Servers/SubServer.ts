import { Express } from "express";

export class SubServer {
  public hostname: string;
  public www: boolean;
  public app: Express;
  public status: SubServerStatus;
  public bannedCountries?: Array<string>;
  constructor(data: { hostname: string, www: boolean, app: Express, status: SubServerStatus, bannedCountries?: Array<string> }) {
    this.hostname = process.env.IS_PROD ? data.hostname : data.hostname.replace(/dema.city/g, 'localhost');
    this.www = data.www;
    this.app = data.app;
    this.status = data.status;
    this.bannedCountries = data.bannedCountries;
  }
}

export type SubServerStatus = 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
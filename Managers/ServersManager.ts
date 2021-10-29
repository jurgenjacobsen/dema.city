import express, { Express, Request } from "express";
import { readdirSync } from "fs";
import { SubServer } from "../Utils/Servers/SubServer";
import { renderFile } from "ejs";
import bodyParser from "body-parser";

import expressip from "express-ip";
import path from "path";
import Collection from "@discordjs/collection";

export class ServersManager {
  public list = new Collection<string, SubServer>();
  constructor(server: Express) {
    let serversDir = path.resolve("./lib/Servers");

    for (let folder of readdirSync(serversDir)) {
      const { server }: { server: SubServer } = require(serversDir + "/" + folder + "/app");
      this.list.set(server.hostname, server);

      let app = server.app;

      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
      app.use(bodyParser.urlencoded({ extended: true }));

      app.set("views", path.resolve("./Views"));
      app.engine("html", renderFile);
      app.set("view engine", "ejs");
    }

    server.use(expressip().getIpInfoMiddleware);

    server.use((req: any, res, next) => {
      let sub = this.list.find((s) => s.hostname === req.hostname || `www.${s.hostname}` === req.hostname);
      let app = sub?.app;

      if (app) {
        if (req.ipInfo && !req.ipInfo.error) {
          if (sub?.bannedCountries) {
            if (sub.bannedCountries.includes(req.ipInfo.country)) return res.send(`You can not access this website from your country!`);
          }
        }
      }

      if (sub) {
        return sub.app(req, res, next);
      } else {
        return next();
      }
    });
  }
}

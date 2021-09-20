import express from "express";
import path from "path";
import dotenv from "dotenv";
import Greenlock from "greenlock-express";
import Socket from "socket.io";
import Cors from "cors";
import Morgan from "morgan";

import { Bot } from "./Bot/Bot";
import { WS } from "./ws/Server";
import { readdirSync } from "fs";
import { createServer } from "http";
import { HostName, SubServer } from "./Structures/Hosts";
import { print } from "./Structures/Util";
import { renderFile } from "ejs";
import Collection from "@discordjs/collection";

dotenv.config();

export const Servers = new Collection<string, SubServer>();
const Server = express();
const HttpServer = createServer(Server);

Bot.application?.fetch();

let IO = new Socket.Server();

const morgan = Morgan('[:date[clf]] :method :req["host"] :url :status :response-time ms - :res[content-length]', {
  skip: (req, res) => {
    return res.statusCode > 400 && req.headers.host !== 'assets';
  }
});

const cors = Cors({
  origin: (origin, cb) => {
    return cb(null, true);
  },
});

Server.use(morgan);

for (const file of readdirSync(path.join(__dirname, "./Servers"))) {
  const { server }: { server: SubServer } = require(path.join(__dirname, "./Servers/") + file);
  const app = server.server;
  app.use(cors);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.set("views", path.join(__dirname, "../views"));
  app.engine("html", renderFile);
  app.set("view engine", "ejs");

  Server.use(HostName(server.hostname, app));
  if (server.www) {
    Server.use(HostName(`www.${server.hostname}`, app));
  }
  Servers.set(server.hostname, server);
}

Server.get("*", (req, res) => res.sendStatus(400));

if (process.env.IS_PROD) {
  print("Production Mode");
  Greenlock.init({
    packageRoot: path.join(__dirname, "../"),
    maintainerEmail: process.env.MAINTAINER_EMAIL,
    configDir: "./greenlock",
    cluster: false,
  }).ready((glx: any) => {
    IO = new Socket.Server(glx.httpsServer());
    glx.serveApp(Server);
    print(`Server Online on: https://dema.city`);
  });
} else {
  print("Development Mode");
  IO = new Socket.Server(HttpServer);
  HttpServer.listen(process.env.PORT, () => {
    print(`Server Online on port: http://localhost:${process.env.PORT}`);
  });
}

WS(IO);

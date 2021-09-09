import express, { Request } from "express";
import path from "path";
import dotenv from "dotenv";
import Greenlock from "greenlock-express";
import Socket from "socket.io";
import Cors from 'cors';
import Morgan from 'morgan';

import { WS } from './ws/Server';
import { readdirSync } from "fs";
import { createServer } from "http";
import { HostName, SubServer } from "./structures/Hosts";
import { print } from "./structures/Util";

dotenv.config();

const Server = express();
const HttpServer = createServer(Server);

let IO = new Socket.Server();


let morgan = Morgan('[:date[clf]] :method :referrer :remote-addr :status - ":user-agent"', {
  skip: (req, res) => res.statusCode < 400,
});

let cors = Cors({origin: (origin, cb) => {
  if(!process.env.IS_PROD) return cb(null, true);
  if(origin?.includes('dema.city')) {
    cb(null, true)
  } else {
    cb(new Error('Not allowed by CORS'))
  }
}});

for (const file of readdirSync(path.join(__dirname, "./servers"))) {
  const { server }: { server: SubServer } = require(path.join(__dirname, "./servers/") + file);
  server.app.use(morgan);
  server.app.use(cors);
  server.app.use(express.json());
  server.app.use(express.urlencoded({ extended: true }));
  server.app.set('view engine', 'ejs');
  Server.use(HostName(server.hostname, server.app));
  if(server.www) {
    Server.use(HostName(`www.${server.hostname}`, server.app));
  }
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
    print(`Listening on port: ${process.env.PORT}`);
  });
} else {
  print("Development Mode");
  IO = new Socket.Server(HttpServer);
  HttpServer.listen(process.env.PORT, () => {
    print(`Listening on port: ${process.env.PORT}`);
  });
}

WS(IO);
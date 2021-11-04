import express from "express";
import dotenv from "dotenv";
import Greenlock from "greenlock-express";
import path from "path";

dotenv.config();

export const MongoData = {
  uri: process.env.MONGO_URI as string,
  name: process.env.MONGO_DB as string,
  user: process.env.MONGO_USER as string,
  pass: process.env.MONGO_PASS as string,
};

import { createServer } from "http";
import { ServersManager } from "./Managers/ServersManager";
import { UsersManager } from "./Managers/UsersManager";
import { PostManager } from "./Managers/PostManager";

export const Server = express();
export const Servers = new ServersManager(Server);
export const HttpServer = createServer(Server);

export const Blog = new PostManager();
export const Users = new UsersManager();

Server.get("*", (req, res) => {
  return res.sendStatus(400);
});

if (process.env.IS_PROD) {
  Greenlock.init({
    packageRoot: path.join(__dirname, "../"),
    maintainerEmail: process.env.MAINTAINER_EMAIL,
    configDir: "./greenlock",
    cluster: false,
  }).ready((glx: any) => {
    glx.serveApp(Server);
    console.log(`Server Online on: https://dema.city`);
  });
} else {
  HttpServer.listen(process.env.PORT, () => {
    return console.log(`Server Online on port: http://localhost:${process.env.PORT}`);
  });
}
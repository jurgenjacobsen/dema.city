import express from "express";
import { SubServer } from "../Structures/Hosts";

const app = express();

app.get("/", (req, res) => {
  res.sendStatus(200);
});

/*app.get("/article/:id", (req, res) => {

});*/

export const server = new SubServer({
  hostname: "news.dema.city",
  server: app,
  status: "MAINTENANCE",
});

import express from "express";
import path from "path";
import { readdirSync } from "fs";
import { SubServer } from "../Structures/Hosts";
import { cdn } from "../Structures/Util";

const app = express();

const documentations: string[] = [];

for (const folder of readdirSync(path.join(__dirname, "../../docs/"))) {
  if (!folder.endsWith(".ejs")) {
    const name = folder.replace(/ /g, "-");
    app.use(`/${name}`, express.static(path.join(__dirname, `../../docs/${folder}`)));
    documentations.push(name);
  }
}

app.get("/", (req, res) => {
  res.render(path.join(__dirname, "../../docs/index.ejs"), {
    documentations: documentations,
    cdn: cdn(req),
  });
});

export const server = new SubServer({
  hostname: "docs.dema.city",
  server: app,
  www: true,
  status: "ONLINE",
});

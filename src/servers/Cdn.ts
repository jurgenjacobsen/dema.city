import express from "express";
import path from "path";
import { SubServer } from "../Structures/Hosts";

const app = express();

app.use("/images", express.static(path.join(__dirname, `../../assets/images`)));
app.use("/audios", express.static(path.join(__dirname, `../../assets/audio`)));
app.use("/videos", express.static(path.join(__dirname, `../../assets/videos`)));
app.use("/styles", express.static(path.join(__dirname, `../../assets/styles`)));
app.use("/scripts", express.static(path.join(__dirname, `../../assets/scripts`)));
app.use("/icons", express.static(path.join(__dirname, `../../assets/icons`)));

app.get("/", (req, res) => {
  res.sendStatus(200);
});

export const server = new SubServer({
  hostname: "cdn.dema.city",
  server: app,
  status: "ONLINE",
});

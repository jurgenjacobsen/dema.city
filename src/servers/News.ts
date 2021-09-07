import express from "express";
import { SubServer } from "../structures/Hosts";

const app = express();

app.get("/", (req, res) => {
  res.redirect('https://youtube.com');
});

export const server = new SubServer("news.dema.city", app);

import express from 'express';
import { News } from '../structures/Database';
import { SubServer } from '../structures/Hosts';

const app = express();

app.get("/news", async (req, res) => {
  let data = await News.list();
  if(!data) return res.json([]);
  return res.json(data.map((d) => d.data));
});

export const server = new SubServer("api.dema.city", app);

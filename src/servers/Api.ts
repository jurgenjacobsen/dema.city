import express from "express";
import { News } from "../Structures/Database";
import { SubServer } from "../Structures/Hosts";
import { ExtendedApiRequest, PipeApi } from "../Structures/Util";

const app = express();

app.get(
  "/news",
  PipeApi({
    auth: false,
    limit: 300,
    time: "10m",
    points: 1,
  }),
  async (req, res) => {
    const data = await News.list().then((n) => n?.map((y) => y.data));
    if (!data) return res.json([]);
    return res.json(data);
  }
);

app.post(
  "/application",
  PipeApi({
    auth: true,
    limit: 150,
    time: "5m",
    points: 5,
  }),
  async (req: ExtendedApiRequest, res) => {
    res.json(req.application);
  }
);

export const server = new SubServer({
  hostname: "api.dema.city",
  server: app,
  status: "MAINTENANCE",
});

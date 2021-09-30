import express from "express";
import { News } from "../Structures/Database";
import { SubServer } from "../Structures/Hosts";
import { ExtendedApiRequest } from "../Structures/ApiUtil";
import * as TOPGGG_SDK from "@top-gg/sdk";
import { Bot } from "../Bot/Bot";
import { TextChannel } from "discord.js";
import { ApiManager } from "../Structures/ApiUtil";

const app = express();
const topWebhook = new TOPGGG_SDK.Webhook(process.env.TOPGG_AUTH);

const manager = new ApiManager();
const mp = manager.pipe;

app.get("/news", mp({ auth: false, limit: 300, time: "10m", pts: 1 }), async (req, res) => {
  const data = await News.list().then((n) => n?.map((y) => y.data));
  if (!data) return res.json([]);
  return res.json(data);
});

app.get("/application", mp({ auth: true, limit: 150, time: "5m", pts: 5 }), async (req: ExtendedApiRequest, res) => {
  return res.json(req.application);
});

app.post("/application/edit", mp({ auth: true, limit: 100, time: "10m", pts: 10 }), (req, res) => {
  console.log(req.body);
  return res.status(200);
});

const nico = express.Router();
nico.post(
  "/vote",
  topWebhook.listener((vote) => {
    if (vote.guild !== "465938334791893002") return;

    const member = Bot.guilds.cache.get(vote.guild)?.members.cache.get(vote.user);

    if (!member) return;

    member.roles
      .add("793163223867719742")
      .catch((err) => {
        const channel = Bot.channels.cache.get(`840045583028715541`) as TextChannel;
        if (!channel) return console.log(err);
        channel.send({ content: err }).catch(() => {});
      })
      .then(() => {
        setTimeout(() => member?.roles.remove("793163223867719742"), 10 * 60 * 1000);
      });
  })
);
app.use('/nico', nico);

export const server = new SubServer({
  hostname: "api.dema.city",
  server: app,
  status: "MAINTENANCE",
});

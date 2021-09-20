import express from "express";
import { News } from "../Structures/Database";
import { SubServer } from "../Structures/Hosts";
import { ExtendedApiRequest, PipeApi } from "../Structures/Util";
import * as TOPGGG_SDK from '@top-gg/sdk';
import { Bot } from "../Bot/Bot";
import { TextChannel } from "discord.js";

const app = express();
const topWebhook = new TOPGGG_SDK.Webhook(process.env.TOPGG_AUTH);

app.post('/vote', topWebhook.listener((vote) => {
  
  if(vote.guild !== '465938334791893002') return;

  let member = Bot.guilds.cache.get(vote.guild)?.members.cache.get(vote.user);

  if(!member) return;

  member.roles.add('793163223867719742').catch((err) => {
    let channel = Bot.channels.cache.get(`840045583028715541`) as TextChannel;
    if(!channel) return console.log(err);
    channel.send({content: err}).catch(() => {});
  }).then(() => {
    setTimeout(() => member?.roles.remove('793163223867719742'), 10 * 60 * 1000);
  }); 

}));

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

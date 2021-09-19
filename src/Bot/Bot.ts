import { Client, ClientOptions, Intents } from "discord.js";
import dotenv from "dotenv";
import { Commands } from "dsc.cmds";
import { EventHandler } from "dsc.events";
import path from "path/posix";

dotenv.config();

export class BotClient extends Client {
  public commands: Commands;
  public events: EventHandler;
  constructor(options: ClientOptions) {
    super(options);

    this.commands = new Commands({ bot: this, dir: path.join(__dirname, "./Commands"), devs: [`292065674338107393`] });

    this.events = new EventHandler({ bot: this, dir: path.join(__dirname, "./Events") });

    this.login(process.env.DISCORD_CLIENT_TOKEN);
  }
}

export const Bot = new BotClient({
  partials: ["CHANNEL", "GUILD_MEMBER", "MESSAGE", "REACTION", "USER"],
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_WEBHOOKS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES],
  presence: {
    activities: [
      {
        name: "dema.city",
        type: "WATCHING",
        url: "https://dema.city",
      },
    ],
    status: "dnd",
  },
});

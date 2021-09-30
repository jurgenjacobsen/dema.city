import { EventOptions } from "dsc.events";
import { BotClient } from "../Bot";
import { ApplicationCommandData, ApplicationCommandPermissions, Collection, Guild } from "discord.js";
import { print, wait } from "../../Structures/MainUtil";

import fs from "fs";
import path from "path";

export const event: EventOptions = {
  name: "ready",
  once: true,
  run: async (bot: BotClient) => {
    await wait(500);

    const commands: Collection<string, { cmd: ApplicationCommandData; permissions?: ApplicationCommandPermissions[]; exclusive?: boolean }> = new Collection();

    const guilds = bot.guilds.cache;

    for (const file of fs.readdirSync(path.join(__dirname, "../Commands"))) {
      const { data, permissions, exclusive } = require(`${path.join(__dirname, "../Commands")}/${file}`);
      commands.set(data.name, {
        cmd: data,
        permissions: permissions,
        exclusive: exclusive ? true : false,
      });
    }

    guilds.forEach((guild) => {
      commands.forEach(async (c) => {
        if (c.exclusive && guild.id !== "782722663549763585") return;

        const cmd = (await guild.commands.set([c.cmd])).first();

        if (c.permissions) {
          cmd?.permissions.set({ permissions: c.permissions });
        }
      });
    });

    print(`Bot is ready!`);
  },
};

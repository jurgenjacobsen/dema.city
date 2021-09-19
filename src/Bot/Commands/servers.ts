import { ApplicationCommandData, CommandInteraction, MessageEmbed } from "discord.js";
import { CommandOptions } from "dsc.cmds";
import { Servers } from "../../MainServer";
import { BotClient } from "../Bot";

export const cmd: CommandOptions = {
  name: "servers",
  run: async (bot: BotClient, interaction: CommandInteraction) => {
    const embed = new MessageEmbed().setAuthor("Dema City Servers Statuses").setColor("#1c1c1c");

    Servers.forEach((server) => {
      embed.addField(server.hostname, `Status: *${server.status}*`);
    });

    return await interaction.reply({
      embeds: [embed],
    });
  },
};

export const data: ApplicationCommandData = {
  name: "servers",
  description: `All servers statuses`,
  defaultPermission: true,
};

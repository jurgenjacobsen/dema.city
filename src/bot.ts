import colors from 'colors';
import { Client, ClientOptions, Message, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from 'discord.js';

import { print } from './utils';
class Bot extends Client {
  constructor(options: ClientOptions) {
    super(options);

    this.login(process.env.DISCORD_TOKEN);
  }
}

const bot = new Bot({
  partials: ['CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION', 'USER'],
  intents: [
    'DIRECT_MESSAGES',
    'DIRECT_MESSAGE_REACTIONS',
    'DIRECT_MESSAGE_TYPING',
    'GUILDS',
    'GUILD_BANS',
    'GUILD_INTEGRATIONS',
    'GUILD_INVITES',
    'GUILD_MEMBERS',
    'GUILD_MESSAGES',
    'GUILD_MESSAGE_REACTIONS',
    'GUILD_MESSAGE_TYPING',
    'GUILD_PRESENCES',
    'GUILD_VOICE_STATES',
    'GUILD_WEBHOOKS',
  ],
  presence: {
    status: 'invisible',
  },
  allowedMentions: {
    parse: ['roles', 'users'],
    repliedUser: true,
  },
});

bot.on('ready', async () => {
  print(`${colors.gray('[BOT]')} Ready`);
});

bot.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
    switch (interaction.commandName) {
      case 'todo':
        {
          let title = interaction.options.getString('title', true);
          let description = interaction.options.getString('description', true);

          let eta = interaction.options.getString('eta');
          let assign = interaction.options.getMentionable('assign');
          let notify = interaction.options.getString('notify') ? interaction.options.getString('notify') === 'TRUE' : false;

          let row = new MessageActionRow().addComponents([new MessageButton().setCustomId('TODO_CLAIM').setLabel('Atribuir').setStyle('PRIMARY')]);

          let embed = new MessageEmbed().setColor('#1c1c1c').setAuthor(title).setImage('https://i.imgur.com/EbCa9W7.png').setDescription(`
        **Atribuído**: ${assign ?? '*Ninguém*'}
        **Data limite**: ${eta ?? '*Indefinida*'}\n
        **Descrição**: ${description}
        `);

          if (assign) {
            embed.setFooter(`${(assign as any).id}`);
          }

          if (assign && notify) {
            interaction.reply({
              content: `${assign}`,
              embeds: [embed],
              components: [row],
            });
          } else {
            interaction.reply({
              embeds: [embed],
              components: [row],
            });
          }
        }
        break;
    }
  } else if (interaction.isButton()) {
    if (interaction.customId === 'TODO_CLAIM') {
      let old_embed = interaction.message.embeds[0] as MessageEmbed;
      let member = interaction.guild?.members.cache.get(interaction.user.id);
      if (!(old_embed.footer?.text === interaction.user.id) && !member?.roles.cache.find((r) => r.id === old_embed.footer?.text)) return;

      let embed = new MessageEmbed(old_embed).setColor('#FEE75C').setFooter(interaction.user.id);

      await interaction.deferUpdate();

      (interaction.message as Message).edit({
        embeds: [embed],
        components: [new MessageActionRow().addComponents([new MessageButton().setCustomId('TODO_END').setLabel('Finalizar').setStyle('PRIMARY')])],
      });
    } else if (interaction.customId === 'TODO_END') {
      let old_embed = interaction.message.embeds[0] as MessageEmbed;

      if (old_embed.footer?.text !== interaction.user.id) return;

      let embed = new MessageEmbed(old_embed).setColor('#57F287').setFooter(`Finalizado! ${interaction.user.tag} entregou este à fazer!`);

      await interaction.deferUpdate();

      (interaction.message as Message).edit({
        embeds: [embed],
        components: [],
      });
    } else if (interaction.customId === 'BUGHUNTER_INTEREST') {
      interaction.deferUpdate();
      interaction.user
        .send({
          content: `Obrigado por se inscrever para o time de *bughunters*! Você receberá uma resposta em até 3 dias.`,
        })
        .catch(() => {});

      let ch = bot.channels.cache.get('784969991635468288') as TextChannel;

      ch.send({
        content: `${interaction.user.toString()} se inscreveu para Bughunter!`,
      });
    } else if (interaction.customId.startsWith('COLLECT_ROLE_')) {
      interaction.deferUpdate();

      let member = interaction.guild?.members.cache.get(interaction.user.id);
      let roles = interaction.guild?.roles.cache
        .map((r) => {
          let isCat = r.name.includes('───');
          return { p: r.position, roleID: r.id, name: r.name, isCat };
        })
        .sort((a, b) => a.p - b.p);

      let roleID = interaction.customId.replace('COLLECT_ROLE_', '').trim();
      let role = roles?.find((r) => r.roleID === roleID);
      let ntf = roles?.find((r) => r.roleID === '877658804144209971');

      if (role && ntf && ntf.p > role.p) {
        member?.roles.add(ntf.roleID);
      }

      if (member?.roles.cache.has(roleID)) {
        member.roles.remove(roleID);
      } else {
        member?.roles.add(roleID);
      }
    }
  }
});

export { bot };

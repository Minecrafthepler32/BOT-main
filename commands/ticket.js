const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} = require('discord.js');

const { isOwner } = require('../utils/permissions');
const ticketStore = require('../utils/ticketStore');

const TICKET_TYPES = [
  {
    label: 'Support',
    description: 'Get help with an issue on Discord / Script',
    value: 'support',
  },
  {
    label: 'User Report',
    description: 'Report a user in the discord / in game',
    value: 'user_report',
  },
  {
    label: 'Partnership',
    description: 'Partnership inquiry',
    value: 'partnership',
  },
  {
    label: 'Purchase',
    description: 'Manual Purchases',
    value: 'purchase',
  },
];

module.exports = {
  name: 'ticket',
  aliases: ['tickets'],
  description: 'Ticket system — setup panel or manage settings',

  async execute(message, args, client) {
    // ── ?ticket setup ──────────────────────────────────────────────────────
    if (args[0] === 'setup') {
      if (!isOwner(message.member) && !message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.reply({ content: 'You need Administrator permissions to run setup.' });
      }

      const store = ticketStore.load();

      const channels = message.mentions.channels;
      const channelArr = [...channels.values()];

      if (channelArr.length < 3) {
        return message.reply({
          content: [
            'Please mention all 3 channels/categories in order:',
            '`?ticket setup #ticket-channel #ticket-category #ticket-logs`',
            '',
            '> **#ticket-channel** — where the panel is posted',
            '> **#ticket-category** — category where ticket channels are created',
            '> **#ticket-logs** — where logs are sent',
          ].join('\n'),
        });
      }

      const [panelChannel, ticketCategory, logsChannel] = channelArr;

      if (ticketCategory.type !== ChannelType.GuildCategory) {
        return message.reply({ content: 'The second channel must be a **category**.' });
      }

      store.panelChannelId = panelChannel.id;
      store.categoryId = ticketCategory.id;
      store.logsChannelId = logsChannel.id;
      ticketStore.save(store);

      const panelEmbed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setTitle('Script And Server Support')
        .setDescription(
          'Please select a category below to open a support ticket before creating your ticket, make sure you have all the necessary information and details ready to help us assist you as quickly as possible..'
        );

      const whatEmbed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setTitle('What are Tickets for?')
        .setDescription(
          'Help & Assistance\n Sales & Purchase inquiry\n Report a Member\n Partnerships & Sponsorships\n Report an Issue'
        );

      const selectRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('ticket_type_select')
          .setPlaceholder('Select a ticket type...')
          .addOptions(
            TICKET_TYPES.map((t) => ({
              label: t.label,
              description: t.description,
              value: t.value,
            }))
          )
      );

      await panelChannel.send({ embeds: [panelEmbed, whatEmbed], components: [selectRow] });

      return message.reply({
        content: [
          'Ticket panel posted.',
          `Panel -> ${panelChannel}`,
          `Category -> **${ticketCategory.name}**`,
          `Logs -> ${logsChannel}`,
        ].join('\n'),
      });
    }

    // ── ?ticket (no args) — show current config ────────────────────────────
    const store = ticketStore.load();
    if (!store.panelChannelId) {
      return message.reply({
        content: 'No ticket system set up yet.\nUse `?ticket setup #channel #category #logs`',
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('Ticket System Config')
      .addFields(
        { name: 'Panel Channel', value: `<#${store.panelChannelId}>`, inline: true },
        { name: 'Category', value: `<#${store.categoryId}>`, inline: true },
        { name: 'Logs Channel', value: `<#${store.logsChannelId}>`, inline: true }
      );

    return message.reply({ embeds: [embed] });
  },
};

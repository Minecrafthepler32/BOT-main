const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require('discord.js');

const { isOwner } = require('../utils/permissions');
const ticketStore = require('../utils/ticketStore');

module.exports = {
  name: 'removeticket',
  aliases: ['ticketremove', 'deleteticket'],
  description: 'Completely remove the ticket system and all ticket channels',

  async execute(message, args, client) {
    if (!isOwner(message.member) && !message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply({ content: 'You need Administrator permissions to remove the ticket system.' });
    }

    const store = ticketStore.load();

    if (!store.panelChannelId && !store.categoryId) {
      return message.reply({ content: 'No ticket system is set up.' });
    }

    const confirmEmbed = new EmbedBuilder()
      .setColor(0xff3333)
      .setTitle('Remove Ticket System')
      .setDescription(
        [
          'This will **permanently**:',
          '• Delete all open ticket channels in the category',
          '• Remove the ticket panel message',
          '• Clear all ticket system settings',
          '',
          'Are you sure?',
        ].join('\n')
      );

    const confirmRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('confirm_remove_ticket')
        .setLabel('Yes, Remove Everything')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('cancel_remove_ticket')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary)
    );

    const confirmMsg = await message.reply({
      embeds: [confirmEmbed],
      components: [confirmRow],
    });

    const collector = confirmMsg.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 60_000,
      max: 1,
    });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'cancel_remove_ticket') {
        await interaction.update({
          content: 'Cancelled — ticket system unchanged.',
          embeds: [],
          components: [],
        });
        return;
      }

      await interaction.update({
        content: 'Removing ticket system...',
        embeds: [],
        components: [],
      });

      const logsChannelId = store.logsChannelId;
      let deletedCount = 0;
      const errors = [];

      if (store.categoryId) {
        const category = message.guild.channels.cache.get(store.categoryId);
        if (category) {
          const children = message.guild.channels.cache.filter(
            (ch) => ch.parentId === store.categoryId
          );
          for (const [, ch] of children) {
            try {
              await ch.delete('Ticket system removed');
              deletedCount++;
            } catch (e) {
              errors.push(ch.name);
            }
          }
          try {
            await category.delete('Ticket system removed');
          } catch (e) {
            errors.push(category.name);
          }
        }
      }

      ticketStore.clear();

      if (logsChannelId) {
        const logsChannel = message.guild.channels.cache.get(logsChannelId);
        if (logsChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor(0xff3333)
            .setTitle('ticket system removed')
            .addFields(
              { name: 'Removed by', value: `${message.author.tag} (${message.author.id})`, inline: true },
              { name: 'Channels deleted', value: String(deletedCount), inline: true },
              { name: 'At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
            );

          try { await logsChannel.send({ embeds: [logEmbed] }); } catch (_) {}
        }
      }

      const resultLines = [
        `Ticket system removed.`,
        `Deleted **${deletedCount}** ticket channel(s) + category.`,
      ];
      if (errors.length) resultLines.push(`Could not delete: ${errors.join(', ')}`);

      await interaction.editReply({ content: resultLines.join('\n') });
    });

    collector.on('end', (collected) => {
      if (collected.size === 0) {
        confirmMsg.edit({ content: 'Timed out — no changes made.', embeds: [], components: [] }).catch(() => {});
      }
    });
  },
};

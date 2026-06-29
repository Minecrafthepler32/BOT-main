const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ticketStore = require('../utils/ticketStore');
const { isSupport, isStaff, isOwner } = require('../utils/permissions');

module.exports = {
  name: 'claim',
  description: 'Claim the current ticket',

  async execute(message) {
    const store = ticketStore.load();
    const ticketData = store.openTickets[message.channel.id];

    if (!ticketData) {
      return message.reply({ content: 'This command can only be used inside a ticket channel.' });
    }

    const member = message.member;
    if (!isSupport(member) && !isStaff(member) && !isOwner(member) &&
        !member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply({ content: 'You need Support or higher to claim tickets.' });
    }

    if (ticketData.claimedBy) {
      return message.reply({
        content: ticketData.claimedBy === message.author.id
          ? 'You already claimed this ticket.'
          : `This ticket is already claimed by <@${ticketData.claimedBy}>.`,
      });
    }

    ticketData.claimedBy = message.author.id;
    ticketStore.save(store);

    await message.channel.setName(`${message.channel.name}-claimed`).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setDescription(`Ticket claimed by ${message.author}.`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    if (store.logsChannelId) {
      const logsChannel = message.guild.channels.cache.get(store.logsChannelId);
      if (logsChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor(0x000000)
          .setTitle('ticket claimed')
          .addFields(
            { name: 'Channel', value: message.channel.name, inline: true },
            { name: 'Claimed by', value: message.author.tag, inline: true },
            { name: 'At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
          )
          .setTimestamp();
        await logsChannel.send({ embeds: [logEmbed] }).catch(() => {});
      }
    }
  },
};

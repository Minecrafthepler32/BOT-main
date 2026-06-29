const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ticketStore = require('../utils/ticketStore');
const { isSupport, isStaff, isOwner } = require('../utils/permissions');

module.exports = {
  name: 'unclaim',
  description: 'Unclaim the current ticket',

  async execute(message) {
    const store = ticketStore.load();
    const ticketData = store.openTickets[message.channel.id];

    if (!ticketData) {
      return message.reply({ content: 'This command can only be used inside a ticket channel.' });
    }

    const member = message.member;
    if (!isSupport(member) && !isStaff(member) && !isOwner(member) &&
        !member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply({ content: 'You need Support or higher to unclaim tickets.' });
    }

    if (!ticketData.claimedBy) {
      return message.reply({ content: 'This ticket has not been claimed.' });
    }

    if (ticketData.claimedBy !== message.author.id && !isStaff(member) && !isOwner(member)) {
      return message.reply({ content: 'You can only unclaim a ticket you claimed yourself.' });
    }

    delete ticketData.claimedBy;
    ticketStore.save(store);

    const newName = message.channel.name.replace(/-claimed$/, '');
    await message.channel.setName(newName).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setDescription(`Ticket unclaimed by ${message.author}.`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    if (store.logsChannelId) {
      const logsChannel = message.guild.channels.cache.get(store.logsChannelId);
      if (logsChannel) {
        const logEmbed = new EmbedBuilder()
          .setColor(0x000000)
          .setTitle('ticket unclaimed')
          .addFields(
            { name: 'Channel', value: message.channel.name, inline: true },
            { name: 'Unclaimed by', value: message.author.tag, inline: true },
            { name: 'At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
          )
          .setTimestamp();
        await logsChannel.send({ embeds: [logEmbed] }).catch(() => {});
      }
    }
  },
};

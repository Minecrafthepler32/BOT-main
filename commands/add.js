const { PermissionFlagsBits } = require('discord.js');
const ticketStore = require('../utils/ticketStore');
const { isSupport, isStaff, isOwner } = require('../utils/permissions');

module.exports = {
  name: 'add',
  description: 'Add a user to the current ticket',

  async execute(message, args) {
    const store = ticketStore.load();
    const ticketData = store.openTickets[message.channel.id];

    if (!ticketData) {
      return message.reply({ content: 'This command can only be used inside a ticket channel.' });
    }

    const member = message.member;
    if (!isSupport(member) && !isStaff(member) && !isOwner(member) &&
        !member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply({ content: 'You need Support or higher to add users to tickets.' });
    }

    const target = message.mentions.members.first();
    if (!target) {
      return message.reply({ content: 'Usage: `?add @user`' });
    }

    try {
      await message.channel.permissionOverwrites.edit(target.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
        AttachFiles: true,
      });
      return message.reply({ content: `${target.user.tag} has been added to the ticket.` });
    } catch (err) {
      return message.reply({ content: 'Failed to add user. Check bot permissions.' });
    }
  },
};

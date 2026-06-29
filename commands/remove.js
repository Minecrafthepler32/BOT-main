const { isSupport, isOwner } = require('../utils/permissions');

module.exports = {
  name: 'remove',
  description: 'Remove a user from the current ticket',

  async execute(message, args, client) {
    const member = message.member;

    if (!isSupport(member) && !isOwner(member)) {
      return message.reply({ content: 'You need at least the Support role to use this command.', allowedMentions: { repliedUser: false } });
    }

    const target = message.mentions.members.first();
    if (!target) {
      return message.reply({ content: 'Please mention the user to remove from this ticket.', allowedMentions: { repliedUser: false } });
    }

    try {
      // Use message.channel directly — no channel re-fetch, avoids the delay
      await message.channel.permissionOverwrites.delete(target);
      return message.reply({ content: `✅ Removed **${target.user.tag}** from the ticket.`, allowedMentions: { repliedUser: false } });
    } catch (err) {
      console.error('remove ticket error:', err);
      return message.reply({ content: 'Failed to remove that user from the ticket.', allowedMentions: { repliedUser: false } });
    }
  },
};

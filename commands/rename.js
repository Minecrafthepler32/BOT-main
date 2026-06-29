const { isSupport, isOwner } = require('../utils/permissions');

module.exports = {
  name: 'rename',
  description: 'Rename the current ticket channel',

  async execute(message, args, client) {
    const member = message.member;

    // Allow support and above (but not ?ticket setup — that's a separate command)
    if (!isSupport(member) && !isOwner(member)) {
      return message.reply({ content: 'You need at least the Support role to use this command.', allowedMentions: { repliedUser: false } });
    }

    if (!args[0]) {
      return message.reply({ content: 'Please provide a new name for the channel.', allowedMentions: { repliedUser: false } });
    }

    const newName = args.join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');

    if (!newName) {
      return message.reply({ content: 'Invalid channel name. Use letters, numbers, and hyphens only.', allowedMentions: { repliedUser: false } });
    }

    try {
      // Set the name directly — no need to re-fetch, avoids the delay
      await message.channel.setName(newName);
      return message.reply({ content: `✅ Channel renamed to **${newName}**.`, allowedMentions: { repliedUser: false } });
    } catch (err) {
      console.error('rename error:', err);
      return message.reply({ content: 'Failed to rename the channel.', allowedMentions: { repliedUser: false } });
    }
  },
};

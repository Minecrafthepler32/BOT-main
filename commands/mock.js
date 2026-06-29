const { mockedUsers } = require('../mockStore');
const { isStaffManager, isOwner } = require('../utils/permissions');

module.exports = {
  name: 'mock',
  description: 'Mock a user by turning their messages into webhook messages',

  async execute(message, args, client) {
    if (!isStaffManager(message.member)) {
      return message.reply('You do not have permission to use this command.');
    }

    const target = message.mentions.members.first();
    if (!target) {
      return message.reply('Please mention a user to mock. Usage: `?mock @user`');
    }

    // Only block self-mock for non-owners
    if (target.id === message.author.id && !isOwner(message.member)) {
      return message.reply('You cannot mock yourself.');
    }

    if (target.user.bot) {
      return message.reply('You cannot mock a bot.');
    }

    if (mockedUsers.has(target.id)) {
      return message.reply(`**${target.user.username}** is already being mocked.`);
    }

    const webhook = await message.channel.createWebhook({
      name: target.displayName,
      avatar: target.user.displayAvatarURL({ size: 256, extension: 'png' }),
      reason: `Mock command used by ${message.author.tag}`,
    });

    mockedUsers.set(target.id, {
      channelId: message.channel.id,
      webhook,
    });

    await message.delete().catch(() => {});
    await message.channel.send(`**${target.displayName}** is now being mocked in this channel.`);
  },
};

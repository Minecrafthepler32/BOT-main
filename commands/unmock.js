const { mockedUsers } = require('../mockStore');
const { isStaffManager } = require('../utils/permissions');

module.exports = {
  name: 'unmock',
  description: 'Stop mocking a user',

  async execute(message, args, client) {
    if (!isStaffManager(message.member)) {
      return message.reply('You do not have permission to use this command.');
    }

    const target = message.mentions.members.first();
    if (!target) {
      return message.reply('Please mention a user to unmock. Usage: `?unmock @user`');
    }

    if (!mockedUsers.has(target.id)) {
      return message.reply(`**${target.user.username}** is not currently being mocked.`);
    }

    const { webhook } = mockedUsers.get(target.id);
    await webhook.delete('Unmock command used').catch(() => {});
    mockedUsers.delete(target.id);

    await message.delete().catch(() => {});
    await message.channel.send(`**${target.displayName}** is no longer being mocked.`);
  },
};

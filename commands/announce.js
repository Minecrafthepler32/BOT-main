const { EmbedBuilder } = require('discord.js');
const { isStaffManager } = require('../utils/permissions');

module.exports = {
  name: 'announce',
  description: 'Send an announcement embed to a specified channel',

  // Usage: ?announce #channel Your message here
  async execute(message, args, client) {
    if (!isStaffManager(message.member)) {
      return message.reply('You do not have permission to use this command.');
    }

    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply('Please mention a channel. Usage: `?announce #channel Your message here`');
    }

    // Everything after the channel mention
    const content = args.slice(1).join(' ').trim();
    if (!content) {
      return message.reply('Please provide a message. Usage: `?announce #channel Your message here`');
    }

    const embed = new EmbedBuilder()
      .setDescription(content)
      .setColor(0x000000)
      .setTimestamp()
      .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) });

    await channel.send({ embeds: [embed] });
    await message.reply(`Announcement sent to ${channel}.`);
  },
};

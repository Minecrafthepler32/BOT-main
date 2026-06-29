const { removeEntry } = require('../utils/helpManager');
const { successEmbed, errorEmbed } = require('../utils/embeds');
const { isOwner } = require('../utils/permissions');

const NAMED_ROLES = ['owner', 'staff', 'trial', 'support', 'verified', 'public'];

module.exports = {
  name: 'helpremoverole',
  description: 'Remove text from a help role section',

  async execute(message, args, client) {
    if (!isOwner(message.member)) {
      return message.reply({
        embeds: [errorEmbed('Error', 'You do not have permission to use this command.')],
        allowedMentions: { repliedUser: false },
      });
    }

    const rawText = args.slice(1).join(' ');
    if (!rawText) {
      return message.reply({
        embeds: [errorEmbed('Error', 'Missing text.\n**Usage:** `:helpremoverole staff text`')],
        allowedMentions: { repliedUser: false },
      });
    }

    let roleKey, roleName;

    const mentionedRole = message.mentions.roles.first();
    if (mentionedRole) {
      roleKey = mentionedRole.id;
      roleName = mentionedRole.name;
    } else {
      const plain = args[0]?.toLowerCase();
      if (NAMED_ROLES.includes(plain)) {
        roleKey = plain;
        roleName = plain.charAt(0).toUpperCase() + plain.slice(1);
      } else {
        return message.reply({
          embeds: [errorEmbed('Error', 'Invalid role. Use: `owner`, `staff`, `trial`, `support`, `verified`, `public`')],
          allowedMentions: { repliedUser: false },
        });
      }
    }

    const removed = removeEntry(roleKey, rawText);
    if (!removed) {
      return message.reply({
        embeds: [errorEmbed('Error', `That text was not found in the **${roleName}** help list.`)],
        allowedMentions: { repliedUser: false },
      });
    }

    return message.reply({
      embeds: [successEmbed('Success', `Removed from the **${roleName}** help list.`)],
      allowedMentions: { repliedUser: false },
    });
  },
};

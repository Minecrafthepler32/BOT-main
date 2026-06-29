const { EmbedBuilder } = require('discord.js');

function formatEntries(entries) {
  return entries.join('\n') + '\n\u200b';
}

function helpEmbed(sections) {
  const embed = new EmbedBuilder()
    .setColor(0x000000)
    .setTimestamp()
    .setFooter({ text: 'Prefix: :  •  Use :help to view this menu' });

  const keys = Object.keys(sections);

  if (keys.length === 0) {
    embed.setTitle('Commands');
    embed.addFields({ name: '\u200b', value: 'No help entries added yet.' });
    return embed;
  }

  if (keys.length === 1) {
    const section = sections[keys[0]];
    embed.setTitle(section.name);
    embed.addFields({ name: '\u200b', value: formatEntries(section.entries) });
    return embed;
  }

  embed.setTitle('\u200b');
  for (const [key, section] of Object.entries(sections)) {
    if (!section.entries || section.entries.length === 0) continue;
    embed.addFields({ name: section.name, value: formatEntries(section.entries), inline: false });
  }

  return embed;
}

function successEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(0x000000)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

function errorEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(0x000000)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

module.exports = { successEmbed, errorEmbed, helpEmbed };

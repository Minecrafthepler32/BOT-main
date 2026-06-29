const { isStaffManager } = require('../utils/permissions');

module.exports = {
  name: 'nuke',
  description: 'Deletes all messages in the current channel by cloning and deleting it',

  async execute(message, args, client) {
    if (!isStaffManager(message.member)) {
      return message.reply('You do not have permission to use this command.');
    }

    const channel = message.channel;
    const position = channel.position;
    const parent = channel.parentId;
    const name = channel.name;
    const topic = channel.topic;
    const nsfw = channel.nsfw;
    const rateLimitPerUser = channel.rateLimitPerUser;
    const permissionOverwrites = [...channel.permissionOverwrites.cache.values()];

    // Clone the channel with same settings then delete original
    const newChannel = await channel.clone({
      name,
      topic,
      nsfw,
      rateLimitPerUser,
      parent,
      permissionOverwrites,
      reason: `Nuke command used by ${message.author.tag}`,
    });

    await newChannel.setPosition(position).catch(() => {});
    await channel.delete(`Nuke command used by ${message.author.tag}`);
    await newChannel.send('This channel has been nuked.');
  },
};

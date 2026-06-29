const { isStaffManager } = require('../utils/permissions');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'welcomeConfig.json');

module.exports = {
  name: 'removewelcome',
  description: 'Remove the welcome channel for this server',

  async execute(message, args, client) {
    if (!isStaffManager(message.member)) {
      return message.reply('You do not have permission to use this command.');
    }

    if (!fs.existsSync(CONFIG_PATH)) {
      return message.reply('No welcome channel is set for this server.');
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

    if (!config[message.guild.id]) {
      return message.reply('No welcome channel is set for this server.');
    }

    delete config[message.guild.id];
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

    await message.reply('Welcome messages have been disabled for this server.');
  },
};

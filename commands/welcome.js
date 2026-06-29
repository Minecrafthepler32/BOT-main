const { isStaffManager } = require('../utils/permissions');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'welcomeConfig.json');

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return {};
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function saveConfig(data) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
  name: 'welcome',
  description: 'Set the welcome channel for new member join messages',

  async execute(message, args, client) {
    if (!isStaffManager(message.member)) {
      return message.reply('You do not have permission to use this command.');
    }

    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply('Please mention a channel. Usage: `?welcome #channel`');
    }

    const config = loadConfig();
    config[message.guild.id] = channel.id;
    saveConfig(config);

    await message.reply(`Welcome messages will now be sent in ${channel}.`);
  },
};

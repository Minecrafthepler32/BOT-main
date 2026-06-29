const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { mockedUsers } = require('./mockStore');
const { handleTicketInteraction } = require('./utils/ticketHandler');

function loadWelcomeConfig() {
  const p = path.join(__dirname, 'welcomeConfig.json');
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.name, command);
  if (command.aliases) {
    for (const alias of command.aliases) {
      client.commands.set(alias, command);
    }
  }
}

const PREFIX = '?';

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// ── Interaction handler (tickets) ─────────────────────────────────────────────
client.on('interactionCreate', async (interaction) => {
  await handleTicketInteraction(interaction);
});

// ── Welcome event ─────────────────────────────────────────────────────────────
client.on('guildMemberAdd', async (member) => {
  const config = loadWelcomeConfig();
  const channelId = config[member.guild.id];
  if (!channelId) return;

  const channel = member.guild.channels.cache.get(channelId);
  if (!channel) return;

  const memberCount = member.guild.memberCount;

  const embed = new EmbedBuilder()
    .setAuthor({
      name: 'Welcome',
      iconURL: member.guild.iconURL({ dynamic: true }),
    })
    .setDescription(`**${member.user.username}** has joined the server`)
    .addFields({ name: 'Member count', value: memberCount.toLocaleString() })
    .setThumbnail(member.user.displayAvatarURL({ size: 256, dynamic: true }))
    .setColor(0x000000);

  await channel.send({ embeds: [embed] }).catch(console.error);
});

// ── Message handler ───────────────────────────────────────────────────────────
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Mock interception
  if (mockedUsers.has(message.author.id)) {
    const { channelId, webhook } = mockedUsers.get(message.author.id);

    if (message.channel.id === channelId) {
      if (!message.content.startsWith(PREFIX)) {
        let content = message.content || '\u200b';

        // If replying to someone, prepend a mention of who they replied to
        if (message.reference) {
          const repliedTo = await message.channel.messages
            .fetch(message.reference.messageId)
            .catch(() => null);
          if (repliedTo) {
            const preview = repliedTo.content
              ? repliedTo.content.slice(0, 50) + (repliedTo.content.length > 50 ? '...' : '')
              : '[attachment]';
            content = `> **${repliedTo.member?.displayName ?? repliedTo.author.username}**: ${preview}\n${content}`;
          }
        }

        await message.delete().catch(() => {});
        await webhook.send({
          content,
          username: message.member?.displayName ?? message.author.username,
          avatarURL: message.author.displayAvatarURL({ size: 256, extension: 'png' }),
          files: [...message.attachments.values()],
        }).catch(console.error);
        return;
      }
    }
  }

  // Command handling
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args, client);
  } catch (err) {
    console.error(err);
  }
});

client.login(process.env.DISCORD_TOKEN);
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');

const ROLE_IDS = {
  staff_manager: '1503781011648151733',
  staff:         '1503591897598529671',
  trial:         '1503591897598529669',
  support:       '1503591897598529670',
  verified:      '1503796042410491967',
};

const FUN_VERIFIED = [
  '- `?rps`  Play Rock Paper Scissors with the bot',
  '- `?flip`  Flip a coin',
  '- `?flipcoin`  Flip a coin',
  '- `?space`  Get info about the space station',
  '- `?dadjoke`  Get a random Dad joke',
  '- `?github [repository]`  Get info on a GitHub repository',
  '- `?cat`  Find some cute cat pictures',
  '- `?pug`  Find some cute pug pictures',
  '- `?itunes [song]`  Get info on a song',
  '- `?dog`  Find some cute dog pictures',
  '- `?pokemon [pokemon]`  Get info on Pokemon',
  '- `?norris`  Get a random Chuck Norris fact',
  '- `?covid`  Get COVID-19 stats',
];

const FUN_STAFF = [
  ...FUN_VERIFIED,
  '- `?poll [question] [choices]`  Start a poll (max 10 choices)',
];

const FUN_OWNER = [
  ...FUN_STAFF,
  '- `?roll`  Roll the dice (d4, d6, d8, d10, d12, d20, d100)',
  '- `?randomcolor`  Generates a random hex color with preview',
  '- `?dynoavatar`  Generates a Dyno-like avatar',
];

const UTILITY_VERIFIED = [
  '- `?afk`  Set an AFK status to display when you are mentioned',
  '- `?avatar`  Get a users avatar',
  '- `?remindme`  Set a reminder',
];

const UTILITY_SUPPORT = [
  ...UTILITY_VERIFIED,
  '- `?membercount`  Get the server member count',
  '- `?whois`  Get user information',
  '- `?inviteinfo`  Get information about an invite',
];

const UTILITY_STAFF = [
  ...UTILITY_SUPPORT,
  '- `?clean`  Clean up Dyno responses',
];

const UTILITY_STAFF_MANAGER = [
  ...UTILITY_STAFF,
  '- `?nick`  Change the bot nickname',
  '- `?members`  List members in a role(s) (max 90)',
  '- `?giveaway`  Create and manage giveaways',
];

const UTILITY_OWNER = [
  ...UTILITY_STAFF_MANAGER,
  '- `?info`  Get bot info',
  '- `?stats`  Get bot stats',
  '- `?uptime`  Get bot uptime',
  '- `?ping`  Ping the bot',
  '- `?premium`  Dyno premium information (Responds in DM)',
  '- `?serverinfo`  Get server info/stats',
  '- `?highlights`  Get notified when a specific phrase is said in a server',
  '- `?emotes`  Gets a list of server emojis',
  '- `?discrim`  Shows users with a certain discriminator',
  '- `?color`  Show a color using hex',
  '- `?distance`  Get the distance between two sets of coordinates',
];

const MOD_SUPPORT = [
  '- `?warn`  Warn a member',
  '- `?warnings`  Get warnings for a user',
  '- `?clearwarn`  Clear warnings for a user',
  '- `?note`  Add note(s) about a member',
  '- `?delnote`  Delete a note about a member',
  '- `?clearnotes`  Delete all notes for a member',
  '- `?editnote`  Edit a note about a member',
];

const MOD_TRIAL = [
  '- `?warn`  Warn a member',
  '- `?clearwarn`  Clear warnings for a user',
  '- `?note`  Add note(s) about a member',
  '- `?delnote`  Delete a note about a member',
  '- `?clearnotes`  Delete all notes for a member',
  '- `?editnote`  Edit a note about a member',
];

const MOD_STAFF = [
  ...MOD_SUPPORT,
  '- `?mute`  Mute a member so they cannot type',
  '- `?unmute`  Unmute a member',
  '- `?deafen`  Deafen a member',
  '- `?undeafen`  Undeafen a member',
];

const MOD_STAFF_MANAGER = [
  ...MOD_STAFF,
  '- `?kick`  Kick a member',
  '- `?ban`  Ban a member, optional time limit',
  '- `?unban`  Unban a member',
  '- `?softban`  Softban a member (ban and immediate unban to delete messages)',
  '- `?purge`  Delete a number of messages from a channel (limit 1000)',
  '- `?announce [#channel] [message]`  Send an announcement embed to a channel',
  '- `?modlogs`  Get a list of moderation logs for a user',
  '- `?moderations`  Get a list of active moderations (timed)',
  '- `?duration`  Change the duration of a mute/ban',
  '- `?slowmode`  Enable/disable slowmode',
  '- `?mock [@user]`  Mock a user by sending their messages as a webhook',
  '- `?unmock [@user]`  Stop mocking a user',
  '- `?nuke`  Delete all messages in the current channel',
  '- `?welcome [#channel]`  Set the welcome channel for new member join messages',
];

const MOD_OWNER = [
  ...MOD_STAFF_MANAGER,
  '- `?delwarn`  Delete a warning',
  '- `?notes`  Get notes for a user',
  '- `?modstats`  Get moderation statistics for a mod/admin',
  '- `?case`  Show a single mod log case',
  '- `?reason`  Supply a reason for a mod log case',
  '- `?lock`  Lock a channel with optional timer and message',
  '- `?unlock`  Unlock a previously locked channel',
  '- `?lockdown`  Lock channels defined in moderation settings',
  '- `?ignored`  List ignored users, roles, and channels',
  '- `?rolepersist`  Assign/unassign a role that persists if the user leaves and rejoins',
  '- `?temprole`  Assign/unassign a role that persists for a limited time',
  '- `?star`  View starboard stats for a message',
];

const TICKETS_SUPPORT = [
  '- `?add [@user]`  Add a user to the current ticket',
  '- `?remove [@user]`  Remove a user from the current ticket',
  '- `?rename [name]`  Rename the current ticket channel',
  '- `?claim`  Claim the current ticket',
  '- `?unclaim`  Unclaim the current ticket',
];

const TICKETS_OWNER = [
  ...TICKETS_SUPPORT,
  '- `?ticket setup`  Set up the ticket panel',
  '- `?removeticket`  Remove the entire ticket system',
];

const ADMIN_OWNER = [
  '- `?addmod`  Add a moderator role',
  '- `?delmod`  Remove a moderator role',
  '- `?listmods`  List moderators',
  '- `?addrole`  Add a new role with optional color and hoist',
  '- `?delrole`  Delete a role',
  '- `?rolecolor`  Change the color of a role',
  '- `?rolename`  Change the name of a role',
  '- `?mentionable`  Toggle making a role mentionable on/off',
  '- `?role`  Add/remove a user to a role or roles',
  '- `?module`  Enable/disable a module',
  '- `?modules`  List available modules',
  '- `?command`  Enable/disable a command',
  '- `?customs`  List, enable, disable custom commands',
  '- `?prefix`  Get or set the command prefix for this server',
  '- `?ignorechannel`  Toggles command usage in a channel',
  '- `?ignoreuser`  Toggles command usage for a user',
  '- `?ignorerole`  Toggles command usage for a role',
  '- `?setnick`  Change the nickname of a user',
  '- `?addemote`  Adds an emote to the server',
  '- `?addrank`  Add a new rank for members to join (role must exist)',
  '- `?delrank`  Delete an existing rank (does not delete the role)',
  '- `?rank`  Join/leave a rank',
  '- `?ranks`  Get a list of joinable ranks',
  '- `?roles`  Get a list of server roles',
  '- `?roleinfo`  Get information about a role',
];

const TIER_CATEGORIES = {
  verified: [
    { name: 'Fun',      commands: FUN_VERIFIED },
    { name: 'Utility',  commands: UTILITY_VERIFIED },
  ],
  support: [
    { name: 'Fun',      commands: FUN_STAFF },
    { name: 'Utility',  commands: UTILITY_SUPPORT },
    { name: 'Moderation', commands: MOD_SUPPORT },
    { name: 'Tickets',  commands: TICKETS_SUPPORT },
  ],
  trial: [
    { name: 'Fun',      commands: FUN_STAFF },
    { name: 'Utility',  commands: UTILITY_SUPPORT },
    { name: 'Moderation', commands: MOD_TRIAL },
  ],
  staff: [
    { name: 'Fun',      commands: FUN_STAFF },
    { name: 'Utility',  commands: UTILITY_STAFF },
    { name: 'Moderation', commands: MOD_STAFF },
    { name: 'Tickets',  commands: TICKETS_SUPPORT },
  ],
  staff_manager: [
    { name: 'Fun',      commands: FUN_STAFF },
    { name: 'Utility',  commands: UTILITY_STAFF_MANAGER },
    { name: 'Moderation', commands: MOD_STAFF_MANAGER },
    { name: 'Tickets',  commands: TICKETS_SUPPORT },
  ],
  owner: [
    { name: 'Fun',      commands: FUN_OWNER },
    { name: 'Utility',  commands: UTILITY_OWNER },
    { name: 'Moderation', commands: MOD_OWNER },
    { name: 'Tickets',  commands: TICKETS_OWNER },
    { name: 'Admin',    commands: ADMIN_OWNER },
  ],
};

const CMDS_PER_PAGE = 10;
const BLACK = 0x111111;
const TIER_ORDER = ['owner', 'staff_manager', 'staff', 'trial', 'support', 'verified'];

function getMemberTier(message) {
  if (message.guild.ownerId === message.author.id) return 'owner';
  const roleIds = message.member.roles.cache.map(r => r.id);
  for (const tier of TIER_ORDER) {
    if (ROLE_IDS[tier] && roleIds.includes(ROLE_IDS[tier])) return tier;
  }
  return 'verified';
}

function buildPages(tier) {
  const cats = TIER_CATEGORIES[tier] || TIER_CATEGORIES['verified'];
  return cats.map(cat => {
    const pages = [];
    for (let i = 0; i < cat.commands.length; i += CMDS_PER_PAGE) {
      pages.push(cat.commands.slice(i, i + CMDS_PER_PAGE));
    }
    return { name: cat.name, pages };
  });
}

function makeEmbed(cats, catIndex, pageIndex) {
  const cat = cats[catIndex];
  return new EmbedBuilder()
    .setTitle(`Commands  ${cat.name}`)
    .setColor(BLACK)
    .setDescription(cat.pages[pageIndex].join('\n'))
    .setFooter({
      text: `Page ${pageIndex + 1}/${cat.pages.length}  |  Category ${catIndex + 1}/${cats.length}`,
    });
}

function makeNavRow(cats, catIndex, pageIndex) {
  const cat = cats[catIndex];
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('prev_page')
      .setLabel('< Prev')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(pageIndex === 0),
    new ButtonBuilder()
      .setCustomId('next_page')
      .setLabel('Next >')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(pageIndex === cat.pages.length - 1),
  );
}

function makeCatRow(cats, catIndex) {
  const row = new ActionRowBuilder();
  for (let i = 0; i < Math.min(cats.length, 5); i++) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`cat_${i}`)
        .setLabel(cats[i].name)
        .setStyle(i === catIndex ? ButtonStyle.Primary : ButtonStyle.Secondary),
    );
  }
  return row;
}

module.exports = {
  name: 'help',
  aliases: ['h', 'commands', 'cmds'],
  description: 'Shows commands available to you based on your role',

  async execute(message) {
    const tier = getMemberTier(message);
    const cats = buildPages(tier);

    let catIndex = 0;
    let pageIndex = 0;

    const reply = await message.reply({
      embeds: [makeEmbed(cats, catIndex, pageIndex)],
      components: [makeCatRow(cats, catIndex), makeNavRow(cats, catIndex, pageIndex)],
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 5 * 60 * 1000,
      filter: i => i.user.id === message.author.id,
    });

    collector.on('collect', async interaction => {
      const id = interaction.customId;
      if (id === 'prev_page') pageIndex = Math.max(0, pageIndex - 1);
      else if (id === 'next_page') pageIndex = Math.min(cats[catIndex].pages.length - 1, pageIndex + 1);
      else if (id.startsWith('cat_')) { catIndex = parseInt(id.split('_')[1]); pageIndex = 0; }

      await interaction.update({
        embeds: [makeEmbed(cats, catIndex, pageIndex)],
        components: [makeCatRow(cats, catIndex), makeNavRow(cats, catIndex, pageIndex)],
      });
    });

    collector.on('end', async () => {
      const dNav = makeNavRow(cats, catIndex, pageIndex);
      const dCat = makeCatRow(cats, catIndex);
      for (const row of [dNav, dCat]) for (const btn of row.components) btn.setDisabled(true);
      await reply.edit({ components: [dCat, dNav] }).catch(() => {});
    });
  },
};

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ChannelType,
  AttachmentBuilder,
} = require('discord.js');

const ticketStore = require('./ticketStore');

const TYPE_LABELS = {
  support:      { label: 'Support',      color: 0x5865f2 },
  user_report:  { label: 'Report',       color: 0xfaa61a },
  partnership:  { label: 'Partnership',  color: 0x57f287 },
  purchase:     { label: 'Purchase',     color: 0xfee75c },
};

// Short label used in channel open message  e.g. "support - #0012"
function shortLabel(type) {
  if (type === 'user_report') return 'report';
  return type;
}

async function handleTicketInteraction(interaction) {
  // ── Dropdown: user selected a ticket type ─────────────────────────────────
  if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_type_select') {
    await interaction.deferReply({ ephemeral: true });

    const store = ticketStore.load();
    if (!store.categoryId || !store.logsChannelId) {
      return interaction.editReply({ content: 'Ticket system is not fully configured. Contact an admin.' });
    }

    const type = interaction.values[0];
    const typeInfo = TYPE_LABELS[type] || { label: type, color: 0x5865f2 };

    const existing = Object.entries(store.openTickets).find(
      ([, t]) => t.userId === interaction.user.id && t.type === type
    );
    if (existing) {
      return interaction.editReply({
        content: `You already have an open **${typeInfo.label}** ticket: <#${existing[0]}>`,
      });
    }

    store.ticketCounter = (store.ticketCounter || 0) + 1;
    const ticketNum = String(store.ticketCounter).padStart(4, '0');
    const safeName = `${type.replace('_', '-')}-${interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}-${ticketNum}`;

    let ticketChannel;
    try {
      ticketChannel = await interaction.guild.channels.create({
        name: safeName,
        type: ChannelType.GuildText,
        parent: store.categoryId,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.AttachFiles,
            ],
          },
          // trial and above can all see tickets
          ...['1503591897598529669', '1503591897598529670', '1503591897598529671', '1503781011648151733', '1503591897615302748']
            .map(id => ({
              id,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.AttachFiles,
              ],
            })),
        ],
      });
    } catch (err) {
      console.error('[Tickets] Failed to create channel:', err);
      return interaction.editReply({ content: 'Failed to create ticket channel. Check bot permissions.' });
    }

    store.openTickets[ticketChannel.id] = {
      userId: interaction.user.id,
      type,
      openedAt: Date.now(),
      ticketNumber: store.ticketCounter,
    };
    ticketStore.save(store);

    // Welcome embed — no emojis, short label format
    const welcomeEmbed = new EmbedBuilder()
      .setColor(typeInfo.color)
      .setTitle(`${shortLabel(type)} - #${ticketNum}`)
      .setDescription(
        [
          `Hello ${interaction.user}, welcome to your ticket.`,
          '',
          'Please describe what you need to buy, report request or need help with in details!',
          '',
          'A team member will assist you shortly.',
          '',
          '> Use the button below to close this ticket when resolved.',
        ].join('\n')
      )
      .addFields({ name: 'Opened by', value: `${interaction.user.tag}`, inline: true })
      .setTimestamp();

    const closeRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_close')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Danger)
    );

    await ticketChannel.send({
      content: `${interaction.user}`,
      embeds: [welcomeEmbed],
      components: [closeRow],
    });

    // Single log entry on open — closed log will be sent on close
    await logEvent(interaction.guild, store.logsChannelId, {
      color: typeInfo.color,
      title: `${shortLabel(type)} - #${ticketNum} opened`,
      fields: [
        { name: 'User', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
        { name: 'Channel', value: `${ticketChannel}`, inline: true },
        { name: 'Opened', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false },
      ],
    });

    return interaction.editReply({
      content: `Your **${typeInfo.label}** ticket has been created: ${ticketChannel}`,
    });
  }

  // ── Button: close ticket ───────────────────────────────────────────────────
  if (interaction.isButton() && interaction.customId === 'ticket_close') {
    const store = ticketStore.load();
    const ticketData = store.openTickets[interaction.channel.id];

    const isStaff =
      interaction.member.permissions.has(PermissionFlagsBits.ManageMessages) ||
      interaction.member.permissions.has(PermissionFlagsBits.Administrator);

    if (!ticketData) {
      if (!isStaff) return interaction.reply({ content: 'This is not a tracked ticket.', ephemeral: true });
    } else {
      if (interaction.user.id !== ticketData.userId && !isStaff) {
        return interaction.reply({ content: 'Only the ticket owner or staff can close this.', ephemeral: true });
      }
    }

    await interaction.reply({ content: 'Closing ticket in 5 seconds...' });

    // Build transcript
    let transcript = `TICKET TRANSCRIPT — ${interaction.channel.name}\n`;
    transcript += `Closed by: ${interaction.user.tag} at ${new Date().toUTCString()}\n`;
    transcript += '─'.repeat(60) + '\n';
    try {
      const messages = await interaction.channel.messages.fetch({ limit: 100 });
      const sorted = [...messages.values()].reverse();
      for (const msg of sorted) {
        if (msg.author.bot && msg.embeds.length && !msg.content) continue;
        transcript += `[${msg.createdAt.toUTCString()}] ${msg.author.tag}: ${msg.content || '[embed/attachment]'}\n`;
      }
    } catch (_) {}

    // Single close log with transcript
    if (store.logsChannelId) {
      const typeInfo = ticketData
        ? (TYPE_LABELS[ticketData.type] || { label: ticketData.type, color: 0xff3333 })
        : { label: 'Unknown', color: 0xff3333 };
      const ticketNum = ticketData ? String(ticketData.ticketNumber).padStart(4, '0') : '????';
      const openedUser = ticketData ? `<@${ticketData.userId}>` : 'Unknown';

      const closedEmbed = new EmbedBuilder()
        .setColor(0xff3333)
        .setTitle(`${shortLabel(ticketData?.type || 'unknown')} - #${ticketNum} closed`)
        .addFields(
          { name: 'Opened by', value: openedUser, inline: true },
          { name: 'Closed by', value: `${interaction.user.tag}`, inline: true },
          { name: 'Channel', value: interaction.channel.name, inline: true },
          {
            name: 'Open duration',
            value: ticketData ? `<t:${Math.floor(ticketData.openedAt / 1000)}:R>` : 'Unknown',
            inline: true,
          },
          { name: 'Closed', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
        )
        .setFooter({ text: 'Transcript attached' });

      const logsChannel = interaction.guild.channels.cache.get(store.logsChannelId);
      if (logsChannel) {
        const buf = Buffer.from(transcript, 'utf8');
        const attachment = new AttachmentBuilder(buf, { name: `transcript-${interaction.channel.name}.txt` });
        await logsChannel.send({ embeds: [closedEmbed], files: [attachment] }).catch(() => {});
      }
    }

    if (ticketData) {
      delete store.openTickets[interaction.channel.id];
      ticketStore.save(store);
    }

    setTimeout(() => {
      interaction.channel.delete('Ticket closed').catch(() => {});
    }, 5000);
  }
}

async function logEvent(guild, logsChannelId, { color, title, fields }) {
  try {
    const ch = guild.channels.cache.get(logsChannelId);
    if (!ch) return;
    const embed = new EmbedBuilder().setColor(color).setTitle(title).addFields(fields).setTimestamp();
    await ch.send({ embeds: [embed] });
  } catch (_) {}
}

module.exports = { handleTicketInteraction };

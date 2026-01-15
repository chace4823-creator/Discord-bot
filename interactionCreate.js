const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const storage = require('../utils/storage');
const { nanoid } = require('nanoid');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    // Command handling
    if (interaction.isChatInputCommand()) {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) return;
      try {
        await cmd.execute(interaction, client);
      } catch (err) {
        console.error(err);
        await interaction.reply({ content: 'Command error.', ephemeral: true });
      }
      return;
    }

    // Modal submit handling
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'embedModal') {
        const title = interaction.fields.getTextInputValue('embedTitle');
        const desc = interaction.fields.getTextInputValue('embedDescription');
        const color = interaction.fields.getTextInputValue('embedColor') || '#2f3136';
        const thumbnail = interaction.fields.getTextInputValue('embedThumbnail');
        const footer = interaction.fields.getTextInputValue('embedFooter');

        const embed = new EmbedBuilder()
          .setTitle(title || '')
          .setDescription(desc || '')
          .setColor(color || '#2f3136');
        if (thumbnail) embed.setThumbnail(thumbnail);
        if (footer) embed.setFooter({ text: footer });

        await interaction.reply({ embeds: [embed] });
        return;
      }

      if (interaction.customId === 'textModal') {
        const content = interaction.fields.getTextInputValue('textContent');
        await interaction.reply({ content, ephemeral: false });
        return;
      }

      if (interaction.customId === 'eventModal') {
        const title = interaction.fields.getTextInputValue('eventTitle');
        const datetime = interaction.fields.getTextInputValue('eventDateTime');
        const desc = interaction.fields.getTextInputValue('eventDesc');

        const embed = new EmbedBuilder()
          .setTitle(`📅 ${title}`)
          .setDescription(desc || 'No description.')
          .addFields({ name: 'When', value: datetime || 'TBA', inline: true })
          .setColor('#8a2be2');

        // Post to events channel
        const eventsChannelId = process.env.EVENTS_CHANNEL_ID;
        let posted = false;
        if (eventsChannelId) {
          try {
            const ch = await interaction.guild.channels.fetch(eventsChannelId);
            if (ch) {
              const msg = await ch.send({
                embeds: [embed],
                components: [{
                  type: 1,
                  components: [
                    new ButtonBuilder().setCustomId(`rsvp_yes_${nanoid(6)}`).setLabel('✅ RSVP Yes').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId(`rsvp_maybe_${nanoid(6)}`).setLabel('🤷 RSVP Maybe').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId(`rsvp_no_${nanoid(6)}`).setLabel('❌ RSVP No').setStyle(ButtonStyle.Danger)
                  ]
                }]
              });
              storage.addEvent(msg.id, { title, datetime, desc, messageId: msg.id });
              posted = true;
            }
          } catch (e) {
            console.warn('Could not post to events channel:', e?.message || e);
          }
        }

        await interaction.reply({ content: posted ? 'Event created and posted.' : 'Event created. (No events channel configured or failed to post.)', ephemeral: true });
        return;
      }
    }

    // Button handling
    if (interaction.isButton()) {
      // Ticket panel button
      if (interaction.customId === 'create_ticket') {
        await interaction.deferReply({ ephemeral: true });
        const id = nanoid(6);
        const categoryName = process.env.TICKETS_CATEGORY_NAME || 'Tickets';
        const guild = interaction.guild;
        let category = guild.channels.cache.find(c => c.name === categoryName && c.type === ChannelType.GuildCategory);
        if (!category) {
          try {
            category = await guild.channels.create({ name: categoryName, type: ChannelType.GuildCategory, permissionOverwrites: [] });
          } catch (e) {
            console.error('Unable to create category', e);
          }
        }

        // Create channel with permissions: only ticket owner + staff + system
        const everyone = guild.roles.everyone;
        const staffRoleId = process.env.STAFF_ROLE_ID;
        const overwrites = [
          { id: everyone.id, deny: [PermissionFlagsBits.ViewChannel] }
        ];
        if (staffRoleId) overwrites.push({ id: staffRoleId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] });
        overwrites.push({ id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });

        const chan = await guild.channels.create({
          name: `ticket-${id}`,
          type: ChannelType.GuildText,
          parent: category ? category.id : null,
          permissionOverwrites: overwrites,
          topic: `Ticket for ${interaction.user.tag} (${interaction.user.id})`
        });

        const ticketData = { id, ownerId: interaction.user.id, channelId: chan.id, createdAt: Date.now() };
        storage.addTicket(id, ticketData);

        await chan.send({
          content: `<@${interaction.user.id}> thanks — a staff member will be with you soon.`,
          components: [{
            type: 1,
            components: [
              new ButtonBuilder().setCustomId(`close_ticket_${id}`).setLabel('🔒 Close Ticket').setStyle(ButtonStyle.Danger)
            ]
          }]
        });

        await interaction.editReply({ content: `Ticket created: ${chan}` });
        return;
      }

      // Close ticket button pressed inside ticket channel
      if (interaction.customId.startsWith('close_ticket_')) {
        await interaction.deferReply({ ephemeral: true });
        const id = interaction.customId.replace('close_ticket_', '');
        const ticket = storage.getTicket(id);
        if (!ticket) return interaction.editReply({ content: 'Ticket data not found.' });

        const ch = interaction.guild.channels.cache.get(ticket.channelId);
        if (!ch) return interaction.editReply({ content: 'Ticket channel already removed.' });

        try {
          await ch.send('Closing ticket in 5 seconds...');
          setTimeout(async () => {
            await ch.delete('Ticket closed');
            storage.removeTicket(id);
          }, 5000);
        } catch (e) {
          console.error(e);
        }
        await interaction.editReply({ content: 'Ticket closing...' });
        return;
      }
    }

    // RSVP handling (simple demo: acknowledge)
    if (interaction.isButton() && interaction.customId.startsWith('rsvp_')) {
      // E.g. rsvp_yes_abc123
      const parts = interaction.customId.split('_');
      const choice = parts[1];
      await interaction.reply({ content: `You selected: ${choice.toUpperCase()}`, ephemeral: true });
      return;
    }
  }
};
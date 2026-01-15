const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketpanel')
    .setDescription('Send a ticket panel message (staff only)'),
  async execute(interaction) {
    if (!interaction.memberPermissions.has('ManageGuild')) {
      return interaction.reply({ content: 'You need Manage Server perms to use this.', ephemeral: true });
    }

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('create_ticket').setLabel('🎫 Open Ticket').setStyle(ButtonStyle.Primary)
      );

    await interaction.reply({
      content: 'Need help? Open a ticket and our staff will assist you.',
      components: [row]
    });
  }
};
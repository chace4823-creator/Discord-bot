const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Create a ticket channel (one-off)'),
  async execute(interaction) {
    // In addition to the panel approach, you can also create directly here
    await interaction.deferReply({ ephemeral: true });
    // Reuse the same button flow as the panel: trigger the button handling via interactionCreate
    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('create_ticket').setLabel('Open Ticket').setStyle(ButtonStyle.Primary)
    );
    await interaction.editReply({ content: 'Click to open a ticket:', components: [button] });
  }
};
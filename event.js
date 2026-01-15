const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('event')
    .setDescription('Create an event (opens modal to collect details)'),
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('eventModal')
      .setTitle('Create an event');

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('eventTitle').setLabel('Event title').setStyle(TextInputStyle.Short).setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('eventDateTime').setLabel('Date & time (friendly)').setStyle(TextInputStyle.Short).setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId('eventDesc').setLabel('Description').setStyle(TextInputStyle.Paragraph).setRequired(false)
      )
    );

    await interaction.showModal(modal);
  }
};
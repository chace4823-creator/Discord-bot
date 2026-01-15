const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('text')
    .setDescription('Open a plain text modal to send content'),
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('textModal')
      .setTitle('Send plain text');

    const content = new TextInputBuilder()
      .setCustomId('textContent')
      .setLabel('Message')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(4000);

    modal.addComponents(new ActionRowBuilder().addComponents(content));
    await interaction.showModal(modal);
  }
};
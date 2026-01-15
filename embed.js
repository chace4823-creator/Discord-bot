const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Open an embed builder modal'),
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('embedModal')
      .setTitle('Create an embed');

    const title = new TextInputBuilder()
      .setCustomId('embedTitle')
      .setLabel('Title')
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
      .setMaxLength(256);

    const desc = new TextInputBuilder()
      .setCustomId('embedDescription')
      .setLabel('Description')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false)
      .setMaxLength(4000);

    const color = new TextInputBuilder()
      .setCustomId('embedColor')
      .setLabel('Color (hex or name)')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const thumbnail = new TextInputBuilder()
      .setCustomId('embedThumbnail')
      .setLabel('Thumbnail URL (optional)')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const footer = new TextInputBuilder()
      .setCustomId('embedFooter')
      .setLabel('Footer text (optional)')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(title),
      new ActionRowBuilder().addComponents(desc),
      new ActionRowBuilder().addComponents(color),
      new ActionRowBuilder().addComponents(thumbnail),
      new ActionRowBuilder().addComponents(footer)
    );

    await interaction.showModal(modal);
  }
};
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('menu2')
    .setDescription('Menampilkan dropdown menu untuk MV dan Design'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Choose your role.')
      .setDescription('Select your preferred role from the dropdown below.')
      .setColor(0x450693);

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_option2')
      .setPlaceholder('Pilih role...')
      .addOptions(
        {
          label: 'MV',
          description: 'Pilih role MV',
          value: 'mv',
        },
        {
          label: 'Design',
          description: 'Pilih role Design',
          value: 'design',
        }
      );

    const row = new ActionRowBuilder()
      .addComponents(selectMenu);

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};

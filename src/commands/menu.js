const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('menu')
    .setDescription('Menampilkan dropdown menu dengan opsi'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Choose your favorite software.')
      .setDescription('Select your preferred software from the dropdown below.')
      .setColor(0x450693);

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_option')
      .setPlaceholder('Pilih software...')
      .addOptions(
        {
          label: 'After Effect',
          description: 'Pilih role After Effect',
          value: 'after_effect',
        },
        {
          label: 'Alight Motion',
          description: 'Pilih role Alight Motion',
          value: 'alight_motion',
        },
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

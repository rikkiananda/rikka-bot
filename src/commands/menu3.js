const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('menu3')
    .setDescription('Menampilkan dropdown menu untuk pemboy dan normal'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Pilih role Anda.')
      .setDescription('Pilih role yang diinginkan dari dropdown di bawah.')
      .setColor(0x450693);

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_option3')
      .setPlaceholder('Pilih role...')
      .addOptions(
        {
          label: 'Pemboy',
          description: 'Pilih role Pemboy',
          value: 'pemboy',
        },
        {
          label: 'Normal',
          description: 'Pilih role Normal',
          value: 'normal',
        }
      );

    const row = new ActionRowBuilder()
      .addComponents(selectMenu);

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};

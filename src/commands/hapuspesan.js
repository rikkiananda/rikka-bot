const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hapuspesan')
    .setDescription('Hapus beberapa pesan terakhir dari bawah ke atas')
    .addIntegerOption(option =>
      option.setName('jumlah')
        .setDescription('Jumlah pesan yang ingin dihapus (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  async execute(interaction) {
    const jumlah = interaction.options.getInteger('jumlah');
    const channel = interaction.channel;

    // Check if bot has permission to manage messages
    if (!channel.permissionsFor(interaction.guild.members.me).has('ManageMessages')) {
      return await interaction.reply({ content: 'Bot tidak memiliki izin untuk menghapus pesan.', ephemeral: true });
    }

    try {
      // Fetch the last 'jumlah' messages
      const messages = await channel.messages.fetch({ limit: jumlah });
      // Bulk delete
      const deleted = await channel.bulkDelete(messages, true); // true to skip non-deletable messages
      await interaction.reply({ content: `Berhasil menghapus ${deleted.size} pesan.`, ephemeral: true });
    } catch (error) {
      console.error('Error deleting messages:', error);
      await interaction.reply({ content: 'Gagal menghapus pesan. Pastikan pesan tidak lebih dari 2 minggu.', ephemeral: true });
    }
  },
};

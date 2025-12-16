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
    await interaction.deferReply({ flags: 64 }); // Defer with ephemeral flag

    const jumlah = interaction.options.getInteger('jumlah');
    const channel = interaction.channel;

    // Check if bot has permission to manage messages
    if (!channel.permissionsFor(interaction.guild.members.me).has('ManageMessages')) {
      return await interaction.editReply({ content: 'Bot tidak memiliki izin untuk menghapus pesan.' });
    }

    try {
      // Fetch the last 'jumlah' messages
      const messages = await channel.messages.fetch({ limit: jumlah });
      // Bulk delete
      const deleted = await channel.bulkDelete(messages, true); // true to skip non-deletable messages
      if (deleted.size === 0) {
        await interaction.editReply({ content: 'Tidak ada pesan yang dapat dihapus. Pastikan pesan tidak lebih dari 2 minggu dan bot memiliki izin.' });
      } else if (deleted.size < messages.size) {
        await interaction.editReply({ content: `Berhasil menghapus ${deleted.size} pesan. Beberapa pesan mungkin terlalu lama (lebih dari 2 minggu) dan tidak dapat dihapus secara massal.` });
      } else {
        await interaction.editReply({ content: `Berhasil menghapus ${deleted.size} pesan.` });
      }
    } catch (error) {
      console.error('Error deleting messages:', error);
      await interaction.editReply({ content: 'Gagal menghapus pesan. Pastikan pesan tidak lebih dari 2 minggu.' });
    }
  },
};

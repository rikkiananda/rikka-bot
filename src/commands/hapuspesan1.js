const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hapuspesan1')
    .setDescription('Hapus pesan yang direply'),

  async execute(interaction) {
    // Check if the command is used as a reply
    if (!interaction.reference) {
      return await interaction.reply({ content: 'Perintah ini harus digunakan sebagai reply ke pesan yang ingin dihapus.', ephemeral: true });
    }

    const channel = interaction.channel;
    const messageId = interaction.reference.messageId;

    // Check if bot has permission to manage messages
    if (!channel.permissionsFor(interaction.guild.members.me).has('ManageMessages')) {
      return await interaction.reply({ content: 'Bot tidak memiliki izin untuk menghapus pesan.', ephemeral: true });
    }

    try {
      // Delete the referenced message
      await channel.messages.delete(messageId);
      await interaction.reply({ content: 'Pesan berhasil dihapus.', ephemeral: true });
    } catch (error) {
      console.error('Error deleting message:', error);
      await interaction.reply({ content: 'Gagal menghapus pesan. Pastikan pesan masih ada dan bot memiliki izin.', ephemeral: true });
    }
  },
};

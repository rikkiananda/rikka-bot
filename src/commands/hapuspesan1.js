const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hapuspesan1')
    .setDescription('Hapus pesan yang direply'),

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 }); // Defer with ephemeral flag

    // Check if the command is used as a reply
    if (!interaction.reference) {
      return await interaction.editReply({ content: 'Perintah ini harus digunakan sebagai reply ke pesan yang ingin dihapus.' });
    }

    const channel = interaction.channel;
    const messageId = interaction.reference.messageId;

    // Check if bot has permission to manage messages
    if (!channel.permissionsFor(interaction.guild.members.me).has('ManageMessages')) {
      return await interaction.editReply({ content: 'Bot tidak memiliki izin untuk menghapus pesan.' });
    }

    try {
      // Delete the referenced message
      await channel.messages.delete(messageId);
      await interaction.editReply({ content: 'Pesan berhasil dihapus.' });
    } catch (error) {
      console.error('Error deleting message:', error);
      await interaction.editReply({ content: 'Gagal menghapus pesan. Pastikan pesan masih ada dan bot memiliki izin.' });
    }
  },
};

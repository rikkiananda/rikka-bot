const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kirimpesan')
    .setDescription('Kirim pesan ke saluran tertentu')
    .addStringOption(option =>
      option.setName('pesan')
        .setDescription('Pesan yang ingin dikirim')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Saluran tujuan')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const messageContent = interaction.options.getString('pesan');
    const selectedChannel = interaction.options.getChannel('channel');

    if (selectedChannel.type !== 0) { // 0 is GUILD_TEXT
      return await interaction.editReply({ content: '❌ Saluran yang dipilih harus berupa saluran teks.' });
    }

    const relayContent = messageContent;

    try {
      await selectedChannel.send(relayContent);
      await interaction.editReply({ content: '✅ Pesan telah dikirim ke saluran yang dipilih!' });
    } catch (error) {
      console.error('Error sending message:', error);
      await interaction.editReply({ content: '❌ Terjadi kesalahan saat mengirim pesan.' });
    }
  },
};

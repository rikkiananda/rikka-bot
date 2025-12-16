const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ],
});

client.once('clientReady', () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'kirimpesan') {
    const messageContent = interaction.options.getString('pesan');
    const selectedChannel = interaction.options.getChannel('channel');

    if (selectedChannel.type !== ChannelType.GuildText) {
      return await interaction.reply({ content: '❌ Saluran yang dipilih harus berupa saluran teks.', ephemeral: true });
    }

    const relayContent = `> **Pesan dari ${interaction.user.username}:**\n> ${messageContent.split('\n').join('\n> ')}`;

    try {
      await selectedChannel.send(relayContent);
      await interaction.reply({ content: '✅ Pesan telah dikirim ke saluran yang dipilih!', ephemeral: true });
    } catch (error) {
      console.error('Error sending message:', error);
      if (!interaction.replied) {
        await interaction.reply({ content: '❌ Terjadi kesalahan saat mengirim pesan.', ephemeral: true });
      }
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

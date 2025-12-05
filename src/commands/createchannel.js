const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createchannel')
    .setDescription('Membuat channel baru')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Nama channel yang ingin dibuat')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('topic')
        .setDescription('Deskripsi/topik channel')
        .setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply();

    const name = interaction.options.getString('name').toLowerCase().replace(/\s+/g, '-');
    const topic = interaction.options.getString('topic') || null;

    // Check if category exists
    const category = interaction.guild.channels.cache.get('1431755126074511520');
    if (!category || category.type !== ChannelType.GuildCategory) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Gagal Membuat Channel')
        .setDescription('Kategori dengan ID 1431755126074511520 tidak ditemukan atau bukan kategori di server ini.')
        .setColor(0xff0000)
        .setTimestamp()
        .setFooter({ text: interaction.client.user.username });

      return await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
    }

    // Check if channel already exists
    const existingChannel = interaction.guild.channels.cache.find(ch => ch.name === name);
    if (existingChannel) {
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Gagal Membuat Channel')
        .setDescription('Channel dengan nama itu sudah ada di server.')
        .setColor(0xff0000)
        .setTimestamp()
        .setFooter({ text: interaction.client.user.username });

      return await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
    }

    try {
      // Create the channel
      const newChannel = await interaction.guild.channels.create({
        name: name,
        type: ChannelType.GuildText,
        topic: topic,
        parent: category.id,
        permissionOverwrites: [
          {
            id: interaction.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageMessages],
          },
          {
            id: interaction.guild.roles.everyone.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
          },
        ],
      });

      // Success embed
      const successEmbed = new EmbedBuilder()
        .setTitle('✅ Channel Berhasil Dibuat!')
        .setDescription(`Channel **#${name}** telah dibuat oleh ${interaction.user.username}.`)
        .setColor(0x9b59b6)
        .setTimestamp()
        .setFooter({ text: interaction.client.user.username });

      await interaction.editReply({ embeds: [successEmbed] });
    } catch (error) {
      console.error(error);
      const errorEmbed = new EmbedBuilder()
        .setTitle('❌ Error')
        .setDescription('Terjadi kesalahan saat membuat channel.')
        .setColor(0xff0000)
        .setTimestamp()
        .setFooter({ text: interaction.client.user.username });

      await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
    }
  },
};

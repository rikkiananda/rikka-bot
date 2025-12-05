const { Client, GatewayIntentBits, REST, Routes, Collection, EmbedBuilder, ChannelType } = require("discord.js");
const fs = require('fs');
const path = require('path');
require("dotenv").config();

// Constants for message relay
const TARGET_CHANNEL_ID = '1432010586916651111';
const PREFIX = '!teruskan';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    const commands = [];
    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, file));
      commands.push(command.data.toJSON());
    }

    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, '1407898828857938092'),
      { body: commands },
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();

client.once("ready", () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
});

client.on("guildMemberAdd", async member => {
  // Verification message in #verify channel
  const verifyChannel = member.guild.channels.cache.get('1431741247411847208');
  if (verifyChannel) {
    const verifyEmbed = {
      title: 'Verifikasi',
      description: 'Klik tombol di bawah untuk verifikasi.',
      color: 0x00ff00
    };

    const button = {
      type: 1,
      components: [
        {
          type: 2,
          style: 3, // Green button
          label: 'Verify',
          custom_id: 'verify_button'
        }
      ]
    };

    await verifyChannel.send({ embeds: [verifyEmbed], components: [button] });
  }

  // Welcome message in system channel
  const welcomeChannel = member.guild.systemChannel;
  if (welcomeChannel) {
    const embed = new EmbedBuilder()
      .setColor("#9b59b6")
      .setTitle(`🎉 Selamat Datang di ${member.guild.name}!`)
      .setDescription(`Hai <@${member.id}>! Semoga kamu betah di sini 💜`)
      .setThumbnail(member.user.displayAvatarURL())
      .setFooter({ text: `Total member sekarang: ${member.guild.memberCount}` });

    await welcomeChannel.send({ embeds: [embed] });
  }
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

client.on("interactionCreate", async interaction => {
  if (interaction.customId === 'verify_button') {
    const member = interaction.member;
    const roleId = '1431740192179486761';

    if (member.roles.cache.has(roleId)) {
      await interaction.reply({ content: 'Kamu sudah diverifikasi.', ephemeral: true });
      return;
    }

    try {
      const role = interaction.guild.roles.cache.get(roleId);
      if (role) {
        await member.roles.add(role);
        await interaction.reply({ content: 'Verifikasi berhasil! Selamat datang di server.', ephemeral: true });
      } else {
        await interaction.reply({ content: 'Role verifikasi tidak ditemukan.', ephemeral: true });
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Terjadi kesalahan saat verifikasi.', ephemeral: true });
    }
    return;
  }

  if (!interaction.isStringSelectMenu()) return;

  if (interaction.customId === 'select_option') {
    const selectedValue = interaction.values[0];
    const member = interaction.member;
    let roleId = '';
    let responseMessage = '';

    switch (selectedValue) {
      case 'after_effect':
        roleId = '1430921485806993518'; // ID role After Effect
        responseMessage = 'Role After Effect telah ditambahkan!';
        break;
      case 'alight_motion':
        roleId = '1430922012595064862'; // ID role Alight Motion
        responseMessage = 'Role Alight Motion telah ditambahkan!';
        break;
      default:
        responseMessage = 'Opsi tidak dikenal.';
        await interaction.reply({ content: responseMessage, ephemeral: true });
        return;
    }

    try {
      const role = interaction.guild.roles.cache.get(roleId);
      if (role) {
        await member.roles.add(role);
        await interaction.reply({ content: responseMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: 'Role tidak ditemukan.', ephemeral: true });
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Terjadi kesalahan saat menambahkan role.', ephemeral: true });
    }
  }

  if (interaction.customId === 'select_option2') {
    const selectedValue = interaction.values[0];
    const member = interaction.member;
    let roleId = '';
    let responseMessage = '';

    switch (selectedValue) {
      case 'mv':
        roleId = '1431315058218242169'; // ID role MV
        responseMessage = 'Role MV telah ditambahkan!';
        break;
      case 'design':
        roleId = '1431315300619522168'; // ID role Design
        responseMessage = 'Role Design telah ditambahkan!';
        break;
      default:
        responseMessage = 'Opsi tidak dikenal.';
        await interaction.reply({ content: responseMessage, ephemeral: true });
        return;
    }

    try {
      const role = interaction.guild.roles.cache.get(roleId);
      if (role) {
        await member.roles.add(role);
        await interaction.reply({ content: responseMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: 'Role tidak ditemukan.', ephemeral: true });
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Terjadi kesalahan saat menambahkan role.', ephemeral: true });
    }
  }

  if (interaction.customId === 'select_option3') {
    const selectedValue = interaction.values[0];
    const member = interaction.member;
    let roleId = '';
    let responseMessage = '';

    switch (selectedValue) {
      case 'pemboy':
        roleId = '1431722166705197107'; // ID role Pemboy
        responseMessage = 'Role Pemboy telah ditambahkan!';
        break;
      case 'normal':
        roleId = '1431721880657596417'; // ID role Normal
        responseMessage = 'Role Normal telah ditambahkan!';
        break;
      default:
        responseMessage = 'Opsi tidak dikenal.';
        await interaction.reply({ content: responseMessage, ephemeral: true });
        return;
    }

    try {
      const role = interaction.guild.roles.cache.get(roleId);
      if (role) {
        await member.roles.add(role);
        await interaction.reply({ content: responseMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: 'Role tidak ditemukan.', ephemeral: true });
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'Terjadi kesalahan saat menambahkan role.', ephemeral: true });
    }
  }
});

client.on("messageCreate", async message => {
  // Message relay logic for all members using prefix command
  if (message.author.bot) return;

  if (message.content.startsWith(PREFIX)) {
    const content = message.content.slice(PREFIX.length).trim();
    if (!content) {
      await message.reply('Silakan sertakan pesan yang ingin diteruskan setelah `!teruskan`.');
      return;
    }

    try {
      const targetChannel = await client.channels.fetch(TARGET_CHANNEL_ID);
      if (targetChannel) {
        const relayContent = `Pesan dari ${message.author.tag} di #${message.channel.name}:\n\n${content}`;
        const attachments = message.attachments.map(attachment => attachment.url);
        await targetChannel.send({
          content: relayContent,
          files: attachments
        });
        await message.react('✅'); // Confirm relay
      }
    } catch (error) {
      console.error('Error relaying message:', error);
      await message.react('❌'); // Indicate error
    }
    return; // Skip other message handling for relayed messages
  }

  // Skip "rikka" replies in the AI channel to avoid double triggers
  if (message.channel.id === '1431761520655597599') return;

  if (message.content.toLowerCase() === "hello") {
    message.reply("Hello there!");
  }

  const phrases = ["rikka", "Rikka", "hai", "Hai", "halo rikka", "rikka bot"];
  const lowerContent = message.content.toLowerCase();
  const foundPhrase = phrases.some(phrase => lowerContent.includes(phrase.toLowerCase()));

  if (foundPhrase) {
    message.reply(`Kamu manggil aku? apakah kamu perlu sesuatu <@${message.author.id}>`);
  }

  if (lowerContent.includes("sedih")) {
    message.reply(`kamu <@${message.author.id}> jangan sedih ya >.<`);
  }
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  const creatorChannelId = '1446117446569169007';
  const categoryId = '1407898831554744473';

  // User joined the creator channel
  if (newState.channelId === creatorChannelId && oldState.channelId !== newState.channelId) {
    const member = newState.member;
    const guild = newState.guild;

    try {
      // Create a new voice channel in the category
      const newChannel = await guild.channels.create({
        name: `${member.user.username}'s Channel`,
        type: ChannelType.GuildVoice,
        parent: categoryId,
        permissionOverwrites: [
          {
            id: member.id,
            allow: ['ManageChannels', 'MoveMembers'],
          },
        ],
      });

      // Move the user to the new channel
      await member.voice.setChannel(newChannel);
    } catch (error) {
      console.error('Error creating voice channel:', error);
    }
  }

  // User left a voice channel
  if (oldState.channelId && oldState.channelId !== newState.channelId) {
    const oldChannel = oldState.channel;
    if (oldChannel && oldChannel.parentId === categoryId && oldChannel.id !== creatorChannelId) {
      // Check if the channel is empty
      if (oldChannel.members.size === 0) {
        try {
          await oldChannel.delete();
        } catch (error) {
          console.error('Error deleting voice channel:', error);
        }
      }
    }
  }
});

client.login(process.env.DISCORD_TOKEN);


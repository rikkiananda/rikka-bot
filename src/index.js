const { Client, GatewayIntentBits, REST, Routes, Collection } = require("discord.js");
const fs = require('fs');
const path = require('path');
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
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
      Routes.applicationCommands(process.env.CLIENT_ID),
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
});

client.on("messageCreate", message => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === "hello") {
    message.reply("Hello there!");
  }
});

client.login(process.env.DISCORD_TOKEN);


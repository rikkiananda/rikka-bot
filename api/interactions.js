const { Client, GatewayIntentBits, REST, Routes, Collection } = require("discord.js");
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, '..', 'src', 'commands');
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

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const signature = req.headers['x-signature-ed25519'];
  const timestamp = req.headers['x-signature-timestamp'];
  const body = JSON.stringify(req.body);

  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  const isValidRequest = verifyKey(body, signature, timestamp, publicKey);

  if (!isValidRequest) {
    return res.status(401).end('invalid request signature');
  }

  const interaction = req.body;

  if (interaction.type === 1) {
    // PING
    return res.status(200).json({ type: 1 });
  }

  if (interaction.type === 2) {
    // APPLICATION_COMMAND
    const command = client.commands.get(interaction.data.name);

    if (!command) return res.status(400).end();

    try {
      const result = await command.execute(interaction);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(200).json({
        type: 4,
        data: {
          content: 'There was an error while executing this command!',
          flags: 64
        }
      });
    }
  }

  if (interaction.type === 3) {
    // MESSAGE_COMPONENT (for select menus)
    if (interaction.data.component_type === 3) { // STRING_SELECT
      const selectedValue = interaction.data.values[0];
      const member = interaction.member;
      let roleId = '';
      let responseMessage = '';

      if (interaction.data.custom_id === 'select_option') {
        switch (selectedValue) {
          case 'after_effect':
            roleId = '1430921485806993518';
            responseMessage = 'Role After Effect telah ditambahkan!';
            break;
          case 'alight_motion':
            roleId = '1430922012595064862';
            responseMessage = 'Role Alight Motion telah ditambahkan!';
            break;
          default:
            responseMessage = 'Opsi tidak dikenal.';
            return res.status(200).json({
              type: 4,
              data: {
                content: responseMessage,
                flags: 64
              }
            });
        }
      } else if (interaction.data.custom_id === 'select_option2') {
        switch (selectedValue) {
          case 'mv':
            roleId = '1431315058218242169';
            responseMessage = 'Role MV telah ditambahkan!';
            break;
          case 'design':
            roleId = '1431315300619522168';
            responseMessage = 'Role Design telah ditambahkan!';
            break;
          default:
            responseMessage = 'Opsi tidak dikenal.';
            return res.status(200).json({
              type: 4,
              data: {
                content: responseMessage,
                flags: 64
              }
            });
        }
      }

      try {
        // Note: In webhook mode, we can't directly add roles. Need to use REST API
        const guild = await client.guilds.fetch(interaction.guild_id);
        const role = await guild.roles.fetch(roleId);
        const user = await guild.members.fetch(interaction.member.user.id);
        await user.roles.add(role);
        return res.status(200).json({
          type: 4,
          data: {
            content: responseMessage,
            flags: 64
          }
        });
      } catch (error) {
        console.error(error);
        return res.status(200).json({
          type: 4,
          data: {
            content: 'Terjadi kesalahan saat menambahkan role.',
            flags: 64
          }
        });
      }
    }
  }

  return res.status(400).end();
};

function verifyKey(rawBody, signature, timestamp, publicKey) {
  const message = timestamp + rawBody;
  const sig = Buffer.from(signature, 'hex');
  const key = Buffer.from(publicKey, 'hex');
  return crypto.verify('sha256', Buffer.from(message), key, sig);
}

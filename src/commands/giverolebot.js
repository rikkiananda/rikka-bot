const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giverolebot')
    .setDescription('Give a specific role to all bots in the server'),

  async execute(interaction) {
    // Check if user has Administrator permission
    if (!interaction.member.permissions.has('Administrator')) {
      return await interaction.reply({ content: 'You do not have permission to use this command. Administrator permission required.', ephemeral: true });
    }

    // Check if bot has ManageRoles permission
    if (!interaction.guild.members.me.permissions.has('ManageRoles')) {
      return await interaction.reply({ content: 'Bot does not have permission to manage roles.', ephemeral: true });
    }

    await interaction.deferReply(); // Defer to avoid timeout

    try {
      // Fetch all members
      await interaction.guild.members.fetch();

      const roleId = '1446687401480028221';
      const role = interaction.guild.roles.cache.get(roleId);
      if (!role) {
        return await interaction.editReply({ content: 'Role not found.' });
      }

      let addedCount = 0;
      const members = interaction.guild.members.cache;

      for (const member of members.values()) {
        if (member.user.bot && !member.roles.cache.has(roleId)) {
          try {
            await member.roles.add(roleId);
            addedCount++;
            // Delay 400-600ms
            await new Promise(res => setTimeout(res, Math.floor(Math.random() * 201) + 400));
          } catch (error) {
            console.error(`Failed to add role to ${member.user.tag}:`, error);
            // Continue to next member
          }
        }
      }

      await interaction.editReply({ content: `Role has been given to ${addedCount} bots.` });
    } catch (error) {
      console.error(error);
      await interaction.editReply({ content: 'An error occurred while processing the command.' });
    }
  },
};

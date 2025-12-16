const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription('Remove timeout from a member')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to un-timeout')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for removing the timeout')
        .setRequired(false)
    ),

  async execute(interaction) {
    console.log('Untimeout command executed by', interaction.user.tag);

    await interaction.deferReply(); // Defer public reply

    // Check if user has ModerateMembers permission
    if (!interaction.member.permissions.has('ModerateMembers')) {
      console.log('User does not have ModerateMembers permission');
      return await interaction.editReply({ content: 'You do not have permission to use this command. ModerateMembers permission required.' });
    }

    // Check if bot has ModerateMembers permission
    if (!interaction.guild.members.me.permissions.has('ModerateMembers')) {
      console.log('Bot does not have ModerateMembers permission');
      return await interaction.editReply({ content: 'Bot does not have permission to moderate members.' });
    }

    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    console.log(`Untimeout attempt: user=${user.tag}, reason=${reason}`);

    try {
      const member = await interaction.guild.members.fetch(user.id);
      console.log('Member fetched:', member.user.tag);

      // Cannot un-timeout yourself
      if (member.id === interaction.user.id) {
        console.log('Cannot un-timeout yourself');
        return await interaction.editReply({ content: 'You cannot un-timeout yourself.' });
      }

      // Check role hierarchy
      if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
        console.log('Role hierarchy check failed');
        return await interaction.editReply({ content: 'You cannot un-timeout a member with a higher or equal role.' });
      }

      // Remove timeout
      console.log('Removing timeout');
      await member.timeout(null, reason);
      console.log('Timeout removed successfully');
      await interaction.editReply({ content: `${user.tag} telah di-un-timeout. Alasan: ${reason}` });
    } catch (error) {
      console.error('Error in untimeout command:', error);
      if (error.code === 10007) {
        await interaction.editReply({ content: 'Member not found in this server.' });
      } else {
        await interaction.editReply({ content: 'An error occurred while un-timing out the member.' });
      }
    }
  },
};

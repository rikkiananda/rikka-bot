const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout or un-timeout a member')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to timeout')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('duration')
        .setDescription('Duration in minutes (0 to remove timeout)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(40320) // 28 days
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the timeout')
        .setRequired(false)
    ),

  async execute(interaction) {
    console.log('Timeout command executed by', interaction.user.tag);

    // Check if user has ModerateMembers permission
    if (!interaction.member.permissions.has('ModerateMembers')) {
      console.log('User does not have ModerateMembers permission');
      return await interaction.reply({ content: 'You do not have permission to use this command. ModerateMembers permission required.' });
    }

    // Check if bot has ModerateMembers permission
    if (!interaction.guild.members.me.permissions.has('ModerateMembers')) {
      console.log('Bot does not have ModerateMembers permission');
      return await interaction.reply({ content: 'Bot does not have permission to moderate members.' });
    }

    const user = interaction.options.getUser('user');
    const duration = interaction.options.getInteger('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    console.log(`Timeout attempt: user=${user.tag}, duration=${duration}, reason=${reason}`);

    try {
      const member = await interaction.guild.members.fetch(user.id);
      console.log('Member fetched:', member.user.tag);

      // Cannot timeout yourself
      if (member.id === interaction.user.id) {
        console.log('Cannot timeout yourself');
        return await interaction.reply({ content: 'You cannot timeout yourself.' });
      }

      // Check role hierarchy
      if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
        console.log('Role hierarchy check failed');
        return await interaction.reply({ content: 'You cannot timeout a member with a higher or equal role.' });
      }

      if (duration === 0) {
        // Remove timeout
        console.log('Removing timeout');
        await member.timeout(null, reason);
        console.log('Timeout removed successfully');
        await interaction.reply({ content: `${user.tag} telah di-un-timeout. Alasan: ${reason}` });
      } else {
        // Set timeout
        const ms = duration * 60 * 1000;
        console.log(`Setting timeout for ${ms} ms`);
        await member.timeout(ms, reason);
        console.log('Timeout set successfully');
        await interaction.reply({ content: `${user.tag} telah di-timeout selama ${duration} menit. Alasan: ${reason}` });
      }
    } catch (error) {
      console.error('Error in timeout command:', error);
      if (error.code === 10007) {
        await interaction.reply({ content: 'Member not found in this server.' });
      } else {
        await interaction.reply({ content: 'An error occurred while timing out the member.' });
      }
    }
  },
};

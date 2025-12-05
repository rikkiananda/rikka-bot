const { SlashCommandBuilder } = require('discord.js');
const { checkForNewSubmissions } = require('../typeformBot');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checksubmissions')
    .setDescription('Manually check for new Typeform submissions'),

  async execute(interaction) {
    // Check if user has admin permissions (you can adjust this)
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({ content: 'You need Administrator permissions to use this command.', ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      // Call the check function directly
      await checkForNewSubmissions(interaction.client);
      await interaction.editReply({ content: '✅ Checked for new submissions successfully.' });
    } catch (error) {
      console.error('Error in checksubmissions command:', error);
      await interaction.editReply({ content: '❌ Error checking submissions. Check console for details.' });
    }
  },
};

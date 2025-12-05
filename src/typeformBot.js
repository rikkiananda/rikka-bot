const fetch = require('node-fetch');
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Configuration from environment variables
const TYPEFORM_API_TOKEN = process.env.TYPEFORM_API_TOKEN;
const TYPEFORM_FORM_ID = process.env.TYPEFORM_FORM_ID;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

// File to store last submission ID
const LAST_SUBMISSION_FILE = path.join(__dirname, 'lastSubmissionId.txt');

// Function to get last submission ID
function getLastSubmissionId() {
  try {
    if (fs.existsSync(LAST_SUBMISSION_FILE)) {
      return fs.readFileSync(LAST_SUBMISSION_FILE, 'utf8').trim();
    }
  } catch (error) {
    console.error('Error reading last submission ID:', error);
  }
  return null;
}

// Function to save last submission ID
function saveLastSubmissionId(id) {
  try {
    fs.writeFileSync(LAST_SUBMISSION_FILE, id);
  } catch (error) {
    console.error('Error saving last submission ID:', error);
  }
}

// Function to fetch submissions from Typeform with retry logic
async function fetchTypeformSubmissions(retryCount = 0) {
  const url = `https://api.typeform.com/forms/${TYPEFORM_FORM_ID}/responses`;
  const headers = {
    'Authorization': `Bearer ${TYPEFORM_API_TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      if (response.status === 429 && retryCount < 1) {
        // Rate limit, wait 30 seconds and retry once
        console.log('Rate limited, retrying in 30 seconds...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        return fetchTypeformSubmissions(retryCount + 1);
      }
      throw new Error(`Typeform API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching Typeform submissions:', error.message);
    return [];
  }
}

// Function to send embed to Discord
async function sendEmbedToDiscord(client, submission) {
  const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
  if (!channel) {
    console.error('Discord channel not found');
    return;
  }

  // Extract applicant name and Discord tag if available
  let applicantName = 'Anonymous';
  let discordTag = '';
  if (submission.answers) {
    submission.answers.forEach(answer => {
      if (answer.field && answer.field.title.toLowerCase().includes('name')) {
        applicantName = answer.text || 'Anonymous';
      }
      if (answer.field && answer.field.title.toLowerCase().includes('discord')) {
        discordTag = answer.text || '';
      }
    });
  }

  const applicantDisplay = discordTag ? `${applicantName} (${discordTag})` : applicantName;

  // Build embed description with questions and answers
  let description = `Form: ${TYPEFORM_FORM_ID} • Link: https://form.typeform.com/to/${TYPEFORM_FORM_ID}\n\n`;
  if (submission.answers) {
    submission.answers.forEach((answer) => {
      const question = answer.field ? answer.field.title : 'Unknown Question';
      let answerText = '';

      if (answer.text) {
        answerText = answer.text;
      } else if (answer.choice && answer.choice.label) {
        answerText = answer.choice.label;
      } else if (answer.choices && answer.choices.labels) {
        answerText = answer.choices.labels.join(', ');
      } else if (answer.file_url) {
        answerText = answer.file_url;
      } else {
        answerText = 'No answer';
      }

      description += `**${question}:**\n${answerText}\n\n`;
    });
  }

  const embed = new EmbedBuilder()
    .setTitle('📥 New Recruitment Submission')
    .setDescription(description)
    .setColor('#00BFFF')
    .setTimestamp(new Date(submission.submitted_at))
    .setFooter({ text: 'Rikka Recruitment Bot' });

  // Add applicant field if name is available
  if (applicantName !== 'Anonymous') {
    embed.addFields({ name: 'Applicant', value: applicantDisplay, inline: true });
  }

  try {
    await channel.send({ embeds: [embed] });
    console.log(`Embed sent to Discord for submission ${submission.response_id}`);
  } catch (error) {
    console.error('Error sending embed to Discord:', error);
  }
}

// Main function to check for new submissions
async function checkForNewSubmissions(client) {
  console.log('Checking for new Typeform submissions...');
  const submissions = await fetchTypeformSubmissions();
  const lastId = getLastSubmissionId();

  if (submissions.length === 0) {
    console.log('No submissions found');
    return;
  }

  // Sort submissions by submitted_at descending (newest first)
  submissions.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

  // Find new submissions
  const newSubmissions = [];
  for (const submission of submissions) {
    if (submission.response_id === lastId) break;
    newSubmissions.push(submission);
  }

  // Process new submissions (in reverse order to send oldest first)
  for (const submission of newSubmissions.reverse()) {
    await sendEmbedToDiscord(client, submission);
  }

  // Update last submission ID
  if (submissions.length > 0) {
    saveLastSubmissionId(submissions[0].response_id);
  }
}

// Function to start the bot
function startTypeformBot(client) {
  // Check immediately on start
  checkForNewSubmissions(client);

  // Check every 15 seconds
  setInterval(() => {
    checkForNewSubmissions(client);
  }, 15 * 1000); // 15 seconds in milliseconds
}

module.exports = { startTypeformBot, checkForNewSubmissions };

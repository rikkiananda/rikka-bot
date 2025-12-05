const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

// Function to call OpenRouter API
async function callOpenRouter(message) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://discord-bot-rikka.vercel.app", // Optional
      "X-Title": "Rikka Discord Bot", // Optional
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "meta-llama/llama-3.2-3b-instruct:free",
      "messages": [
        {
          "role": "system",
      "content": "You are Rikka, a casual chat friend in Discord. Respond in short, natural, friendly sentences like chatting with a friend. Use emojis sparingly, max 1 per response. Keep responses 1-2 sentences max. No markdown, no embeds, no labels like 'User said' or 'Rikka replied'. Just respond directly as if chatting."
        },
        {
          "role": "user",
          "content": message
        }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenRouter API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Cooldown map: userId -> lastRequestTime
const userCooldowns = new Map();

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    // Ignore bot messages
    if (message.author.bot) return;

    // Only respond in the specific channel
    if (message.channel.id !== '1431761520655597599') return;

    // Check cooldown (2 seconds per user)
    const now = Date.now();
    const lastRequest = userCooldowns.get(message.author.id);
    if (lastRequest && now - lastRequest < 2000) {
      return; // Skip if within cooldown
    }
    userCooldowns.set(message.author.id, now);

    const maxRetries = 3;
    let attempt = 0;
    let success = false;

    try {
      const aiResponse = await callOpenRouter(message.content);

      // Clean the response to remove any unwanted labels
      const cleanResponse = aiResponse.split('\n').filter(line => !line.includes('User said:') && !line.includes('Rikka replied:')).join('\n').trim();

      // Reply with plain text
      await message.reply(cleanResponse);
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      await message.reply('Maaf, ada masalah nih. Coba lagi ya.');
    }
  },
};


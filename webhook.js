const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk parsing JSON
app.use(express.json());

// Endpoint untuk menangani webhook Typeform
app.post('/typeform', async (req, res) => {
  try {
    const { form_response } = req.body;

    if (!form_response || !form_response.answers) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    const answers = form_response.answers;
    const definition = form_response.definition;

    // Buat map field id ke title dari definition
    const fieldMap = {};
    if (definition && definition.fields) {
      definition.fields.forEach(field => {
        fieldMap[field.id] = field.title;
      });
    }

    // Buat pesan Discord yang rapi
    let content = '**📥 New Submission Received**\n';

    // Loop melalui semua jawaban dan ekstrak pertanyaan + jawaban
    answers.forEach(answer => {
      const question = fieldMap[answer.field.id] || 'Pertanyaan Tidak Diketahui';
      let answerText = '';

      // Handle berbagai tipe jawaban berdasarkan type
      if (answer.type === 'text' && answer.text) {
        answerText = answer.text;
      } else if (answer.type === 'email' && answer.email) {
        answerText = answer.email;
      } else if (answer.type === 'choice' && answer.choice && answer.choice.label) {
        answerText = answer.choice.label;
      } else if (answer.type === 'choices' && answer.choices && answer.choices.labels) {
        answerText = answer.choices.labels.join(', ');
      } else if (answer.type === 'number' && answer.number !== undefined) {
        answerText = answer.number.toString();
      } else if (answer.type === 'boolean' && answer.boolean !== undefined) {
        answerText = answer.boolean ? 'Ya' : 'Tidak';
      } else if (answer.type === 'date' && answer.date) {
        answerText = answer.date;
      } else if (answer.type === 'url' && answer.url) {
        answerText = answer.url;
      } else if (answer.type === 'file_url' && answer.file_url) {
        answerText = answer.file_url;
      } else {
        answerText = 'Tidak ada jawaban';
      }

      content += `- **${question}:** ${answerText}\n`;
    });

    // Kirim ke Discord Webhook
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!discordWebhookUrl) {
      console.error('DISCORD_WEBHOOK_URL tidak ditemukan di environment variables');
      return res.status(500).json({ error: 'Discord webhook URL not configured' });
    }

    const response = await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook error: ${response.status} ${response.statusText}`);
    }

    console.log('Submission berhasil dikirim ke Discord');
    res.status(200).json({ message: 'Submission processed successfully' });

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint health check
app.get('/', (req, res) => {
  res.json({ status: 'Typeform Webhook Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Typeform Webhook Server berjalan di port ${PORT}`);
});

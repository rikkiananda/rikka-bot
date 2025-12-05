# Discord.js Bot with Typeform Integration

Bot Discord yang terintegrasi dengan Typeform untuk otomatis mengirim hasil submission recruitment ke channel Discord.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Buat file `.env` di root directory dengan konfigurasi berikut:
   ```
   DISCORD_TOKEN=your_discord_bot_token_here
   TYPEFORM_API_TOKEN=your_typeform_api_token_here
   TYPEFORM_FORM_ID=SjZGH63V
   DISCORD_CHANNEL_ID=1433464643111882843
   CLIENT_ID=your_discord_client_id_here
   ```

3. Jalankan bot:
   ```bash
   node src/index.js
   ```

## Environment Variables

- `DISCORD_TOKEN`: Token bot Discord Anda
- `TYPEFORM_API_TOKEN`: API token dari Typeform (dapatkan dari https://admin.typeform.com/account)
- `TYPEFORM_FORM_ID`: ID form Typeform (SjZGH63V)
- `DISCORD_CHANNEL_ID`: ID channel Discord untuk mengirim embed (1433464643111882843)
- `CLIENT_ID`: Client ID Discord bot Anda

## Fitur

- Otomatis polling Typeform setiap 5 menit untuk submission baru
- Mengirim embed ke channel Discord dengan format yang rapi
- Deduplikasi submission berdasarkan response_id
- Error handling yang aman
- Command `/checksubmissions` untuk manual check (admin only)

## Struktur File

- `src/index.js`: Main bot file
- `src/typeformBot.js`: Logic untuk Typeform integration
- `src/commands/`: Folder untuk slash commands
- `src/lastSubmissionId.txt`: File untuk menyimpan ID submission terakhir

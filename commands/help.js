const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Shows all commands',

  async execute(message, args) {
    const embed = new EmbedBuilder()
      .setTitle('⚡ Nova AI — Command List')
      .setDescription('Your all-in-one AI assistant for Discord!\nPowered by advanced AI models 🧠')
      .setColor(0x9B59B6)
      .setThumbnail(message.client.user.displayAvatarURL())
      .addFields(
        {
          name: '🤖 AI Chat',
          value: [
            '`!ask [question]`',
            'Chat with advanced AI that remembers your full conversation.',
            'Gives detailed, thorough answers on any topic!',
            '**Example:** `!ask explain black holes`',
            '**Follow up:** `!ask tell me more`'
          ].join('\n')
        },
        {
          name: '🎨 Image Generation',
          value: [
            '`!imagine [prompt]`',
            'Generate stunning AI images from your text description.',
            '**Free:** Standard quality images',
            '**Premium 2:** High quality Stability AI images',
            '**Example:** `!imagine a dragon in space, cinematic`'
          ].join('\n')
        },
        {
          name: '🗑️ Clear Memory',
          value: [
            '`!clear`',
            'Clear your conversation history with Nova AI.',
            'Use this to start a fresh conversation!'
          ].join('\n')
        },
        {
          name: '📊 My Credits',
          value: [
            '`!credits`',
            'Check your remaining daily usage.',
            '**Free:** 20 asks + 3 images per day',
            '**Premium:** Unlimited everything!'
          ].join('\n')
        },
        {
          name: '💎 Premium',
          value: [
            '`!premium`',
            'View premium plans and upgrade your server!',
            '**Premium 1 — ₹500/month:** Unlimited asks + images (standard quality)',
            '**Premium 2 — ₹700/month:** Unlimited everything + HD images'
          ].join('\n')
        },
        {
          name: '📌 Tips',
          value: [
            '• Be descriptive with `!imagine` for better images',
            '• Use `!clear` when switching topics',
            '• Premium unlocks the whole server not just you!',
            '• Follow up questions make AI responses even better'
          ].join('\n')
        }
      )
      .setFooter({ text: 'Nova AI • Made with ❤️ • !help for commands' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};
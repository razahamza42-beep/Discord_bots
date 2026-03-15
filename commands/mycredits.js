const { EmbedBuilder } = require('discord.js');
const { getStats, isServerPremium } = require('./credits');

module.exports = {
  name: 'credits',
  description: 'Check your daily credits',

  async execute(message, args) {
    const stats = getStats(message.guild.id, message.author.id);

    const embed = new EmbedBuilder()
      .setTitle('📊 Your Daily Credits')
      .setColor(stats.premium ? 0xFFD700 : 0x3498DB)
      .addFields(
        {
          name: '🤖 AI Asks',
          value: `${stats.asks}/${stats.askLimit === 999999 ? '∞' : stats.askLimit} used`
        },
        {
          name: '🎨 Image Generations',
          value: `${stats.images}/${stats.imageLimit === 999999 ? '∞' : stats.imageLimit} used`
        },
        {
          name: '💎 Server Status',
          value: stats.premium ? '✅ Premium Server — Unlimited access for everyone!' : '🆓 Free Server — Ask your server owner to type `!premium` to upgrade!'
        }
      )
      .setFooter({ text: 'Credits reset every day at midnight' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};
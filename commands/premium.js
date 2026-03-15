const { EmbedBuilder } = require('discord.js');
const { getStats, setServerPremium, isServerPremium } = require('./credits');

module.exports = {
  name: 'premium',
  description: 'Premium info and upgrade',

  async execute(message, args) {
    const serverId = message.guild.id;
    const isPremium = isServerPremium(serverId);
    const stats = getStats(serverId, message.author.id);

    const embed = new EmbedBuilder()
      .setTitle('💎 Nova AI Premium')
      .setColor(isPremium ? 0xFFD700 : 0x9B59B6)
      .addFields(
        {
          name: '📊 Server Status',
          value: isPremium ? '✅ This server is Premium!' : '🆓 This server is on Free Tier'
        },
        {
          name: '🆓 Free Tier',
          value: '✅ 20 AI asks per user per day\n✅ 3 image generations per user per day\n✅ Basic image quality'
        },
        {
          name: '💎 Premium — ₹700/month',
          value: '✅ Unlimited AI asks for ALL users\n✅ Unlimited image generations for ALL users\n✅ Higher quality images\n✅ Priority responses\n\n💳 Contact us to upgrade!'
        },
        {
          name: '📩 How to Upgrade',
          value: 'DM the bot owner to pay ₹700/month via UPI and get your server unlocked instantly!'
        }
      )
      .setFooter({ text: 'Nova AI Premium • ₹700/month per server' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
};
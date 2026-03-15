const { setServerTier } = require('./credits');

const OWNER_ID = '1414983310387707984';

module.exports = {
  name: 'addpremium2',
  description: 'Admin only - upgrade server to premium2 with Stability AI',

  async execute(message, args) {
    if (message.author.id !== OWNER_ID) {
      return message.reply('❌ You are not authorized to use this command!');
    }

    const serverId = message.guild.id;
    setServerTier(serverId, 'premium2');

    await message.reply('✅ This server has been upgraded to **Nova AI Premium 2!** 🎉\n🎨 All users now have unlimited asks and stunning Stability AI images!');
  }
};
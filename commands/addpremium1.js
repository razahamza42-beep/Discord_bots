const { setServerTier } = require('./credits');

const OWNER_ID = '1414983310387707984';

module.exports = {
  name: 'addpremium1',
  description: 'Admin only - upgrade server to premium1',

  async execute(message, args) {
    if (message.author.id !== OWNER_ID) {
      return message.reply('❌ You are not authorized to use this command!');
    }

    const serverId = message.guild.id;
    setServerTier(serverId, 'premium1');

    await message.reply('✅ This server has been upgraded to **Nova AI Premium 1!** 🎉\n💬 All users now have unlimited asks and images with free model!');
  }
};
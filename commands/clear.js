module.exports = {
  name: 'clear',
  description: 'Clear your conversation history',

  async execute(message, args) {
    const { conversations } = require('./ai_chat');
    const userId = message.author.id;

    if (conversations[userId]) {
      conversations[userId] = [];
    }

    await message.reply('🗑️ Your conversation history has been cleared!');
  }
};
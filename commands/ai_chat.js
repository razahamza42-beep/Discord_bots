const Groq = require('groq-sdk');
const { canUse, increment } = require('./credits');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Store conversation history per user
const conversations = {};

module.exports = {
  name: 'ask',
  description: 'Chat with AI',
  conversations,

  async execute(message, args) {
    if (!args.length) {
      return message.reply('❌ Please ask something! Example: `!ask what is the sun?`');
    }

    const userQuestion = args.join(' ');
    const userId = message.author.id;
    const serverId = message.guild.id;

    // Check daily limit
    if (!canUse(serverId, userId, 'asks')) {
      return message.reply('❌ You have used all **20 free asks** for today!\n💎 Ask your server owner to type `!premium` to unlock unlimited access for everyone!');
    }
    increment(serverId, userId, 'asks');

    // Start conversation history if new user
    if (!conversations[userId]) {
      conversations[userId] = [];
    }

    // Add user message to history
    conversations[userId].push({
      role: 'user',
      content: userQuestion
    });

    try {
      await message.channel.sendTyping();

      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: `You are Nova AI, an extremely smart, detailed and friendly Discord bot assistant. You are like a genius friend who explains everything deeply.

Follow these rules strictly:
- Give LONG, DETAILED, THOROUGH answers — never give short or lazy replies
- Use emojis naturally to make responses engaging and fun
- Break answers into clear sections with line breaks for readability
- If user says "yes", "tell me more", "continue", "go on", "explain more" — dive MUCH deeper into the previous topic
- Always remember full conversation context and refer back naturally
- Explain complex topics step by step in simple language
- Give real world examples to illustrate points
- Share interesting facts and insights the user didn't ask for but would love
- At the end of every response suggest 3 specific follow up questions like:
  "💡 Want to go deeper? Ask me:
  1) [specific question related to topic]
  2) [specific question related to topic]  
  3) [specific question related to topic]"
- If someone asks something inappropriate, politely decline and redirect
- Be conversational, warm and engaging like a knowledgeable friend
- Never cut answers short — always give full complete explanations` },
          ...conversations[userId]
        ],
        max_tokens: 2048,
      });

      const reply = response.choices[0].message.content;

      // Save bot response to history
      conversations[userId].push({
        role: 'assistant',
        content: reply
      });

      // Split long responses into chunks
      if (reply.length > 1900) {
        const chunks = reply.match(/[\s\S]{1,1900}/g);
        for (const chunk of chunks) {
          await message.reply(chunk);
        }
      } else {
        await message.reply(`🤖 ${reply}`);
      }

    } catch (error) {
      console.error(error);
      message.reply('❌ AI error! Try again.');
    }
  }
};
const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

client.commands = new Collection();

// Load commands
const aiChat = require('./commands/ai_chat');
const aiImage = require('./commands/ai_image');
const help = require('./commands/help');
const premium = require('./commands/premium');
const mycredits = require('./commands/mycredits');
const addpremium1 = require('./commands/addpremium1');
const addpremium2 = require('./commands/addpremium2');
const clear = require('./commands/clear');

client.commands.set('ask', aiChat);
client.commands.set('imagine', aiImage);
client.commands.set('help', help);
client.commands.set('premium', premium);
client.commands.set('credits', mycredits);
client.commands.set('addpremium1', addpremium1);
client.commands.set('addpremium2', addpremium2);
client.commands.set('clear', clear);

// Bot ready
client.once('ready', () => {
  console.log(`✅ ${client.user.tag} is online and ready!`);
  client.user.setPresence({
    activities: [{
      name: '!help | Nova AI 🤖',
      type: 3
    }],
    status: 'online'
  });
});

// Message handler
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('❌ Something went wrong! Try again.');
  }
});

client.login(process.env.DISCORD_TOKEN);
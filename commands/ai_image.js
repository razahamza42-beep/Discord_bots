const { AttachmentBuilder } = require('discord.js');
const { canUse, increment, isServerPremium2 } = require('./credits');
const { filterMessage } = require('./filter');
const Groq = require('groq-sdk');
const https = require('https');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Auto enhance prompt using AI
async function enhancePrompt(prompt) {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an expert AI image prompt engineer. 
Take a simple prompt and rewrite it into a detailed, cinematic, high quality image generation prompt.
Add details like: lighting, style, mood, colors, quality tags.
Keep it under 200 words. Return ONLY the enhanced prompt, nothing else.`
        },
        {
          role: 'user',
          content: `Enhance this image prompt: ${prompt}`
        }
      ],
      max_tokens: 200,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    return prompt;
  }
}

// Cloudflare AI image generation
async function generateCloudflare(prompt) {
  const body = JSON.stringify({ prompt });
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      path: `/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        // Check if response is JSON error or actual image
        if (res.headers['content-type'] && res.headers['content-type'].includes('application/json')) {
          const error = JSON.parse(buffer.toString());
          reject(new Error(JSON.stringify(error)));
        } else {
          resolve(buffer);
        }
      });
      res.on('error', reject);
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Stability AI premium generation
async function generatePremium(prompt) {
  const body = JSON.stringify({
    text_prompts: [{ text: prompt, weight: 1 }],
    cfg_scale: 7,
    height: 1024,
    width: 1024,
    samples: 1,
    steps: 30,
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.stability.ai',
      path: '/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.STABILITY_KEY}`,
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const response = JSON.parse(Buffer.concat(chunks).toString());
        if (!response.artifacts || response.artifacts.length === 0) {
          reject(new Error('No image returned'));
        } else {
          resolve(Buffer.from(response.artifacts[0].base64, 'base64'));
        }
      });
      res.on('error', reject);
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = {
  name: 'imagine',
  description: 'Generate an AI image',

  async execute(message, args) {
    if (!args.length) {
      return message.reply('❌ Please describe an image! Example: `!imagine a dragon in space`');
    }

    const prompt = args.join(' ');
    const userId = message.author.id;
    const serverId = message.guild.id;

    // Content filter
    if (!filterMessage(prompt)) {
      return message.reply('❌ Your prompt contains inappropriate content! Please keep it clean. 🚫');
    }

    // Check daily limit
    if (!canUse(serverId, userId, 'images')) {
      return message.reply('❌ You have used all your free images for today!\n💎 Ask your server owner to type `!premium` to unlock unlimited images for everyone!');
    }
    increment(serverId, userId, 'images');

    try {
      await message.channel.sendTyping();
      const isPremium2 = isServerPremium2(serverId);

      const waitMsg = await message.reply(
        isPremium2
          ? '✨ Generating **premium quality** image, please wait...'
          : '🎨 Enhancing your prompt and generating image, please wait...'
      );

      // Enhance prompt with AI
      const enhancedPrompt = await enhancePrompt(prompt);
      console.log('Original:', prompt);
      console.log('Enhanced:', enhancedPrompt);

      const imageBuffer = isPremium2
        ? await generatePremium(enhancedPrompt)
        : await generateCloudflare(enhancedPrompt);

      await waitMsg.delete();

      const attachment = new AttachmentBuilder(imageBuffer, { name: 'image.png' });
      await message.reply({
        content: `🎨 **${prompt}**\n✨ *Enhanced & generated by Nova AI*${isPremium2 ? ' — Premium Quality' : ''}`,
        files: [attachment]
      });

    } catch (error) {
      console.error(error);
      message.reply('❌ Image generation failed! Try again.');
    }
  }
};
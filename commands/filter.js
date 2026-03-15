const bannedWords = [
  'porn', 'naked', 'nude', 'nsfw', 'sex', 'dick', 'pussy', 
  'ass', 'boobs', 'hentai', 'xxx', 'penis', 'vagina', 'cock',
  'rape', 'kill', 'murder', 'gore', 'blood', 'suicide', 'terrorist'
];

function isClean(prompt) {
  const lower = prompt.toLowerCase();
  return !bannedWords.some(word => lower.includes(word));
}

function filterMessage(prompt) {
  return isClean(prompt);
}

module.exports = { filterMessage };
const fs = require('fs');

const LIMITS = {
  free: { asks: 20, images: 3 },
  premium1: { asks: 999999, images: 999999 },
  premium2: { asks: 999999, images: 999999 }
};

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function loadData() {
  if (!fs.existsSync('./data.json')) {
    fs.writeFileSync('./data.json', JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync('./data.json'));
}

function saveData(data) {
  fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));
}

function getServerTier(serverId) {
  const data = loadData();
  if (!data.servers || !data.servers[serverId]) return 'free';
  return data.servers[serverId].tier || 'free';
}

function isServerPremium(serverId) {
  const tier = getServerTier(serverId);
  return tier === 'premium1' || tier === 'premium2';
}

function isServerPremium2(serverId) {
  return getServerTier(serverId) === 'premium2';
}

function getUser(serverId, userId) {
  const data = loadData();

  if (!data.servers) data.servers = {};
  if (!data.servers[serverId]) {
    data.servers[serverId] = { tier: 'free', users: {} };
  }
  if (!data.servers[serverId].users[userId]) {
    data.servers[serverId].users[userId] = {
      today: getToday(), asks: 0, images: 0
    };
  }

  const user = data.servers[serverId].users[userId];
  if (user.today !== getToday()) {
    user.today = getToday();
    user.asks = 0;
    user.images = 0;
  }

  saveData(data);
  return data.servers[serverId].users[userId];
}

function canUse(serverId, userId, type) {
  const tier = getServerTier(serverId);
  const user = getUser(serverId, userId);
  return user[type] < LIMITS[tier][type];
}

function increment(serverId, userId, type) {
  const tier = getServerTier(serverId);
  if (LIMITS[tier][type] === 999999) return;

  const data = loadData();
  data.servers[serverId].users[userId][type]++;
  saveData(data);
}

function setServerTier(serverId, tier) {
  const data = loadData();
  if (!data.servers) data.servers = {};
  if (!data.servers[serverId]) {
    data.servers[serverId] = { tier: 'free', users: {} };
  }
  data.servers[serverId].tier = tier;
  saveData(data);
}

function getStats(serverId, userId) {
  const tier = getServerTier(serverId);
  const user = getUser(serverId, userId);
  const limits = LIMITS[tier];
  return {
    tier,
    asks: user.asks,
    images: user.images,
    askLimit: limits.asks,
    imageLimit: limits.images
  };
}

module.exports = { canUse, increment, getStats, setServerTier, isServerPremium, isServerPremium2, getServerTier };
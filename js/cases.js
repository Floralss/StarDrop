// Real Telegram gifts + collectible NFTs (public catalogues)
const CASES = {
  nft: {
    id: 'nft', name: 'Кейс NFT', price: 2.5, color: '#a855f7',
    items: [
      { id: 'love_heart', name: 'Love Heart', emoji: '💙', rarity: 'common', value: 0.08, weight: 2200 },
      { id: 'teddy', name: 'Teddy Bear', emoji: '🧸', rarity: 'common', value: 0.08, weight: 2000 },
      { id: 'gift_box', name: 'Gift Box', emoji: '🎁', rarity: 'common', value: 0.12, weight: 1600 },
      { id: 'red_rose', name: 'Red Rose', emoji: '🌹', rarity: 'common', value: 0.12, weight: 1400 },
      { id: 'bday_cake', name: 'Birthday Cake', emoji: '🎂', rarity: 'uncommon', value: 0.25, weight: 900 },
      { id: 'gem', name: 'Gem', emoji: '💎', rarity: 'uncommon', value: 0.45, weight: 600 },
      { id: 'toy_bear', name: 'Toy Bear', emoji: '🐻', rarity: 'rare', value: 2.5, weight: 280 },
      { id: 'scared_cat', name: 'Scared Cat', emoji: '😿', rarity: 'rare', value: 3.0, weight: 200 },
      { id: 'loot_bag', name: 'Loot Bag', emoji: '🛍️', rarity: 'rare', value: 4.0, weight: 150 },
      { id: 'swiss_watch', name: 'Swiss Watch', emoji: '⌚', rarity: 'epic', value: 12.0, weight: 60 },
      { id: 'heart_locket', name: 'Heart Locket', emoji: '💟', rarity: 'epic', value: 18.0, weight: 40 },
      { id: 'durov_cap', name: "Durov's Cap", emoji: '🧢', rarity: 'legendary', value: 45.0, weight: 12 },
      { id: 'precious_peach', name: 'Precious Peach', emoji: '🍑', rarity: 'legendary', value: 55.0, weight: 8 },
      { id: 'plush_pepe', name: 'Plush Pepe', emoji: '🐸', rarity: 'mythic', value: 120.0, weight: 3 },
      { id: 'durov_glasses', name: "Durov's Glasses", emoji: '🕶️', rarity: 'mythic', value: 250.0, weight: 1 }
    ]
  },
  bear: {
    id: 'bear', name: 'Кейс Мишка', price: 0.8, color: '#f97316',
    items: [
      { id: 'teddy', name: 'Teddy Bear', emoji: '🧸', rarity: 'common', value: 0.08, weight: 3000 },
      { id: 'love_heart', name: 'Love Heart', emoji: '💙', rarity: 'common', value: 0.08, weight: 2500 },
      { id: 'cookie_heart', name: 'Cookie Heart', emoji: '🍪', rarity: 'common', value: 0.1, weight: 1500 },
      { id: 'jelly_bunny', name: 'Jelly Bunny', emoji: '🐰', rarity: 'uncommon', value: 0.2, weight: 700 },
      { id: 'bunny_muffin', name: 'Bunny Muffin', emoji: '🧁', rarity: 'uncommon', value: 0.3, weight: 500 },
      { id: 'toy_bear', name: 'Toy Bear', emoji: '🐻', rarity: 'rare', value: 2.5, weight: 200 },
      { id: 'plush_pepe_s', name: 'Plush Pepe', emoji: '🐸', rarity: 'epic', value: 15.0, weight: 25 },
      { id: 'white_toy', name: 'Toy Bear (White)', emoji: '🐻‍❄️', rarity: 'legendary', value: 35.0, weight: 5 }
    ]
  },
  mecha: {
    id: 'mecha', name: 'Кейс MechaGram', price: 5.0, color: '#8b5cf6',
    items: [
      { id: 'love_heart', name: 'Love Heart', emoji: '💙', rarity: 'common', value: 0.08, weight: 1500 },
      { id: 'teddy', name: 'Teddy Bear', emoji: '🧸', rarity: 'common', value: 0.08, weight: 1400 },
      { id: 'gift_box', name: 'Gift Box', emoji: '🎁', rarity: 'common', value: 0.12, weight: 1200 },
      { id: 'red_rose', name: 'Red Rose', emoji: '🌹', rarity: 'common', value: 0.12, weight: 1000 },
      { id: 'bday_cake', name: 'Birthday Cake', emoji: '🎂', rarity: 'uncommon', value: 0.25, weight: 700 },
      { id: 'gem', name: 'Gem', emoji: '💎', rarity: 'uncommon', value: 0.45, weight: 500 },
      { id: 'party_spark', name: 'Party Sparkler', emoji: '✨', rarity: 'uncommon', value: 0.35, weight: 400 },
      { id: 'toy_bear', name: 'Toy Bear', emoji: '🐻', rarity: 'rare', value: 2.5, weight: 250 },
      { id: 'scared_cat', name: 'Scared Cat', emoji: '😿', rarity: 'rare', value: 3.0, weight: 180 },
      { id: 'loot_bag', name: 'Loot Bag', emoji: '🛍️', rarity: 'rare', value: 4.0, weight: 150 },
      { id: 'ion_gem', name: 'Ion Gem', emoji: '💠', rarity: 'epic', value: 10.0, weight: 70 },
      { id: 'mini_oscar', name: 'Mini Oscar', emoji: '🏆', rarity: 'epic', value: 12.0, weight: 50 },
      { id: 'heroic_helmet', name: 'Heroic Helmet', emoji: '⛑️', rarity: 'epic', value: 15.0, weight: 40 },
      { id: 'swiss_watch', name: 'Swiss Watch', emoji: '⌚', rarity: 'legendary', value: 25.0, weight: 20 },
      { id: 'heart_locket', name: 'Heart Locket', emoji: '💟', rarity: 'legendary', value: 30.0, weight: 12 },
      { id: 'durov_cap', name: "Durov's Cap", emoji: '🧢', rarity: 'legendary', value: 45.0, weight: 8 },
      { id: 'plush_pepe', name: 'Plush Pepe', emoji: '🐸', rarity: 'mythic', value: 120.0, weight: 2 },
      { id: 'durov_glasses', name: "Durov's Glasses", emoji: '🕶️', rarity: 'mythic', value: 250.0, weight: 1 }
    ]
  }
};

function getItemChances(caseId) {
  const caseData = CASES[caseId];
  if (!caseData) return [];
  const total = caseData.items.reduce((s, i) => s + i.weight, 0);
  return caseData.items.map(item => ({ ...item, chance: (item.weight / total) * 100 })).sort((a, b) => b.chance - a.chance);
}

function rollItem(caseId) {
  const caseData = CASES[caseId];
  if (!caseData) return null;
  const totalWeight = caseData.items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of caseData.items) {
    random -= item.weight;
    if (random <= 0) return { ...item };
  }
  return { ...caseData.items[0] };
}

function generateRouletteItems(caseId, winner, count = 50) {
  const caseData = CASES[caseId];
  const items = [];
  const winIndex = Math.floor(count * 0.7);
  for (let i = 0; i < count; i++) {
    if (i === winIndex) items.push({ ...winner, isWinner: true });
    else items.push({ ...caseData.items[Math.floor(Math.random() * caseData.items.length)], isWinner: false });
  }
  return { items, winIndex };
}

window.CASES = CASES;
window.rollItem = rollItem;
window.generateRouletteItems = generateRouletteItems;
window.getItemChances = getItemChances;

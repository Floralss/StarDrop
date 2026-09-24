// Case definitions — low NFT odds, higher for bears/hearts

const CASES = {
  nft: {
    id: 'nft',
    name: 'Кейс NFT',
    price: 2.5,
    color: '#a855f7',
    items: [
      { id: 'stars_5', name: '5 Stars', emoji: '⭐', rarity: 'common', value: 0.05, weight: 2800 },
      { id: 'stars_10', name: '10 Stars', emoji: '✨', rarity: 'common', value: 0.1, weight: 2000 },
      { id: 'heart', name: 'Love Heart', emoji: '❤️', rarity: 'common', value: 0.08, weight: 1500 },
      { id: 'rose', name: 'Red Rose', emoji: '🌹', rarity: 'common', value: 0.12, weight: 1200 },
      { id: 'cake', name: 'Birthday Cake', emoji: '🎂', rarity: 'uncommon', value: 0.25, weight: 800 },
      { id: 'box', name: 'Gift Box', emoji: '🎁', rarity: 'uncommon', value: 0.3, weight: 700 },
      { id: 'stars_50', name: '50 Stars', emoji: '🌟', rarity: 'uncommon', value: 0.5, weight: 500 },
      { id: 'nft_common', name: 'NFT Gift (Common)', emoji: '💎', rarity: 'rare', value: 1.2, weight: 400 },
      { id: 'stars_100', name: '100 Stars', emoji: '💫', rarity: 'rare', value: 1.0, weight: 300 },
      { id: 'nft_rare', name: 'NFT Gift (Rare)', emoji: '💠', rarity: 'epic', value: 4.0, weight: 120 },
      { id: 'nft_epic', name: 'NFT Gift (Epic)', emoji: '🔮', rarity: 'legendary', value: 12.0, weight: 40 },
      { id: 'nft_legendary', name: 'NFT Gift (Legendary)', emoji: '👑', rarity: 'mythic', value: 45.0, weight: 8 },
      { id: 'nft_mythic', name: 'NFT Mythic (Durov)', emoji: '🕶️', rarity: 'mythic', value: 200.0, weight: 2 }
    ]
  },
  bear: {
    id: 'bear',
    name: 'Кейс Мишка',
    price: 0.8,
    color: '#f97316',
    items: [
      { id: 'teddy', name: 'Teddy Bear', emoji: '🧸', rarity: 'common', value: 0.1, weight: 3200 },
      { id: 'heart_bear', name: 'Heart + Bear', emoji: '🐻❤️', rarity: 'common', value: 0.12, weight: 2500 },
      { id: 'brown_bear', name: 'Brown Bear', emoji: '🐻', rarity: 'common', value: 0.15, weight: 1800 },
      { id: 'love_heart', name: 'Love Heart', emoji: '💕', rarity: 'common', value: 0.08, weight: 1500 },
      { id: 'fluffy', name: 'Fluffy Bear', emoji: '🐻‍❄️', rarity: 'uncommon', value: 0.35, weight: 600 },
      { id: 'stars_bear', name: 'Stars + Bear', emoji: '⭐🧸', rarity: 'uncommon', value: 0.4, weight: 400 },
      { id: 'white_bear', name: 'White Plush Bear', emoji: '🤍🧸', rarity: 'rare', value: 1.5, weight: 150 },
      { id: 'nft_bear', name: 'NFT White Fluffy Bear', emoji: '🐻‍❄️✨', rarity: 'epic', value: 8.0, weight: 30 },
      { id: 'nft_bear_leg', name: 'NFT Legendary Bear', emoji: '👑🐻', rarity: 'legendary', value: 35.0, weight: 5 }
    ]
  },
  mecha: {
    id: 'mecha',
    name: 'Кейс MechaGram',
    price: 5.0,
    color: '#8b5cf6',
    items: [
      { id: 'stars_20', name: '20 Stars', emoji: '⭐', rarity: 'common', value: 0.2, weight: 2000 },
      { id: 'stars_50', name: '50 Stars', emoji: '✨', rarity: 'common', value: 0.5, weight: 1500 },
      { id: 'teddy_m', name: 'Teddy Bear', emoji: '🧸', rarity: 'common', value: 0.15, weight: 1200 },
      { id: 'heart_m', name: 'Love Heart', emoji: '❤️', rarity: 'common', value: 0.1, weight: 1000 },
      { id: 'rose_m', name: 'Red Rose', emoji: '🌹', rarity: 'common', value: 0.15, weight: 800 },
      { id: 'cake_m', name: 'Cake', emoji: '🎂', rarity: 'uncommon', value: 0.4, weight: 600 },
      { id: 'box_m', name: 'Gift Box', emoji: '🎁', rarity: 'uncommon', value: 0.5, weight: 500 },
      { id: 'stars_200', name: '200 Stars', emoji: '🌟', rarity: 'rare', value: 2.0, weight: 300 },
      { id: 'nft_c', name: 'NFT Common', emoji: '💎', rarity: 'rare', value: 2.5, weight: 200 },
      { id: 'mecha_part', name: 'Mecha Part', emoji: '⚙️', rarity: 'epic', value: 6.0, weight: 80 },
      { id: 'nft_r', name: 'NFT Rare', emoji: '💠', rarity: 'epic', value: 8.0, weight: 50 },
      { id: 'nft_e', name: 'NFT Epic', emoji: '🔮', rarity: 'legendary', value: 25.0, weight: 15 },
      { id: 'mecha_full', name: 'Full Mecha Suit', emoji: '🤖', rarity: 'legendary', value: 40.0, weight: 8 },
      { id: 'nft_l', name: 'NFT Legendary', emoji: '👑', rarity: 'mythic', value: 80.0, weight: 3 },
      { id: 'nft_myth', name: 'NFT Mythic Collection', emoji: '🕶️', rarity: 'mythic', value: 250.0, weight: 1 }
    ]
  }
};

function getItemChances(caseId) {
  const caseData = CASES[caseId];
  if (!caseData) return [];
  const total = caseData.items.reduce((s, i) => s + i.weight, 0);
  return caseData.items.map(item => ({
    ...item,
    chance: (item.weight / total) * 100
  })).sort((a, b) => b.chance - a.chance);
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

/**
 * Build roulette strip. Winner is placed at winIndex.
 * Returns items array and winIndex.
 */
function generateRouletteItems(caseId, winner, count = 60) {
  const caseData = CASES[caseId];
  const items = [];
  const winIndex = Math.floor(count * 0.72);
  for (let i = 0; i < count; i++) {
    if (i === winIndex) {
      items.push({ ...winner, isWinner: true });
    } else {
      const filler = caseData.items[Math.floor(Math.random() * caseData.items.length)];
      items.push({ ...filler, isWinner: false });
    }
  }
  return { items, winIndex };
}

window.CASES = CASES;
window.rollItem = rollItem;
window.generateRouletteItems = generateRouletteItems;
window.getItemChances = getItemChances;

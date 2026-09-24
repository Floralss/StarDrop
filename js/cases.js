// Real Telegram gifts — prices ~ Fragment floor (TON), NFT labeled (random)
// CDN: https://cdn.jsdelivr.net/gh/ssamy2/TG_Photos@main/webp/by_name/{short}.webp

const CDN = 'https://cdn.jsdelivr.net/gh/ssamy2/TG_Photos@main/webp/by_name/';

const G = (id, name, emoji, rarity, value, weight, shortName) => ({
  id, name, emoji, rarity, value, weight,
  short: shortName || id,
  img: CDN + (shortName || id) + '.webp'
});

const CASES = {
  nft: {
    id: 'nft', name: 'Кейс NFT', price: 2.5, color: '#a855f7',
    items: [
      // commons / stars-like
      G('love_heart','Love Heart','💙','common',0.05,2200,'love_heart'),
      G('teddy','Teddy Bear','🧸','common',0.05,2000,'teddy_bear'),
      G('gift_box','Gift Box','🎁','common',0.08,1600,'gift_box'),
      G('red_rose','Red Rose','🌹','common',0.08,1400,'red_rose'),
      G('bday_cake','Birthday Cake','🎂','uncommon',0.15,900,'birthday_cake'),
      G('cookie_heart','Cookie Heart','🍪','uncommon',0.12,700,'cookie_heart'),
      G('party_spark','Party Sparkler','✨','uncommon',0.15,600,'party_sparkler'),
      G('gem','Gem','💎','uncommon',0.25,500,'gem'),
      // mid NFT floors (random traits)
      G('toy_bear','Toy Bear (random)','🐻','rare',39,80,'toy_bear'),
      G('swiss_watch','Swiss Watch (random)','⌚','rare',59,55,'swiss_watch'),
      G('perfume','Perfume Bottle (random)','🧴','rare',80,40,'perfume_bottle'),
      G('scared_cat','Scared Cat (random)','😿','epic',279,18,'scared_cat'),
      G('loot_bag','Loot Bag (random)','🛍️','epic',148,25,'loot_bag'),
      G('astral_shard','Astral Shard (random)','✦','epic',130,22,'astral_shard'),
      G('heroic_helmet','Heroic Helmet (random)','⛑️','epic',205,14,'heroic_helmet'),
      G('signet_ring','Gem Signet (random)','💍','epic',73,30,'gem_signet'),
      G('precious_peach','Precious Peach (random)','🍑','legendary',322,8,'precious_peach'),
      G('durov_cap',"Durov's Cap (random)",'🧢','legendary',444,6,'durovs_cap'),
      G('heart_locket','Heart Locket (random)','💟','legendary',1379,3,'heart_locket'),
      G('durov_glasses',"Durov's Glasses (random)",'🕶️','mythic',2500,1,'durovs_glasses'),
      G('plush_pepe','Plush Pepe (random)','🐸','mythic',6666,1,'plush_pepe')
    ]
  },
  bear: {
    id: 'bear', name: 'Кейс Мишка', price: 0.8, color: '#f97316',
    items: [
      G('teddy','Teddy Bear','🧸','common',0.05,3200,'teddy_bear'),
      G('love_heart','Love Heart','💙','common',0.05,2800,'love_heart'),
      G('cookie_heart','Cookie Heart','🍪','common',0.08,1600,'cookie_heart'),
      G('jelly_bunny','Jelly Bunny','🐰','uncommon',0.15,800,'jelly_bunny'),
      G('bunny_muffin','Bunny Muffin','🧁','uncommon',0.2,500,'bunny_muffin'),
      G('ice_cream','Ice Cream','🍦','uncommon',0.18,450,'ice_cream'),
      G('toy_bear','Toy Bear (random)','🐻','rare',39,90,'toy_bear'),
      G('scared_cat','Scared Cat (random)','😿','rare',279,12,'scared_cat'),
      G('kissed_frog','Kissed Frog (random)','🐸','rare',52,40,'kissed_frog'),
      G('voodoo_doll','Voodoo Doll (random)','🪆','epic',38,50,'voodoo_doll'),
      G('plush_pepe','Plush Pepe (random)','🐸','legendary',6666,1,'plush_pepe'),
      G('white_toy','Toy Bear (random)','🐻‍❄️','legendary',39,8,'toy_bear')
    ]
  },
  mecha: {
    id: 'mecha', name: 'Кейс MechaGram', price: 5.0, color: '#8b5cf6',
    items: [
      G('love_heart','Love Heart','💙','common',0.05,1400,'love_heart'),
      G('teddy','Teddy Bear','🧸','common',0.05,1300,'teddy_bear'),
      G('gift_box','Gift Box','🎁','common',0.08,1100,'gift_box'),
      G('red_rose','Red Rose','🌹','common',0.08,1000,'red_rose'),
      G('bday_cake','Birthday Cake','🎂','uncommon',0.15,700,'birthday_cake'),
      G('gem','Gem','💎','uncommon',0.25,550,'gem'),
      G('jingle_bells','Jingle Bells','🔔','uncommon',0.2,400,'jingle_bells'),
      G('santa_hat','Santa Hat','🎅','uncommon',0.25,350,'santa_hat'),
      G('toy_bear','Toy Bear (random)','🐻','rare',39,100,'toy_bear'),
      G('swiss_watch','Swiss Watch (random)','⌚','rare',59,70,'swiss_watch'),
      G('loot_bag','Loot Bag (random)','🛍️','rare',148,35,'loot_bag'),
      G('perfume','Perfume Bottle (random)','🧴','epic',80,40,'perfume_bottle'),
      G('scared_cat','Scared Cat (random)','😿','epic',279,15,'scared_cat'),
      G('heroic_helmet','Heroic Helmet (random)','⛑️','epic',205,18,'heroic_helmet'),
      G('durov_cap',"Durov's Cap (random)",'🧢','legendary',444,8,'durovs_cap'),
      G('precious_peach','Precious Peach (random)','🍑','legendary',322,10,'precious_peach'),
      G('heart_locket','Heart Locket (random)','💟','legendary',1379,3,'heart_locket'),
      G('durov_glasses',"Durov's Glasses (random)",'🕶️','mythic',2500,2,'durovs_glasses'),
      G('plush_pepe','Plush Pepe (random)','🐸','mythic',6666,1,'plush_pepe')
    ]
  }
};

function rollItem(caseId) {
  const c = CASES[caseId];
  if (!c) return null;
  const total = c.items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const it of c.items) {
    r -= it.weight;
    if (r <= 0) return { ...it };
  }
  return { ...c.items[c.items.length - 1] };
}

function getCaseOdds(caseId) {
  const c = CASES[caseId];
  if (!c) return [];
  const total = c.items.reduce((s, i) => s + i.weight, 0);
  return c.items.map(i => ({
    ...i,
    chance: ((i.weight / total) * 100)
  })).sort((a, b) => b.value - a.value);
}

window.CASES = CASES;
window.rollItem = rollItem;
window.getCaseOdds = getCaseOdds;

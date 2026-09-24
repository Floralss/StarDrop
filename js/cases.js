// Real Telegram gifts with CDN images from public TG_Photos repo
// https://cdn.jsdelivr.net/gh/ssamy2/TG_Photos@main/webp/by_name/{short}.webp

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
      G('love_heart','Love Heart','💙','common',0.08,1800,'love_heart'),
      G('teddy','Teddy Bear','🧸','common',0.08,1700,'teddy_bear'),
      G('gift_box','Gift Box','🎁','common',0.12,1400,'gift_box'),
      G('red_rose','Red Rose','🌹','common',0.12,1200,'red_rose'),
      G('bday_cake','Birthday Cake','🎂','uncommon',0.25,800,'birthday_cake'),
      G('gem','Gem','💎','uncommon',0.4,600,'gem'),
      G('cookie_heart','Cookie Heart','🍪','uncommon',0.15,500,'cookie_heart'),
      G('party_spark','Party Sparkler','✨','uncommon',0.2,400,'party_sparkler'),
      G('toy_bear','Toy Bear','🐻','rare',2.5,220,'toy_bear'),
      G('scared_cat','Scared Cat','😿','rare',3.0,180,'scared_cat'),
      G('loot_bag','Loot Bag','🛍️','rare',4.0,140,'loot_bag'),
      G('spy_agaric','Spy Agaric','🍄','rare',2.0,120,'spy_agaric'),
      G('evil_eye','Evil Eye','🧿','rare',1.8,110,'evil_eye'),
      G('ion_gem','Ion Gem','💠','epic',10.0,55,'ion_gem'),
      G('mini_oscar','Mini Oscar','🏆','epic',12.0,45,'mini_oscar'),
      G('swiss_watch','Swiss Watch','⌚','epic',15.0,40,'swiss_watch'),
      G('perfume','Perfume Bottle','🧴','epic',11.0,35,'perfume_bottle'),
      G('heroic_helmet','Heroic Helmet','⛑️','epic',18.0,30,'heroic_helmet'),
      G('heart_locket','Heart Locket','💟','legendary',35.0,12,'heart_locket'),
      G('durov_cap',"Durov's Cap",'🧢','legendary',45.0,8,'durovs_cap'),
      G('precious_peach','Precious Peach','🍑','legendary',55.0,6,'precious_peach'),
      G('signet_ring','Gem Signet','💍','legendary',28.0,10,'gem_signet'),
      G('plush_pepe','Plush Pepe','🐸','mythic',150.0,2,'plush_pepe'),
      G('durov_glasses',"Durov's Glasses",'🕶️','mythic',280.0,1,'durovs_glasses')
    ]
  },
  bear: {
    id: 'bear', name: 'Кейс Мишка', price: 0.8, color: '#f97316',
    items: [
      G('teddy','Teddy Bear','🧸','common',0.08,2800,'teddy_bear'),
      G('love_heart','Love Heart','💙','common',0.08,2400,'love_heart'),
      G('cookie_heart','Cookie Heart','🍪','common',0.1,1400,'cookie_heart'),
      G('jelly_bunny','Jelly Bunny','🐰','uncommon',0.2,700,'jelly_bunny'),
      G('bunny_muffin','Bunny Muffin','🧁','uncommon',0.3,450,'bunny_muffin'),
      G('ice_cream','Ice Cream','🍦','uncommon',0.25,400,'ice_cream'),
      G('toy_bear','Toy Bear','🐻','rare',2.5,180,'toy_bear'),
      G('scared_cat','Scared Cat','😿','rare',3.0,100,'scared_cat'),
      G('kissed_frog','Kissed Frog','🐸','rare',2.2,90,'kissed_frog'),
      G('voodoo_doll','Voodoo Doll','🪆','epic',8.0,25,'voodoo_doll'),
      G('plush_pepe','Plush Pepe','🐸','legendary',40.0,6,'plush_pepe'),
      G('white_toy','Toy Bear','🐻‍❄️','legendary',35.0,4,'toy_bear')
    ]
  },
  mecha: {
    id: 'mecha', name: 'Кейс MechaGram', price: 5.0, color: '#8b5cf6',
    items: [
      G('love_heart','Love Heart','💙','common',0.08,1200,'love_heart'),
      G('teddy','Teddy Bear','🧸','common',0.08,1100,'teddy_bear'),
      G('gift_box','Gift Box','🎁','common',0.12,1000,'gift_box'),
      G('red_rose','Red Rose','🌹','common',0.12,900,'red_rose'),
      G('bday_cake','Birthday Cake','🎂','uncommon',0.25,600,'birthday_cake'),
      G('gem','Gem','💎','uncommon',0.4,500,'gem'),
      G('jingle_bells','Jingle Bells','🔔','uncommon',0.3,350,'jingle_bells'),
      G('santa_hat','Santa Hat','🎅','uncommon',0.35,300,'santa_hat'),
      G('toy_bear','Toy Bear','🐻','rare',2.5,200,'toy_bear'),
      G('scared_cat','Scared Cat','😿','rare',3.0,160,'scared_cat'),
      G('loot_bag','Loot Bag','🛍️','rare',4.0,140,'loot_bag'),
      G('neko_helmet','Neko Helmet','😺','rare',3.5,120,'neko_helmet'),
      G('crystal_ball','Crystal Ball','🔮','rare',2.8,110,'crystal_ball'),
      G('ion_gem','Ion Gem','💠','epic',10.0,55,'ion_gem'),
      G('mini_oscar','Mini Oscar','🏆','epic',12.0,45,'mini_oscar'),
      G('swiss_watch','Swiss Watch','⌚','epic',15.0,40,'swiss_watch'),
      G('genie_lamp','Genie Lamp','🪔','epic',14.0,35,'genie_lamp'),
      G('heroic_helmet','Heroic Helmet','⛑️','epic',18.0,30,'heroic_helmet'),
      G('mighty_arm','Mighty Arm','💪','epic',16.0,28,'mighty_arm'),
      G('astral_shard','Astral Shard','✦','epic',13.0,32,'astral_shard'),
      G('heart_locket','Heart Locket','💟','legendary',35.0,12,'heart_locket'),
      G('durov_cap',"Durov's Cap",'🧢','legendary',45.0,8,'durovs_cap'),
      G('precious_peach','Precious Peach','🍑','legendary',55.0,6,'precious_peach'),
      G('khabib',"Khabib's Papakha",'🎩','legendary',40.0,7,'khabibs_papakha'),
      G('diamond_ring','Diamond Ring','💍','legendary',32.0,9,'diamond_ring'),
      G('plush_pepe','Plush Pepe','🐸','mythic',150.0,2,'plush_pepe'),
      G('durov_glasses',"Durov's Glasses",'🕶️','mythic',280.0,1,'durovs_glasses')
    ]
  }
};

function getItemChances(caseId) {
  const c = CASES[caseId]; if (!c) return [];
  const total = c.items.reduce((s,i)=>s+i.weight,0);
  return c.items.map(i=>({...i, chance:(i.weight/total)*100})).sort((a,b)=>b.chance-a.chance);
}
function rollItem(caseId) {
  const c = CASES[caseId]; if (!c) return null;
  const tw = c.items.reduce((s,i)=>s+i.weight,0);
  let r = Math.random()*tw;
  for (const i of c.items) { r-=i.weight; if (r<=0) return {...i}; }
  return {...c.items[0]};
}
function generateRouletteItems(caseId, winner, count=50) {
  const c = CASES[caseId];
  const items=[], winIndex=Math.floor(count*0.7);
  for (let i=0;i<count;i++) {
    if (i===winIndex) items.push({...winner,isWinner:true});
    else items.push({...c.items[Math.floor(Math.random()*c.items.length)],isWinner:false});
  }
  return {items, winIndex};
}

/** Visual: real TG gift image with emoji fallback */
function itemVisual(item, size) {
  const sz = size || '';
  const img = item.img || (item.short ? CDN + item.short + '.webp' : '');
  const emoji = item.emoji || '🎁';
  if (img) {
    return '<span class="item-vis ' + sz + '" style="--rc:var(--r-' + (item.rarity||'common') + ')">' +
      '<img class="item-img" src="' + img + '" alt="' + (item.name||'') + '" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'inline\'"/>' +
      '<span class="item-emoji" style="display:none">' + emoji + '</span></span>';
  }
  return '<span class="item-vis ' + sz + '" style="--rc:var(--r-' + (item.rarity||'common') + ')"><span class="item-emoji">' + emoji + '</span></span>';
}

window.CASES=CASES; window.CDN=CDN;
window.rollItem=rollItem; window.generateRouletteItems=generateRouletteItems;
window.getItemChances=getItemChances; window.itemVisual=itemVisual;

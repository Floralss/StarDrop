// Mini-games: Mines (effects), Rocket, Gift Upgrade Wheel

const MinesGame = {
  active: false, bet: 0, bombs: 5, grid: [], revealed: 0, bombSet: new Set(), mult: 1,

  calcMult(revealed, bombs, total = 25) {
    const safe = total - bombs;
    if (revealed === 0) return 1;
    let m = 1;
    for (let i = 0; i < revealed; i++) m *= (total - i) / (safe - i);
    return Math.max(1, m * 0.95);
  },

  start(bet, bombs) {
    this.bet = bet; this.bombs = bombs; this.revealed = 0; this.mult = 1; this.active = true;
    this.bombSet = new Set();
    while (this.bombSet.size < bombs) this.bombSet.add(Math.floor(Math.random() * 25));
    this.grid = Array(25).fill(null);
    this.render();
    document.getElementById('mines-start').disabled = true;
    document.getElementById('mines-cashout').classList.add('hidden');
    this.updateInfo();
  },

  render() {
    const el = document.getElementById('mines-grid');
    el.innerHTML = '';
    for (let i = 0; i < 25; i++) {
      const cell = document.createElement('div');
      cell.className = 'mine-cell';
      cell.dataset.idx = i;
      if (this.grid[i] === 'safe') {
        cell.classList.add('revealed', 'safe');
        cell.innerHTML = '<span class="mine-gem">💎</span>';
      } else if (this.grid[i] === 'bomb') {
        cell.classList.add('revealed', 'bomb');
        cell.innerHTML = '<span class="mine-bomb">💣</span>';
      } else if (!this.active) cell.classList.add('disabled');
      cell.addEventListener('click', () => this.click(i));
      el.appendChild(cell);
    }
  },

  click(idx) {
    if (!this.active || this.grid[idx]) return;
    if (this.bombSet.has(idx)) {
      this.grid[idx] = 'bomb';
      this.bombSet.forEach(b => { this.grid[b] = 'bomb'; });
      this.active = false;
      this.render();
      this.explode(idx);
      document.getElementById('mines-start').disabled = false;
      document.getElementById('mines-cashout').classList.add('hidden');
      showToast('💥 БУМ! Ставка потеряна', 'error');
      if (typeof onMinesLose === 'function') onMinesLose();
      return;
    }
    this.grid[idx] = 'safe';
    this.revealed++;
    this.mult = this.calcMult(this.revealed, this.bombs);
    this.render();
    this.updateInfo();
    document.getElementById('mines-cashout').classList.remove('hidden');
  },

  explode(idx) {
    document.body.classList.add('screen-shake');
    setTimeout(() => document.body.classList.remove('screen-shake'), 600);
    let flash = document.getElementById('explode-flash');
    if (!flash) { flash = document.createElement('div'); flash.id = 'explode-flash'; document.body.appendChild(flash); }
    flash.className = 'explode-flash';
    setTimeout(() => { flash.className = ''; }, 500);
    const cells = document.querySelectorAll('.mine-cell');
    if (cells[idx]) cells[idx].classList.add('boom-anim');
  },

  updateInfo() {
    document.getElementById('mines-mult').textContent = this.mult.toFixed(2) + 'x';
    document.getElementById('mines-profit').textContent = 'Прибыль: ' + (this.bet * this.mult - this.bet).toFixed(2) + ' TON';
  },

  cashout() {
    if (!this.active || this.revealed === 0) return;
    const win = this.bet * this.mult;
    this.active = false;
    document.getElementById('mines-start').disabled = false;
    document.getElementById('mines-cashout').classList.add('hidden');
    this.render();
    if (typeof onMinesWin === 'function') onMinesWin(win);
  }
};

const RocketGame = {
  active: false, bet: 0, mult: 1, crashAt: 0, timer: null,

  start(bet) {
    this.bet = bet; this.mult = 1; this.active = true;
    const r = Math.random();
    this.crashAt = r < 0.5 ? 1 + Math.random() * 1.5 : 1 + Math.random() * 8;
    document.getElementById('rocket-start').classList.add('hidden');
    document.getElementById('rocket-cashout').classList.remove('hidden');
    document.getElementById('rocket-ship').style.bottom = '20px';
    document.getElementById('rocket-ship').textContent = '🚀';
    this.tick();
  },

  tick() {
    if (!this.active) return;
    this.mult += 0.02 + this.mult * 0.008;
    document.getElementById('rocket-mult').textContent = this.mult.toFixed(2) + 'x';
    document.getElementById('rocket-ship').style.bottom = Math.min(160, 20 + (this.mult - 1) * 25) + 'px';
    if (this.mult >= this.crashAt) { this.crash(); return; }
    this.timer = setTimeout(() => this.tick(), 80);
  },

  cashout() {
    if (!this.active) return;
    clearTimeout(this.timer); this.active = false;
    const win = this.bet * this.mult;
    document.getElementById('rocket-start').classList.remove('hidden');
    document.getElementById('rocket-cashout').classList.add('hidden');
    if (typeof onRocketWin === 'function') onRocketWin(win);
  },

  crash() {
    clearTimeout(this.timer); this.active = false;
    document.getElementById('rocket-ship').textContent = '💥';
    document.body.classList.add('screen-shake');
    setTimeout(() => document.body.classList.remove('screen-shake'), 500);
    document.getElementById('rocket-start').classList.remove('hidden');
    document.getElementById('rocket-cashout').classList.add('hidden');
    showToast('Ракета взорвалась!', 'error');
    setTimeout(() => {
      document.getElementById('rocket-ship').textContent = '🚀';
      document.getElementById('rocket-ship').style.bottom = '20px';
      document.getElementById('rocket-mult').textContent = '1.00x';
    }, 1500);
    if (typeof onRocketLose === 'function') onRocketLose();
  }
};

const GiftUpgrade = {
  spinning: false,
  upgradeMap: {
    common: [
      { name: 'Fluffy Bear', emoji: '🐻‍❄️', rarity: 'uncommon', value: 0.35 },
      { name: '50 Stars', emoji: '🌟', rarity: 'uncommon', value: 0.5 },
      { name: 'Gift Box', emoji: '🎁', rarity: 'uncommon', value: 0.3 }
    ],
    uncommon: [
      { name: 'White Plush Bear', emoji: '🤍🧸', rarity: 'rare', value: 1.5 },
      { name: 'NFT Common', emoji: '💎', rarity: 'rare', value: 1.2 },
      { name: '100 Stars', emoji: '💫', rarity: 'rare', value: 1.0 }
    ],
    rare: [
      { name: 'NFT Rare', emoji: '💠', rarity: 'epic', value: 4.0 },
      { name: 'NFT White Fluffy Bear', emoji: '🐻‍❄️✨', rarity: 'epic', value: 8.0 },
      { name: 'Mecha Part', emoji: '⚙️', rarity: 'epic', value: 6.0 }
    ],
    epic: [
      { name: 'NFT Epic', emoji: '🔮', rarity: 'legendary', value: 12.0 },
      { name: 'Full Mecha Suit', emoji: '🤖', rarity: 'legendary', value: 40.0 },
      { name: 'NFT Legendary Bear', emoji: '👑🐻', rarity: 'legendary', value: 35.0 }
    ],
    legendary: [
      { name: 'NFT Legendary', emoji: '👑', rarity: 'mythic', value: 80.0 },
      { name: 'NFT Mythic (Durov)', emoji: '🕶️', rarity: 'mythic', value: 200.0 }
    ],
    mythic: [
      { name: 'NFT Mythic Collection', emoji: '🕶️', rarity: 'mythic', value: 250.0 }
    ]
  },
  successChance: { common: 0.55, uncommon: 0.45, rare: 0.35, epic: 0.25, legendary: 0.15, mythic: 0.08 },

  getTargets(rarity) { return this.upgradeMap[rarity] || this.upgradeMap.common; },

  async spin(item, itemIndex) {
    if (this.spinning) return;
    this.spinning = true;
    const chance = this.successChance[item.rarity] || 0.4;
    const success = Math.random() < chance;
    const targets = this.getTargets(item.rarity);
    const resultItem = success
      ? { ...targets[Math.floor(Math.random() * targets.length)], id: 'up_' + Date.now(), wonAt: new Date().toISOString() }
      : null;

    const segments = [];
    targets.forEach(t => segments.push({ ...t, type: 'win' }));
    const failCount = Math.max(2, Math.round(segments.length * (1 - chance) / Math.max(chance, 0.1)));
    for (let i = 0; i < failCount; i++) segments.push({ name: 'СГОРЕЛ', emoji: '🔥', rarity: 'fail', type: 'fail' });

    this.renderWheel(segments);
    await this.animateWheel(segments, success, resultItem);
    this.spinning = false;
    if (typeof onGiftUpgradeDone === 'function') onGiftUpgradeDone(success, resultItem, itemIndex);
  },

  renderWheel(segments) {
    const wheel = document.getElementById('upgrade-wheel');
    if (!wheel) return;
    const n = segments.length;
    const angle = 360 / n;
    const colors = ['#7c5cff', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7', '#06b6d4', '#f97316'];
    let html = '';
    segments.forEach((s, i) => {
      const rot = i * angle;
      const col = s.type === 'fail' ? '#ef4444' : colors[i % colors.length];
      html += '<div class="wheel-seg" style="transform:rotate(' + rot + 'deg);--seg-color:' + col + '"><span class="wheel-seg-label" style="transform:rotate(' + (angle/2) + 'deg) translateY(-78px)">' + s.emoji + '</span></div>';
    });
    wheel.innerHTML = html;
    wheel.style.transform = 'rotate(0deg)';
  },

  animateWheel(segments, success, resultItem) {
    return new Promise(resolve => {
      const wheel = document.getElementById('upgrade-wheel');
      const n = segments.length;
      const angle = 360 / n;
      let targetIdx;
      if (success && resultItem) {
        targetIdx = segments.findIndex(s => s.type === 'win' && s.name === resultItem.name);
        if (targetIdx < 0) targetIdx = segments.findIndex(s => s.type === 'win');
      } else {
        targetIdx = segments.findIndex(s => s.type === 'fail');
      }
      if (targetIdx < 0) targetIdx = 0;
      const segmentCenter = targetIdx * angle + angle / 2;
      const finalRot = 360 * 6 + (360 - segmentCenter);
      wheel.style.transition = 'none';
      wheel.style.transform = 'rotate(0deg)';
      wheel.offsetHeight;
      wheel.style.transition = 'transform 4.5s cubic-bezier(0.12, 0.8, 0.15, 1)';
      wheel.style.transform = 'rotate(' + finalRot + 'deg)';
      setTimeout(() => {
        const res = document.getElementById('upgrade-wheel-result');
        if (res) {
          if (success && resultItem) {
            res.innerHTML = '<span class="up-win">' + resultItem.emoji + ' ' + resultItem.name + '</span>';
            res.className = 'upgrade-wheel-result win';
          } else {
            res.innerHTML = '<span class="up-lose">🔥 Предмет сгорел</span>';
            res.className = 'upgrade-wheel-result lose';
          }
        }
        resolve();
      }, 4600);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => {
      const g = card.dataset.game;
      document.getElementById('games-menu').classList.add('hidden');
      document.querySelectorAll('.game-view').forEach(v => v.classList.remove('active'));
      const view = document.getElementById('game-' + g);
      if (view) view.classList.add('active');
      if (g === 'mines') { MinesGame.active = false; MinesGame.grid = Array(25).fill(null); MinesGame.render(); }
      if (g === 'upgrade' && typeof fillUpgradeInventory === 'function') fillUpgradeInventory();
    });
  });
  ['mines', 'rocket', 'upgrade'].forEach(g => {
    const btn = document.getElementById('back-' + g);
    if (btn) btn.addEventListener('click', () => {
      document.querySelectorAll('.game-view').forEach(v => v.classList.remove('active'));
      document.getElementById('games-menu').classList.remove('hidden');
    });
  });
});

window.MinesGame = MinesGame;
window.RocketGame = RocketGame;
window.GiftUpgrade = GiftUpgrade;

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

// Catalog of upgrade targets (gifts you can aim for)
const UPGRADE_TARGETS = [
  { id: 'gift_box', name: 'Gift Box', emoji: '🎁', rarity: 'uncommon', value: 0.5 },
  { id: 'gem', name: 'Gem', emoji: '💎', rarity: 'uncommon', value: 0.8 },
  { id: 'toy_bear', name: 'Toy Bear', emoji: '🐻', rarity: 'rare', value: 2.5 },
  { id: 'scared_cat', name: 'Scared Cat', emoji: '😿', rarity: 'rare', value: 3.5 },
  { id: 'loot_bag', name: 'Loot Bag', emoji: '🛍️', rarity: 'rare', value: 5.0 },
  { id: 'neko_helmet', name: 'Neko Helmet', emoji: '😺', rarity: 'rare', value: 4.0 },
  { id: 'ion_gem', name: 'Ion Gem', emoji: '💠', rarity: 'epic', value: 12.0 },
  { id: 'mini_oscar', name: 'Mini Oscar', emoji: '🏆', rarity: 'epic', value: 15.0 },
  { id: 'swiss_watch', name: 'Swiss Watch', emoji: '⌚', rarity: 'epic', value: 20.0 },
  { id: 'heroic_helmet', name: 'Heroic Helmet', emoji: '⛑️', rarity: 'epic', value: 22.0 },
  { id: 'heart_locket', name: 'Heart Locket', emoji: '💟', rarity: 'legendary', value: 40.0 },
  { id: 'durov_cap', name: "Durov's Cap", emoji: '🧢', rarity: 'legendary', value: 55.0 },
  { id: 'precious_peach', name: 'Precious Peach', emoji: '🍑', rarity: 'legendary', value: 70.0 },
  { id: 'plush_pepe', name: 'Plush Pepe', emoji: '🐸', rarity: 'mythic', value: 150.0 },
  { id: 'durov_glasses', name: "Durov's Glasses", emoji: '🕶️', rarity: 'mythic', value: 300.0 }
];

const GiftUpgrade = {
  spinning: false,
  selectedStake: new Set(), // inventory indices
  selectedTarget: null,

  getStakeValue(inventory) {
    let v = 0;
    this.selectedStake.forEach(i => {
      if (inventory[i]) v += inventory[i].value || 0;
    });
    return v;
  },

  // Chance = stake / target * 100, capped 1-85%, house edge ~8%
  calcChance(stakeVal, targetVal) {
    if (!targetVal || targetVal <= 0 || stakeVal <= 0) return 0;
    let raw = (stakeVal / targetVal) * 100 * 0.92;
    return Math.max(0, Math.min(85, raw));
  },

  updateUI(inventory) {
    const stakeVal = this.getStakeValue(inventory);
    const targetVal = this.selectedTarget ? this.selectedTarget.value : 0;
    const chance = this.calcChance(stakeVal, targetVal);
    document.getElementById('cs-stake-value').textContent = stakeVal.toFixed(2);
    document.getElementById('cs-target-value').textContent = targetVal.toFixed(2);
    document.getElementById('cs-chance-num').textContent = chance.toFixed(1) + '%';
    // Ring fill: 534 = full circumference
    const circ = 534;
    const offset = circ - (circ * chance / 100);
    const fill = document.getElementById('cs-ring-fill');
    fill.style.strokeDashoffset = offset;
    // Color by chance
    if (chance < 20) fill.style.stroke = '#ef4444';
    else if (chance < 45) fill.style.stroke = '#f59e0b';
    else fill.style.stroke = '#22c55e';
  },

  renderStake(inventory) {
    const el = document.getElementById('cs-stake-list');
    if (!inventory.length) {
      el.innerHTML = '<p class="empty-state" style="padding:20px;grid-column:1/-1">Инвентарь пуст</p>';
      return;
    }
    el.innerHTML = inventory.map((item, i) => {
      const sel = this.selectedStake.has(i) ? ' selected' : '';
      return `<div class="cs-item${sel}" data-idx="${i}">
        <span class="ci-emoji">${item.emoji}</span>
        <div class="ci-name">${item.name}</div>
        <div class="ci-val">${(item.value||0).toFixed(2)}</div>
      </div>`;
    }).join('');
    el.querySelectorAll('.cs-item').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.idx, 10);
        if (this.selectedStake.has(idx)) this.selectedStake.delete(idx);
        else this.selectedStake.add(idx);
        this.renderStake(inventory);
        this.updateUI(inventory);
      });
    });
  },

  renderTargets() {
    const el = document.getElementById('cs-target-list');
    el.innerHTML = UPGRADE_TARGETS.map((t, i) => {
      const sel = this.selectedTarget && this.selectedTarget.id === t.id ? ' selected' : '';
      return `<div class="cs-item${sel}" data-ti="${i}">
        <span class="ci-emoji">${t.emoji}</span>
        <div class="ci-name">${t.name}</div>
        <div class="ci-val">${t.value.toFixed(2)}</div>
      </div>`;
    }).join('');
    el.querySelectorAll('.cs-item').forEach(card => {
      card.addEventListener('click', () => {
        const i = parseInt(card.dataset.ti, 10);
        this.selectedTarget = UPGRADE_TARGETS[i];
        this.renderTargets();
        if (typeof userData !== 'undefined') this.updateUI(userData.inventory || []);
      });
    });
  },

  async play(inventory) {
    if (this.spinning) return null;
    const stakeVal = this.getStakeValue(inventory);
    if (this.selectedStake.size === 0) { showToast('Выбери предметы для ставки', 'error'); return null; }
    if (!this.selectedTarget) { showToast('Выбери цель', 'error'); return null; }
    if (stakeVal <= 0) { showToast('Ставка пуста', 'error'); return null; }

    const chance = this.calcChance(stakeVal, this.selectedTarget.value);
    if (chance < 1) { showToast('Шанс слишком низкий — добавь предметы', 'error'); return null; }

    this.spinning = true;
    document.getElementById('upgrade-go').disabled = true;
    document.getElementById('cs-upgrade-result').textContent = '';
    document.getElementById('cs-upgrade-result').className = 'cs-upgrade-result';

    const win = Math.random() * 100 < chance;

    // Animate spin marker
    const spinEl = document.getElementById('cs-ring-spin');
    // Land in win zone (top portion = chance%) or lose zone
    // Full circle 360deg. Win zone is first `chance` percent from pointer.
    // We spin multiple turns then land.
    const baseSpins = 5 * 360;
    let landAngle;
    if (win) {
      // land somewhere in the success arc (0 to chance% of 360)
      landAngle = Math.random() * (chance / 100) * 360;
    } else {
      landAngle = (chance / 100) * 360 + Math.random() * ((100 - chance) / 100) * 360;
    }
    const endDeg = baseSpins + landAngle;
    spinEl.style.setProperty('--spin-end', endDeg + 'deg');
    spinEl.classList.remove('spinning');
    spinEl.offsetHeight;
    spinEl.classList.add('spinning');

    await new Promise(r => setTimeout(r, 4200));
    spinEl.classList.remove('spinning');

    this.spinning = false;
    document.getElementById('upgrade-go').disabled = false;

    const res = document.getElementById('cs-upgrade-result');
    if (win) {
      res.textContent = '✓ ' + this.selectedTarget.emoji + ' ' + this.selectedTarget.name;
      res.className = 'cs-upgrade-result win';
    } else {
      res.textContent = '✗ Предметы сгорели';
      res.className = 'cs-upgrade-result lose';
      document.body.classList.add('screen-shake');
      setTimeout(() => document.body.classList.remove('screen-shake'), 400);
    }

    // Return result for app.js to update inventory
    const stakeIndices = [...this.selectedStake].sort((a,b) => b - a); // remove high indices first
    const target = win ? { ...this.selectedTarget, id: 'up_' + Date.now(), wonAt: new Date().toISOString() } : null;
    this.selectedStake.clear();
    return { win, target, stakeIndices };
  }
};

window.UPGRADE_TARGETS = UPGRADE_TARGETS;
window.GiftUpgrade = GiftUpgrade;

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

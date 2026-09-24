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
    spinEl.style.strokeDasharray = '28 506';
    spinEl.style.opacity = '1';
    spinEl.style.setProperty('--spin-end', endDeg + 'deg');
    spinEl.classList.remove('spinning');
    spinEl.offsetHeight;
    spinEl.classList.add('spinning');
    setTimeout(() => { spinEl.style.opacity = '0.9'; }, 4200);

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


// Find Pepe: 3 tries, 1 pepe on grid, mult x4/x8/x16
const PepeGame = {
  active: false,
  tries: 3,
  pepeIndex: -1,
  cells: 25,
  mult: 4,
  bet: 0,
  found: false,

  start(bet, mult) {
    this.bet = bet;
    this.mult = mult;
    this.cells = mult === 4 ? 25 : mult === 8 ? 50 : 100;
    this.tries = 3;
    this.found = false;
    this.active = true;
    this.pepeIndex = Math.floor(Math.random() * this.cells);
    this.render();
    document.getElementById('pepe-tries').textContent = '3';
    document.getElementById('pepe-result').textContent = '';
    document.getElementById('pepe-result').className = 'cs-upgrade-result';
  },

  render() {
    const g = document.getElementById('pepe-grid');
    if (!g) return;
    const cols = this.cells <= 25 ? 5 : this.cells <= 50 ? 10 : 10;
    g.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
    g.className = 'pepe-grid' + (this.cells > 50 ? ' pepe-dense' : '');
    let html = '';
    for (let i = 0; i < this.cells; i++) {
      html += '<button class="pepe-cell" data-i="' + i + '"></button>';
    }
    g.innerHTML = html;
    g.querySelectorAll('.pepe-cell').forEach(btn => {
      btn.addEventListener('click', () => this.click(parseInt(btn.dataset.i, 10), btn));
    });
  },

  click(i, btn) {
    if (!this.active || this.found || btn.classList.contains('open')) return;
    btn.classList.add('open');
    if (i === this.pepeIndex) {
      btn.classList.add('pepe-win');
      btn.textContent = '🐸';
      this.found = true;
      this.active = false;
      // reveal all empty
      document.querySelectorAll('.pepe-cell:not(.open)').forEach(c => {
        c.classList.add('open');
        c.textContent = '·';
      });
      const win = this.bet * this.mult;
      document.getElementById('pepe-result').textContent = '🐸 Нашёл! +' + win.toFixed(2) + ' TON';
      document.getElementById('pepe-result').className = 'cs-upgrade-result win';
      if (typeof onPepeWin === 'function') onPepeWin(win);
    } else {
      btn.textContent = '❌';
      btn.classList.add('pepe-miss');
      this.tries--;
      document.getElementById('pepe-tries').textContent = String(this.tries);
      if (this.tries <= 0) {
        this.active = false;
        // show pepe
        const cells = document.querySelectorAll('.pepe-cell');
        if (cells[this.pepeIndex]) {
          cells[this.pepeIndex].classList.add('open', 'pepe-win');
          cells[this.pepeIndex].textContent = '🐸';
        }
        document.getElementById('pepe-result').textContent = 'Не нашёл… −' + this.bet.toFixed(2) + ' TON';
        document.getElementById('pepe-result').className = 'cs-upgrade-result lose';
        if (typeof onPepeLose === 'function') onPepeLose();
      }
    }
  }
};
window.PepeGame = PepeGame;


// Plinko — ball drops through pegs into multiplier slots
const PlinkoGame = {
  dropping: false,
  rows: 10,
  risk: 'med',
  // multipliers by risk (11 slots for 10 rows)
  multis: {
    low:  [1.5, 1.2, 1.1, 1.0, 0.5, 0.3, 0.5, 1.0, 1.1, 1.2, 1.5],
    med:  [5.0, 2.0, 1.5, 1.0, 0.5, 0.3, 0.5, 1.0, 1.5, 2.0, 5.0],
    high: [15, 5.0, 2.0, 0.5, 0.2, 0.1, 0.2, 0.5, 2.0, 5.0, 15]
  },

  renderSlots() {
    const m = this.multis[this.risk] || this.multis.med;
    const el = document.getElementById('plinko-slots');
    if (!el) return;
    el.innerHTML = m.map((v, i) => {
      const cls = v >= 5 ? 'slot-hot' : v >= 1.5 ? 'slot-warm' : v < 0.5 ? 'slot-cold' : '';
      return '<div class="plinko-slot ' + cls + '">x' + v + '</div>';
    }).join('');
  },

  drawBoard(highlightSlot) {
    const canvas = document.getElementById('plinko-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const rows = this.rows;
    const top = 30, bottom = H - 40;
    const usable = bottom - top;
    this.pegs = [];
    for (let r = 0; r < rows; r++) {
      const n = r + 3;
      const y = top + (usable * (r + 1) / (rows + 1));
      const spacing = Math.min(36, (W - 40) / (n + 1));
      const startX = (W - (n - 1) * spacing) / 2;
      for (let i = 0; i < n; i++) {
        const x = startX + i * spacing;
        this.pegs.push({ x, y, r: 5 });
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#7c5cff';
        ctx.shadowColor = 'rgba(124,92,255,0.6)';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  },

  async drop(bet) {
    if (this.dropping) return null;
    this.dropping = true;
    this.risk = document.getElementById('plinko-risk')?.value || 'med';
    this.renderSlots();
    this.drawBoard();

    const canvas = document.getElementById('plinko-canvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const multis = this.multis[this.risk];
    const slots = multis.length;

    // Path: random left/right at each row → binomial slot
    let path = 0;
    for (let i = 0; i < this.rows; i++) {
      path += Math.random() < 0.5 ? 0 : 1;
    }
    // path is 0..rows, map to slot 0..slots-1
    const slot = Math.min(slots - 1, Math.round(path * (slots - 1) / this.rows));

    // Animate ball
    let x = W / 2, y = 12;
    const ballR = 7;
    const steps = 50 + this.rows * 8;
    let step = 0;

    // Precompute key points along path
    const targets = [{ x: W / 2, y: 12 }];
    let colBias = 0;
    for (let r = 0; r < this.rows; r++) {
      const goRight = (path > r) ? (Math.random() > 0.35) : (Math.random() > 0.65);
      // simpler: distribute path
      colBias = Math.round((path / this.rows) * (r + 1));
      const n = r + 3;
      const spacing = Math.min(36, (W - 40) / (n + 1));
      const startX = (W - (n - 1) * spacing) / 2;
      const pegIdx = Math.min(n - 1, Math.max(0, Math.round((path / this.rows) * (n - 1))));
      const px = startX + pegIdx * spacing + (Math.random() - 0.5) * 8;
      const py = 30 + ((H - 70) * (r + 1) / (this.rows + 1));
      targets.push({ x: px, y: py });
    }
    // final slot center
    const slotW = W / slots;
    targets.push({ x: slotW * (slot + 0.5), y: H - 20 });

    return new Promise(resolve => {
      const animate = () => {
        step++;
        const t = Math.min(1, step / steps);
        // ease
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const segCount = targets.length - 1;
        const f = ease * segCount;
        const si = Math.min(segCount - 1, Math.floor(f));
        const local = f - si;
        const a = targets[si], b = targets[si + 1];
        x = a.x + (b.x - a.x) * local;
        y = a.y + (b.y - a.y) * local;
        // bounce offset
        x += Math.sin(step * 0.8) * 2 * (1 - t);

        this.drawBoard();
        ctx.beginPath();
        ctx.arc(x, y, ballR, 0, Math.PI * 2);
        ctx.fillStyle = '#f0abfc';
        ctx.shadowColor = '#e879f9';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          this.dropping = false;
          // highlight slot
          const slotEls = document.querySelectorAll('.plinko-slot');
          slotEls.forEach((el, i) => el.classList.toggle('slot-win', i === slot));
          const mult = multis[slot];
          resolve({ slot, mult, win: bet * mult });
        }
      };
      requestAnimationFrame(animate);
    });
  }
};
window.PlinkoGame = PlinkoGame;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('plinko-risk')?.addEventListener('change', e => {
    PlinkoGame.risk = e.target.value;
    PlinkoGame.renderSlots();
    PlinkoGame.drawBoard();
  });

  document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => {
      const g = card.dataset.game;
      document.getElementById('games-menu').classList.add('hidden');
      document.querySelectorAll('.game-view').forEach(v => v.classList.remove('active'));
      const view = document.getElementById('game-' + g);
      if (view) view.classList.add('active');
      if (g === 'mines') { MinesGame.active = false; MinesGame.grid = Array(25).fill(null); MinesGame.render(); }
      if (g === 'upgrade' && typeof fillUpgradeInventory === 'function') fillUpgradeInventory();
      if (g === 'pepe') { PepeGame.active = false; document.getElementById('pepe-grid').innerHTML = ''; document.getElementById('pepe-result').textContent = ''; }
      if (g === 'plinko') { PlinkoGame.risk = document.getElementById('plinko-risk')?.value || 'med'; PlinkoGame.renderSlots(); PlinkoGame.drawBoard(); }
    });
  });
  ['mines', 'rocket', 'upgrade', 'pepe', 'plinko'].forEach(g => {
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

// Mini-games: Mines, Rocket, Upgrade

const MinesGame = {
  active: false,
  bet: 0,
  bombs: 5,
  grid: [],
  revealed: 0,
  bombSet: new Set(),
  mult: 1,

  calcMult(revealed, bombs, total = 25) {
    // Simple progressive multiplier
    const safe = total - bombs;
    if (revealed === 0) return 1;
    let m = 1;
    for (let i = 0; i < revealed; i++) {
      m *= (total - i) / (safe - i);
    }
    // house edge ~5%
    return Math.max(1, m * 0.95);
  },

  start(bet, bombs) {
    this.bet = bet;
    this.bombs = bombs;
    this.revealed = 0;
    this.mult = 1;
    this.active = true;
    this.bombSet = new Set();
    while (this.bombSet.size < bombs) {
      this.bombSet.add(Math.floor(Math.random() * 25));
    }
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
        cell.textContent = '💎';
      } else if (this.grid[i] === 'bomb') {
        cell.classList.add('revealed', 'bomb');
        cell.textContent = '💣';
      } else if (!this.active) {
        cell.classList.add('disabled');
      }
      cell.addEventListener('click', () => this.click(i));
      el.appendChild(cell);
    }
  },

  click(idx) {
    if (!this.active || this.grid[idx]) return;
    if (this.bombSet.has(idx)) {
      this.grid[idx] = 'bomb';
      // reveal all bombs
      this.bombSet.forEach(b => { this.grid[b] = 'bomb'; });
      this.active = false;
      this.render();
      document.getElementById('mines-start').disabled = false;
      document.getElementById('mines-cashout').classList.add('hidden');
      showToast('Бум! Ставка потеряна', 'error');
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

  updateInfo() {
    document.getElementById('mines-mult').textContent = this.mult.toFixed(2) + 'x';
    const profit = (this.bet * this.mult - this.bet).toFixed(2);
    document.getElementById('mines-profit').textContent = 'Прибыль: ' + profit + ' TON';
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
  active: false,
  bet: 0,
  mult: 1,
  crashAt: 0,
  timer: null,

  start(bet) {
    this.bet = bet;
    this.mult = 1;
    this.active = true;
    // Crash point: house edge, most crash early
    const r = Math.random();
    this.crashAt = r < 0.5 ? 1 + Math.random() * 1.5 : 1 + Math.random() * 8;
    document.getElementById('rocket-start').classList.add('hidden');
    document.getElementById('rocket-cashout').classList.remove('hidden');
    document.getElementById('rocket-ship').style.bottom = '20px';
    this.tick();
  },

  tick() {
    if (!this.active) return;
    this.mult += 0.02 + this.mult * 0.008;
    document.getElementById('rocket-mult').textContent = this.mult.toFixed(2) + 'x';
    const bottom = Math.min(160, 20 + (this.mult - 1) * 25);
    document.getElementById('rocket-ship').style.bottom = bottom + 'px';

    if (this.mult >= this.crashAt) {
      this.crash();
      return;
    }
    this.timer = setTimeout(() => this.tick(), 80);
  },

  cashout() {
    if (!this.active) return;
    clearTimeout(this.timer);
    this.active = false;
    const win = this.bet * this.mult;
    document.getElementById('rocket-start').classList.remove('hidden');
    document.getElementById('rocket-cashout').classList.add('hidden');
    if (typeof onRocketWin === 'function') onRocketWin(win);
  },

  crash() {
    clearTimeout(this.timer);
    this.active = false;
    document.getElementById('rocket-ship').textContent = '💥';
    document.getElementById('rocket-start').classList.remove('hidden');
    document.getElementById('rocket-cashout').classList.add('hidden');
    showToast('Ракета взорвалась! Ставка потеряна', 'error');
    setTimeout(() => {
      document.getElementById('rocket-ship').textContent = '🚀';
      document.getElementById('rocket-ship').style.bottom = '20px';
      document.getElementById('rocket-mult').textContent = '1.00x';
    }, 1500);
    if (typeof onRocketLose === 'function') onRocketLose();
  }
};

const UpgradeGame = {
  getMultiplier(chance) {
    // RTP ~92%
    return (100 / chance) * 0.92;
  },

  play(bet, chance) {
    const mult = this.getMultiplier(chance);
    const win = Math.random() * 100 < chance;
    if (win) {
      const amount = bet * mult;
      if (typeof onUpgradeWin === 'function') onUpgradeWin(amount, mult);
      return { win: true, amount, mult };
    }
    if (typeof onUpgradeLose === 'function') onUpgradeLose();
    return { win: false, amount: 0, mult };
  }
};

// UI wiring for games menu
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => {
      const g = card.dataset.game;
      document.getElementById('games-menu').classList.add('hidden');
      document.querySelectorAll('.game-view').forEach(v => v.classList.remove('active'));
      document.getElementById('game-' + g).classList.add('active');
      if (g === 'mines') {
        // init empty grid
        MinesGame.active = false;
        MinesGame.grid = Array(25).fill(null);
        MinesGame.render();
      }
    });
  });

  ['mines', 'rocket', 'upgrade'].forEach(g => {
    const btn = document.getElementById('back-' + g);
    if (btn) btn.addEventListener('click', () => {
      document.querySelectorAll('.game-view').forEach(v => v.classList.remove('active'));
      document.getElementById('games-menu').classList.remove('hidden');
    });
  });

  // Upgrade range
  const range = document.getElementById('upgrade-chance-range');
  if (range) {
    range.addEventListener('input', () => {
      const c = +range.value;
      document.getElementById('upgrade-chance-label').textContent = c + '%';
      document.getElementById('upgrade-bar').style.width = c + '%';
      const m = UpgradeGame.getMultiplier(c);
      document.getElementById('upgrade-chance-text').textContent = c + '% → x' + m.toFixed(2);
    });
  }
});

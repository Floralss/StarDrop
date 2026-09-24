// StarDrop App — cases, requests, admin, games, leaderboard
const ADMIN_EMAIL = 'strepoomich27@gmail.com';

let currentUser = null;
let userData = null;
let currentCase = null;
let currentWinner = null;
let isSpinning = false;
let isAdmin = false;
let multiCount = 1;
let pendingWins = [];

const loading = document.getElementById('loading');
const authModal = document.getElementById('auth-modal');
const app = document.getElementById('app');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const balanceEl = document.getElementById('balance');
const userIdEl = document.getElementById('user-id');
const userNameEl = document.getElementById('user-name');
const toast = document.getElementById('toast');

function showToast(msg, type) {
  toast.textContent = msg;
  toast.className = 'toast ' + (type || 'success');
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3500);
}
window.showToast = showToast;

/** Epic+ drop ceremony: sirens for mythic, flash, card reveal */
function playRareDropCeremony(item) {
  return new Promise(resolve => {
    const rarity = item.rarity || 'common';
    if (rarity !== 'mythic' && rarity !== 'legendary' && rarity !== 'epic') {
      resolve(); return;
    }
    const isMythic = rarity === 'mythic';
    const isLeg = rarity === 'legendary';

    if (isMythic) document.body.classList.add('mythic-alert', 'screen-shake');
    else document.body.classList.add('screen-shake');

    const overlay = document.createElement('div');
    overlay.className = 'mythic-overlay' + (isMythic ? ' sirens' : '');
    const label = isMythic ? '🚨 MYTHIC DROP 🚨' : isLeg ? '⚡ LEGENDARY' : '✨ EPIC';
    const imgHtml = item.img
      ? '<img src="' + item.img + '" alt="' + item.name + '" onerror="this.parentNode.innerHTML=\'<span style=font-size:4rem>\' + \'' + (item.emoji||'🎁') + '\' + \'</span>\'">'
      : '<span style="font-size:4rem">' + (item.emoji||'🎁') + '</span>';

    overlay.innerHTML =
      '<div class="mythic-burst"></div>' +
      '<div class="mythic-card ' + rarity + '">' +
        '<div class="mythic-label">' + label + '</div>' +
        '<div class="mythic-img-wrap" style="color:var(--r-' + rarity + ')">' + imgHtml + '</div>' +
        '<div class="mythic-name">' + item.name + '</div>' +
        '<div class="mythic-val">' + (item.value||0).toFixed(2) + ' TON</div>' +
        '<button class="btn btn-primary" id="mythic-ok">Забрать!</button>' +
      '</div>';
    document.body.appendChild(overlay);

    // Confetti
    const colors = isMythic ? ['#ef4444','#a855f7','#f59e0b','#fff'] : isLeg ? ['#f59e0b','#fbbf24','#fff'] : ['#a855f7','#c084fc','#fff'];
    for (let i = 0; i < (isMythic ? 40 : 20); i++) {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.top = (-10 - Math.random() * 20) + 'vh';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 0.5) + 's';
      p.style.animationDuration = (2 + Math.random() * 1.5) + 's';
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 4000);
    }

    // Optional Web Audio siren for mythic (no external file)
    if (isMythic && window.AudioContext) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const playBeep = (freq, t, dur) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.08, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + dur);
          o.start(t); o.stop(t + dur);
        };
        const now = ctx.currentTime;
        for (let i = 0; i < 6; i++) {
          playBeep(i % 2 === 0 ? 880 : 660, now + i * 0.18, 0.15);
        }
      } catch (e) {}
    }

    const close = () => {
      overlay.remove();
      document.body.classList.remove('mythic-alert', 'screen-shake');
      resolve();
    };
    overlay.querySelector('#mythic-ok').addEventListener('click', close);
    // auto close mythic after 8s if not clicked
    setTimeout(close, isMythic ? 9000 : 5000);
  });
}
window.playRareDropCeremony = playRareDropCeremony;



function ensureLiveFeed() {
  let f = document.getElementById('live-feed');
  if (!f) {
    f = document.createElement('div');
    f.id = 'live-feed';
    f.className = 'live-feed';
    document.body.appendChild(f);
  }
  return f;
}
function pushLiveWin(item, who) {
  const f = ensureLiveFeed();
  const el = document.createElement('div');
  el.className = 'live-toast';
  el.innerHTML = '<span class="lt-emoji">' + (item.emoji||'🎁') + '</span><div><div class="lt-name">' + item.name + '</div><div class="lt-meta">' + (who||'Игрок') + ' · ' + (item.rarity||'') + '</div></div>';
  f.prepend(el);
  setTimeout(() => el.remove(), 4000);
  while (f.children.length > 5) f.lastChild.remove();
}


// AUTH TABS
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const isLogin = tab.dataset.tab === 'login';
    loginForm.classList.toggle('hidden', !isLogin);
    registerForm.classList.toggle('hidden', isLogin);
  });
});

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const err = document.getElementById('login-error');
  err.textContent = '';
  try {
    await auth.signInWithEmailAndPassword(
      document.getElementById('login-email').value.trim(),
      document.getElementById('login-password').value
    );
  } catch (ex) { err.textContent = translateErr(ex.code); }
});

registerForm.addEventListener('submit', async e => {
  e.preventDefault();
  let username = document.getElementById('reg-username').value.trim();
  if (!username.startsWith('@')) username = '@' + username;
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const err = document.getElementById('reg-error');
  err.textContent = '';
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    const numericId = Math.floor(Date.now() / 1000) % 10000000 + Math.floor(Math.random() * 1000);
    const isAdminUser = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    await db.collection('users').doc(cred.user.uid).set({
      username, email, numericId, balance: 0, inventory: [], history: [],
      isAdmin: isAdminUser, createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (ex) { err.textContent = translateErr(ex.code); }
});

function translateErr(code) {
  const m = {
    'auth/email-already-in-use': 'Email уже зарегистрирован',
    'auth/invalid-email': 'Неверный email',
    'auth/weak-password': 'Слабый пароль',
    'auth/user-not-found': 'Не найден',
    'auth/wrong-password': 'Неверный пароль',
    'auth/invalid-credential': 'Неверный email или пароль',
    'auth/too-many-requests': 'Слишком много попыток'
  };
  return m[code] || code;
}

auth.onAuthStateChanged(async user => {
  if (user) {
    currentUser = user;
    await loadUserData();
    authModal.classList.add('hidden');
    app.classList.remove('hidden');
  } else {
    currentUser = null; userData = null; isAdmin = false;
    app.classList.add('hidden');
    authModal.classList.remove('hidden');
  }
  loading.classList.add('hidden');
});

async function loadUserData() {
  const doc = await db.collection('users').doc(currentUser.uid).get();
  userData = doc.exists ? doc.data() : { username: '@?', numericId: 0, balance: 0, inventory: [], history: [], email: currentUser.email };
  isAdmin = (userData.email || currentUser.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase() || !!userData.isAdmin;
  document.getElementById('admin-nav-btn').classList.toggle('hidden', !isAdmin);
  if (isAdmin && !userData.isAdmin) {
    await db.collection('users').doc(currentUser.uid).update({ isAdmin: true });
  }
  updateUI();
}

function updateUI() {
  balanceEl.textContent = (userData.balance || 0).toFixed(2);
  userIdEl.textContent = 'ID: ' + (userData.numericId || '—');
  userNameEl.textContent = userData.username || '@user';
  renderInventory();
  renderHistory();
  loadUserRequests();
  if (isAdmin) { loadAdminRequests(); buildAdminGiftList(); }
}

async function setBalance(newBal) {
  await db.collection('users').doc(currentUser.uid).update({ balance: newBal });
  userData.balance = newBal;
  balanceEl.textContent = newBal.toFixed(2);
}

document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());

// NAV
document.querySelectorAll('.mnav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mnav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.page === btn.dataset.page);
    });
    const page = btn.dataset.page;
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    const el = document.getElementById('page-' + page);
    if (el) el.classList.remove('hidden');
    if (page === 'admin' && isAdmin) loadAdminRequests();
    if (page === 'requests') loadUserRequests();
    if (page === 'leaderboard') loadLeaderboard();
    if (page === 'games') {
      document.getElementById('games-menu').classList.remove('hidden');
      document.querySelectorAll('.game-view').forEach(v => v.classList.remove('active'));
    }
  });
});

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const page = btn.dataset.page;
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById('page-' + page).classList.remove('hidden');
    if (page === 'admin' && isAdmin) loadAdminRequests();
    if (page === 'requests') loadUserRequests();
    if (page === 'leaderboard') loadLeaderboard();
    if (page === 'games') {
      document.getElementById('games-menu').classList.remove('hidden');
      document.querySelectorAll('.game-view').forEach(v => v.classList.remove('active'));
    }
  });
});

document.querySelectorAll('.req-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.req-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const t = tab.dataset.req;
    document.getElementById('user-deposits-list').classList.toggle('hidden', t !== 'deposits');
    document.getElementById('user-withdrawals-list').classList.toggle('hidden', t !== 'withdrawals');
  });
});

document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const t = tab.dataset.admin;
    document.getElementById('admin-deposits').classList.toggle('hidden', t !== 'deposits');
    document.getElementById('admin-withdrawals').classList.toggle('hidden', t !== 'withdrawals');
  });
});

// DEPOSIT
document.getElementById('deposit-btn').addEventListener('click', () => {
  document.getElementById('deposit-amount').value = '';
  document.getElementById('deposit-comment').value = '';
  document.getElementById('deposit-modal').classList.remove('hidden');
});
document.getElementById('close-deposit').addEventListener('click', () => document.getElementById('deposit-modal').classList.add('hidden'));
document.getElementById('submit-deposit').addEventListener('click', async () => {
  const amount = parseFloat(document.getElementById('deposit-amount').value);
  const comment = document.getElementById('deposit-comment').value.trim();
  if (!amount || amount < 0.1) return showToast('Укажи сумму', 'error');
  try {
    await db.collection('deposit_requests').add({
      userId: currentUser.uid, username: userData.username, email: userData.email || currentUser.email,
      numericId: userData.numericId, amount, comment, status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    document.getElementById('deposit-modal').classList.add('hidden');
    showToast('Заявка отправлена', 'success');
    loadUserRequests();
  } catch (e) { showToast('Ошибка', 'error'); }
});

// WITHDRAW
document.getElementById('withdraw-btn').addEventListener('click', () => {
  document.getElementById('withdraw-amount').value = '';
  document.getElementById('withdraw-comment').value = '';
  document.getElementById('withdraw-type').value = 'balance';
  document.getElementById('withdraw-balance-group').classList.remove('hidden');
  document.getElementById('withdraw-item-group').classList.add('hidden');
  fillWithdrawItems();
  document.getElementById('withdraw-modal').classList.remove('hidden');
});
document.getElementById('close-withdraw').addEventListener('click', () => document.getElementById('withdraw-modal').classList.add('hidden'));
document.getElementById('withdraw-type').addEventListener('change', e => {
  const isItem = e.target.value === 'item';
  document.getElementById('withdraw-balance-group').classList.toggle('hidden', isItem);
  document.getElementById('withdraw-item-group').classList.toggle('hidden', !isItem);
});
function fillWithdrawItems() {
  const sel = document.getElementById('withdraw-item-select');
  sel.innerHTML = '<option value="">—</option>';
  (userData.inventory || []).forEach((item, i) => {
    const o = document.createElement('option');
    o.value = i; o.textContent = item.emoji + ' ' + item.name;
    sel.appendChild(o);
  });
}
document.getElementById('submit-withdraw').addEventListener('click', async () => {
  const type = document.getElementById('withdraw-type').value;
  const comment = document.getElementById('withdraw-comment').value.trim();
  let amount = 0, itemData = null, itemIndex = -1;
  if (type === 'balance') {
    amount = parseFloat(document.getElementById('withdraw-amount').value);
    if (!amount || amount < 0.1) return showToast('Укажи сумму', 'error');
    if (amount > (userData.balance || 0)) return showToast('Недостаточно средств', 'error');
  } else {
    itemIndex = parseInt(document.getElementById('withdraw-item-select').value, 10);
    if (isNaN(itemIndex)) return showToast('Выбери предмет', 'error');
    itemData = userData.inventory[itemIndex];
  }
  try {
    if (type === 'balance') await setBalance(userData.balance - amount);
    if (type === 'item') {
      const inv = [...userData.inventory]; inv.splice(itemIndex, 1);
      await db.collection('users').doc(currentUser.uid).update({ inventory: inv });
      userData.inventory = inv; renderInventory();
    }
    await db.collection('withdraw_requests').add({
      userId: currentUser.uid, username: userData.username, email: userData.email || currentUser.email,
      numericId: userData.numericId, type, amount: type === 'balance' ? amount : (itemData?.value || 0),
      item: itemData, comment, status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    document.getElementById('withdraw-modal').classList.add('hidden');
    showToast('Заявка на вывод отправлена', 'success');
    loadUserRequests();
  } catch (e) { showToast('Ошибка', 'error'); }
});

// USER REQUESTS
async function loadUserRequests() {
  if (!currentUser) return;
  const depList = document.getElementById('user-deposits-list');
  const wdList = document.getElementById('user-withdrawals-list');
  try {
    let snap = await db.collection('deposit_requests').where('userId', '==', currentUser.uid).limit(30).get();
    const docs = snap.docs.sort((a,b) => (b.data().createdAt?.seconds||0) - (a.data().createdAt?.seconds||0));
    depList.innerHTML = docs.length ? docs.map(d => userReqCard(d.data(), 'dep')).join('') : '<p class="empty-state">Нет заявок</p>';
  } catch (e) { depList.innerHTML = '<p class="empty-state">Ошибка</p>'; }
  try {
    let snap = await db.collection('withdraw_requests').where('userId', '==', currentUser.uid).limit(30).get();
    const docs = snap.docs.sort((a,b) => (b.data().createdAt?.seconds||0) - (a.data().createdAt?.seconds||0));
    wdList.innerHTML = docs.length ? docs.map(d => userReqCard(d.data(), 'wd')).join('') : '<p class="empty-state">Нет заявок</p>';
  } catch (e) { wdList.innerHTML = '<p class="empty-state">Ошибка</p>'; }
}
function userReqCard(r, kind) {
  const st = { pending: 'Ожидает', approved: 'Одобрено', rejected: 'Отклонено', completed: 'Выполнено' }[r.status] || r.status;
  const detail = kind === 'dep' ? '+' + r.amount + ' TON' : (r.type === 'item' && r.item ? r.item.emoji + ' ' + r.item.name : '−' + r.amount + ' TON');
  return `<div class="request-card"><div class="info"><strong>${detail}</strong><div class="meta">${r.comment||''}<br>${fmtTs(r.createdAt)}</div></div><span class="status status-${r.status}">${st}</span></div>`;
}

// ADMIN
async function loadAdminRequests() {
  if (!isAdmin) return;
  const depEl = document.getElementById('admin-deposits');
  const wdEl = document.getElementById('admin-withdrawals');
  try {
    const snap = await db.collection('deposit_requests').limit(50).get();
    const docs = snap.docs.sort((a,b) => (b.data().createdAt?.seconds||0) - (a.data().createdAt?.seconds||0));
    document.getElementById('dep-count').textContent = docs.filter(d => d.data().status === 'pending').length;
    depEl.innerHTML = docs.length ? docs.map(d => adminDepCard(d.id, d.data())).join('') : '<p class="empty-state">Пусто</p>';
    depEl.querySelectorAll('[data-action]').forEach(b => b.addEventListener('click', () => handleDep(b.dataset.id, b.dataset.action)));
  } catch (e) { depEl.innerHTML = '<p class="empty-state">Ошибка</p>'; }
  try {
    const snap = await db.collection('withdraw_requests').limit(50).get();
    const docs = snap.docs.sort((a,b) => (b.data().createdAt?.seconds||0) - (a.data().createdAt?.seconds||0));
    document.getElementById('wd-count').textContent = docs.filter(d => d.data().status === 'pending').length;
    wdEl.innerHTML = docs.length ? docs.map(d => adminWdCard(d.id, d.data())).join('') : '<p class="empty-state">Пусто</p>';
    wdEl.querySelectorAll('[data-action]').forEach(b => b.addEventListener('click', () => handleWd(b.dataset.id, b.dataset.action)));
  } catch (e) { wdEl.innerHTML = '<p class="empty-state">Ошибка</p>'; }
}
function adminDepCard(id, r) {
  const st = { pending: 'Ожидает', approved: 'Одобрено', rejected: 'Отклонено', completed: 'Выполнено' }[r.status] || r.status;
  const acts = r.status === 'pending' ? `<div class="request-actions"><button class="btn btn-approve" data-id="${id}" data-action="approve">Одобрить</button><button class="btn btn-reject" data-id="${id}" data-action="reject">Отклонить</button></div>` : '';
  return `<div class="request-card"><div class="info"><strong>+${r.amount} TON</strong><div class="meta">${r.username} · ID ${r.numericId} · ${r.email||''}<br>${r.comment||'—'}<br>${fmtTs(r.createdAt)}</div></div><span class="status status-${r.status}">${st}</span>${acts}</div>`;
}
function adminWdCard(id, r) {
  const st = { pending: 'Ожидает', approved: 'Одобрено', rejected: 'Отклонено', completed: 'Выполнено' }[r.status] || r.status;
  const detail = r.type === 'item' && r.item ? r.item.emoji + ' ' + r.item.name : '−' + r.amount + ' TON';
  let acts = '';
  if (r.status === 'pending') acts = `<div class="request-actions"><button class="btn btn-approve" data-id="${id}" data-action="approve">Одобрить</button><button class="btn btn-complete" data-id="${id}" data-action="complete">Выдано</button><button class="btn btn-reject" data-id="${id}" data-action="reject">Отклонить</button></div>`;
  else if (r.status === 'approved') acts = `<div class="request-actions"><button class="btn btn-complete" data-id="${id}" data-action="complete">Выдано</button></div>`;
  return `<div class="request-card"><div class="info"><strong>${detail}</strong><div class="meta">${r.username} · ID ${r.numericId}<br>${r.comment||'—'}<br>${fmtTs(r.createdAt)}</div></div><span class="status status-${r.status}">${st}</span>${acts}</div>`;
}
async function handleDep(id, action) {
  const ref = db.collection('deposit_requests').doc(id);
  const snap = await ref.get(); if (!snap.exists) return;
  const r = snap.data(); if (r.status !== 'pending') return;
  if (action === 'approve') {
    const u = await db.collection('users').doc(r.userId).get();
    if (u.exists) await db.collection('users').doc(r.userId).update({ balance: (u.data().balance||0) + r.amount });
    await ref.update({ status: 'approved', processedAt: firebase.firestore.FieldValue.serverTimestamp() });
    showToast('Пополнение одобрено', 'success');
  } else {
    await ref.update({ status: 'rejected', processedAt: firebase.firestore.FieldValue.serverTimestamp() });
    showToast('Отклонено', 'success');
  }
  loadAdminRequests();
  if (r.userId === currentUser.uid) await loadUserData();
}
async function handleWd(id, action) {
  const ref = db.collection('withdraw_requests').doc(id);
  const snap = await ref.get(); if (!snap.exists) return;
  const r = snap.data();
  if (action === 'approve' && r.status === 'pending') {
    await ref.update({ status: 'approved' });
    showToast('Одобрено — напиши ' + r.username, 'success');
  } else if (action === 'complete') {
    await ref.update({ status: 'completed' });
    showToast('Выдано', 'success');
  } else if (action === 'reject' && r.status === 'pending') {
    const u = await db.collection('users').doc(r.userId).get();
    if (u.exists) {
      const ud = u.data();
      if (r.type === 'balance') await db.collection('users').doc(r.userId).update({ balance: (ud.balance||0) + (r.amount||0) });
      else if (r.item) { const inv = ud.inventory||[]; inv.unshift(r.item); await db.collection('users').doc(r.userId).update({ inventory: inv }); }
    }
    await ref.update({ status: 'rejected' });
    showToast('Отклонено, возврат', 'success');
  }
  loadAdminRequests();
  if (r.userId === currentUser.uid) await loadUserData();
}

// ADMIN GIVE
document.getElementById('give-type').addEventListener('change', e => {
  const v = e.target.value;
  const isGift = v === 'gift';
  document.getElementById('give-ton-row').classList.toggle('hidden', isGift);
  document.getElementById('give-gift-row').classList.toggle('hidden', !isGift);
});

function buildAdminGiftList() {
  const sel = document.getElementById('give-gift-select');
  if (!sel || typeof CASES === 'undefined') return;
  const map = {};
  Object.values(CASES).forEach(c => c.items.forEach(i => { map[i.id] = i; }));
  const list = Object.values(map).sort((a,b) => (b.value||0)-(a.value||0));
  sel.innerHTML = list.map(i =>
    '<option value="' + i.id + '">' + i.emoji + ' ' + i.name + ' (' + i.rarity + ', ' + (i.value||0) + ' TON)</option>'
  ).join('');
}

async function findUser(target) {
  target = target.trim();
  if (!target) return null;
  // by numeric ID
  if (/^\d+$/.test(target)) {
    const snap = await db.collection('users').where('numericId', '==', parseInt(target, 10)).limit(1).get();
    if (!snap.empty) return { id: snap.docs[0].id, data: snap.docs[0].data() };
  }
  // by username
  let un = target.startsWith('@') ? target : '@' + target;
  let snap = await db.collection('users').where('username', '==', un).limit(1).get();
  if (!snap.empty) return { id: snap.docs[0].id, data: snap.docs[0].data() };
  // without @
  snap = await db.collection('users').where('username', '==', target).limit(1).get();
  if (!snap.empty) return { id: snap.docs[0].id, data: snap.docs[0].data() };
  return null;
}

document.getElementById('give-ton-btn').addEventListener('click', async () => {
  if (!isAdmin) return;
  const target = document.getElementById('give-target').value;
  const amount = parseFloat(document.getElementById('give-amount').value);
  const mode = document.getElementById('give-type').value;
  if (!amount || amount <= 0) return showToast('Укажи сумму', 'error');
  const user = await findUser(target);
  if (!user) return showToast('Пользователь не найден', 'error');
  let bal = user.data.balance || 0;
  if (mode === 'take') {
    bal = Math.max(0, bal - amount);
    await db.collection('users').doc(user.id).update({ balance: bal });
    showToast('−' + amount + ' TON у ' + (user.data.username || target) + ' (осталось ' + bal.toFixed(2) + ')', 'success');
  } else {
    bal = bal + amount;
    await db.collection('users').doc(user.id).update({ balance: bal });
    showToast('+' + amount + ' TON → ' + (user.data.username || target), 'success');
  }
  if (user.id === currentUser.uid) await loadUserData();
});

document.getElementById('give-gift-btn').addEventListener('click', async () => {
  if (!isAdmin) return;
  const target = document.getElementById('give-target').value;
  const gid = document.getElementById('give-gift-select').value;
  const map = {};
  Object.values(CASES).forEach(c => c.items.forEach(i => { map[i.id] = i; }));
  const gift = map[gid];
  if (!gift) return showToast('Выбери подарок', 'error');
  const user = await findUser(target);
  if (!user) return showToast('Пользователь не найден', 'error');
  const inv = user.data.inventory || [];
  inv.unshift({ ...gift, wonAt: new Date().toISOString(), fromAdmin: true });
  await db.collection('users').doc(user.id).update({ inventory: inv });
  showToast(gift.emoji + ' ' + gift.name + ' → ' + (user.data.username || target), 'success');
  if (user.id === currentUser.uid) await loadUserData();
});

// LEADERBOARD
async function loadLeaderboard() {
  const el = document.getElementById('lb-list');
  el.innerHTML = '<p class="empty-state">Загрузка...</p>';
  try {
    // Real users only from Firestore
    const snap = await db.collection('users').orderBy('balance', 'desc').limit(50).get();
    const rows = [];
    snap.docs.forEach(d => {
      const u = d.data();
      // Skip incomplete / placeholder accounts
      if (!u.username || u.username === '@?' || u.username === '@unknown') return;
      if (u.numericId == null) return;
      rows.push(u);
    });
    // Already sorted by balance desc
    if (!rows.length) {
      el.innerHTML = '<p class="empty-state">Пока никого нет — будь первым!</p>';
      return;
    }
    el.innerHTML = rows.slice(0, 20).map((u, i) => {
      const rankClass = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
      return `<div class="lb-row"><div class="lb-rank ${rankClass}">#${i+1}</div><div class="lb-user">${u.username}<span>ID ${u.numericId}</span></div><div class="lb-score">${(u.balance||0).toFixed(2)} TON</div></div>`;
    }).join('');
  } catch (e) {
    console.error(e);
    // Fallback without orderBy
    try {
      const snap = await db.collection('users').limit(50).get();
      const rows = snap.docs.map(d => d.data())
        .filter(u => u.username && u.username !== '@?' && u.numericId != null)
        .sort((a, b) => (b.balance || 0) - (a.balance || 0))
        .slice(0, 20);
      if (!rows.length) {
        el.innerHTML = '<p class="empty-state">Пока никого нет</p>';
        return;
      }
      el.innerHTML = rows.map((u, i) => {
        const rankClass = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
        return `<div class="lb-row"><div class="lb-rank ${rankClass}">#${i+1}</div><div class="lb-user">${u.username}<span>ID ${u.numericId}</span></div><div class="lb-score">${(u.balance||0).toFixed(2)} TON</div></div>`;
      }).join('');
    } catch (e2) {
      el.innerHTML = '<p class="empty-state">Нужны Firestore rules: allow read на users для авторизованных</p>';
    }
  }
}


// CASES
document.querySelectorAll('.btn-open').forEach(btn => {
  btn.addEventListener('click', () => openCase(btn.dataset.case));
});

function openCase(caseId) {
  const c = CASES[caseId]; if (!c) return;
  currentCase = caseId; currentWinner = null; isSpinning = false; pendingWins = [];
  multiCount = 1;
  document.querySelectorAll('.multi-btn').forEach(b => b.classList.toggle('active', b.dataset.multi === '1'));
  document.getElementById('spin-case-name').textContent = c.name;
  document.getElementById('case-preview').classList.remove('hidden');
  document.getElementById('case-spin-phase').classList.add('hidden');
  document.getElementById('spin-result').classList.add('hidden');
  document.getElementById('spin-btn').disabled = false;
  document.getElementById('spin-btn').textContent = 'Открыть';
  // Preview chest
  const em = document.getElementById('preview-chest-emoji');
  if (em) em.textContent = caseId === 'nft' ? '💎' : caseId === 'bear' ? '🧸' : '🤖';
  const pn = document.getElementById('preview-case-name');
  if (pn) pn.textContent = caseId === 'nft' ? 'NFT Box' : caseId === 'bear' ? "Animal's Box" : 'MechaGram Box';
  const pp = document.getElementById('preview-case-price');
  if (pp) pp.textContent = c.price.toFixed(2);
  const chest = document.getElementById('preview-chest');
  if (chest) {
    chest.className = 'chest-wrap big ' + (caseId === 'nft' ? 'nft-glow' : caseId === 'bear' ? 'bear-glow' : 'mecha-glow');
    const box = chest.querySelector('.chest-box');
    if (box) box.className = 'chest-box ' + (caseId === 'nft' ? 'nft-chest' : caseId === 'bear' ? 'bear-chest' : 'mecha-chest');
  }

  // Odds list
  const odds = getItemChances(caseId);
  document.getElementById('case-odds-list').innerHTML = odds.map(i =>
    '<div class="odds-item rarity-' + i.rarity + '">' + (typeof itemVisual==='function'?itemVisual(i):'<span class="oe">'+i.emoji+'</span>') + '<div class="on">' + i.name + '</div><div class="oc">' + i.chance.toFixed(2) + '%</div><div class="oc"><span class="ton-d">◆</span> ' + i.value + '</div></div>'
  ).join('');
  updateMultiPrice();
  document.getElementById('spin-modal').classList.remove('hidden');
}

function updateMultiPrice() {
  const c = CASES[currentCase];
  if (!c) return;
  const total = c.price * multiCount;
  document.getElementById('multi-price').textContent = 'Итого: ◆ ' + (CASES[currentCase].price * multiCount).toFixed(2);
}

document.querySelectorAll('.multi-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.multi-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    multiCount = parseInt(btn.dataset.multi, 10);
    updateMultiPrice();
  });
});

function renderRoulette(items) {
  const track = document.getElementById('roulette-track');
  track.innerHTML = '';
  track.style.transition = 'none';
  track.style.transform = 'translateX(0)';
  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'roulette-item rarity-' + item.rarity;
    el.innerHTML = '<span class="emoji">' + item.emoji + '</span><span class="name">' + item.name + '</span>';
    track.appendChild(el);
  });
}

/** Accurate centering: measure real item width including gap */
function buildTrackHTML(items) {
  return items.map(item =>
    '<div class="roulette-item rarity-' + item.rarity + '">' + (typeof itemVisual==='function'?itemVisual(item):'<span class="emoji">'+item.emoji+'</span>') + '<span class="name">' + item.name + '</span></div>'
  ).join('');
}

function spinAllSimultaneous(winners) {
  return new Promise(resolve => {
    const wrap = document.getElementById('multi-roulettes');
    wrap.innerHTML = '';
    const rows = [];
    winners.forEach((winner, i) => {
      const { items, winIndex } = generateRouletteItems(currentCase, winner, 50);
      const row = document.createElement('div');
      row.className = 'multi-roulette-row';
      row.innerHTML = '<div class="roulette-pointer"></div><div class="roulette-track">' + buildTrackHTML(items) + '</div>';
      wrap.appendChild(row);
      rows.push({ row, track: row.querySelector('.roulette-track'), winIndex, items });
    });

    // Force layout then animate all at once
    wrap.offsetHeight;
    rows.forEach(({ track, winIndex }) => {
      const first = track.querySelector('.roulette-item');
      if (!first) return;
      const gap = parseFloat(getComputedStyle(track).gap) || 6;
      const itemW = first.offsetWidth + gap;
      const dist = winIndex * itemW + first.offsetWidth / 2;
      track.style.transition = 'none';
      track.style.transform = 'translateX(0)';
      track.offsetHeight;
      track.style.transition = 'transform 4.5s cubic-bezier(0.12, 0.85, 0.2, 1)';
      track.style.transform = 'translateX(-' + dist + 'px)';
    });
    setTimeout(resolve, 4700);
  });
}


document.getElementById('spin-btn').addEventListener('click', async () => {
  if (isSpinning || !currentCase) return;
  const c = CASES[currentCase];
  const totalCost = c.price * multiCount;
  if ((userData.balance || 0) < totalCost) return showToast('Недостаточно TON', 'error');
  isSpinning = true;
  document.getElementById('spin-btn').disabled = true;
  try {
    await setBalance(userData.balance - totalCost);
  } catch (e) {
    isSpinning = false;
    document.getElementById('spin-btn').disabled = false;
    return showToast('Ошибка', 'error');
  }
  document.getElementById('case-preview').classList.add('hidden');
  document.getElementById('case-spin-phase').classList.remove('hidden');
  document.getElementById('spin-result').classList.add('hidden');
  pendingWins = [];
  for (let i = 0; i < multiCount; i++) pendingWins.push(rollItem(currentCase));
  document.getElementById('spin-progress').textContent = multiCount > 1 ? ('Крутим x' + multiCount + '…') : 'Крутим…';
  await spinAllSimultaneous(pendingWins);
  isSpinning = false;
  document.getElementById('case-spin-phase').classList.add('hidden');
  document.getElementById('results-list').innerHTML = pendingWins.map(w =>
    '<div class="result-card rarity-' + w.rarity + '">' + (typeof itemVisual==='function'?itemVisual(w):'<div class="re">'+w.emoji+'</div>') + '<div class="rn">' + w.name + '</div><div class="rarity ' + w.rarity + '">' + w.rarity + '</div><div class="rv">' + w.value.toFixed(2) + ' TON</div></div>'
  ).join('');
  pendingWins.forEach(w => { if (w.rarity==='legendary'||w.rarity==='mythic'||w.rarity==='epic') pushLiveWin(w, userData.username); });
  document.getElementById('spin-result').classList.remove('hidden');
  // Ceremony for best drop (mythic > legendary > epic)
  const rank = { mythic: 3, legendary: 2, epic: 1 };
  const best = pendingWins.slice().sort((a,b) => (rank[b.rarity]||0) - (rank[a.rarity]||0))[0];
  if (best && rank[best.rarity]) await playRareDropCeremony(best);
});

document.getElementById('claim-btn').addEventListener('click', async () => {
  if (!pendingWins.length) return;
  const inv = userData.inventory || [];
  const hist = userData.history || [];
  pendingWins.forEach(w => {
    const item = { ...w, caseId: currentCase, wonAt: new Date().toISOString() };
    inv.unshift(item);
    hist.unshift({ ...item, caseName: CASES[currentCase].name });
  });
  if (hist.length > 50) hist.length = 50;
  if (inv.length > 100) inv.length = 100;
  await db.collection('users').doc(currentUser.uid).update({ inventory: inv, history: hist });
  userData.inventory = inv; userData.history = hist;
  updateUI();
  document.getElementById('spin-modal').classList.add('hidden');
  showToast('Получено предметов: ' + pendingWins.length, 'success');
  pendingWins = [];
});

document.getElementById('close-spin').addEventListener('click', () => {
  if (!isSpinning) document.getElementById('spin-modal').classList.add('hidden');
});

function renderInventory() {
  const g = document.getElementById('inventory-grid');
  const inv = userData.inventory || [];
  if (!inv.length) { g.innerHTML = '<p class="empty-state">Пока пусто</p>'; return; }
  g.innerHTML = inv.map((i, idx) =>
    '<div class="inv-item">' + (typeof itemVisual==='function'?itemVisual(i):'<span class="emoji">'+i.emoji+'</span>') + '<div class="name">' + i.name + '</div><div class="rarity ' + i.rarity + '">' + i.rarity + '</div><div class="inv-price"><span class="ton-d">◆</span> ' + (i.value||0).toFixed(2) + '</div><button class="btn-sell" data-idx="' + idx + '">Продать</button></div>'
  ).join('');
  g.querySelectorAll('.btn-sell').forEach(btn => {
    btn.addEventListener('click', () => sellItem(parseInt(btn.dataset.idx, 10)));
  });
}

async function sellItem(idx) {
  const inv = userData.inventory || [];
  if (idx < 0 || idx >= inv.length) return;
  const item = inv[idx];
  const price = item.value || 0;
  if (!confirm('Продать «' + item.name + '» за ' + price.toFixed(2) + ' TON?')) return;
  inv.splice(idx, 1);
  const newBal = (userData.balance || 0) + price;
  await db.collection('users').doc(currentUser.uid).update({ inventory: inv, balance: newBal });
  userData.inventory = inv;
  userData.balance = newBal;
  updateUI();
  showToast('Продано: +' + price.toFixed(2) + ' TON', 'success');
}

function renderHistory() {
  const l = document.getElementById('history-list');
  const h = userData.history || [];
  l.innerHTML = h.length ? h.map(i => '<div class="history-item"><span class="emoji" style="font-size:1.6rem">' + i.emoji + '</span><div class="info"><div class="name">' + i.name + '</div><div class="meta">' + (i.caseName||'') + ' · ' + fmtDate(i.wonAt) + '</div></div><div class="value">' + (i.value||0).toFixed(2) + ' TON</div></div>').join('') : '<p class="empty-state">Пусто</p>';
}
function fmtTs(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('ru-RU', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
}
function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('ru-RU', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
}

// GAMES balance hooks
window.onMinesWin = async (win) => {
  await setBalance((userData.balance || 0) + win);
  showToast('Забрал ' + win.toFixed(2) + ' TON', 'success');
};
window.onMinesLose = () => {};
window.onRocketWin = async (win) => {
  await setBalance((userData.balance || 0) + win);
  showToast('Забрал ' + win.toFixed(2) + ' TON', 'success');
};
window.onRocketLose = () => {};

// Mines start / cashout
document.getElementById('mines-start').addEventListener('click', async () => {
  const bet = parseFloat(document.getElementById('mines-bet').value);
  const bombs = parseInt(document.getElementById('mines-bombs').value, 10);
  if (!bet || bet < 5) return showToast('Минимум 5 TON', 'error');
  if ((userData.balance || 0) < bet) return showToast('Недостаточно TON', 'error');
  await setBalance(userData.balance - bet);
  MinesGame.start(bet, bombs);
});
document.getElementById('mines-cashout').addEventListener('click', () => MinesGame.cashout());

// Rocket
document.getElementById('rocket-start').addEventListener('click', async () => {
  const bet = parseFloat(document.getElementById('rocket-bet').value);
  if (!bet || bet < 0.5) return showToast('Минимум 0.5 TON', 'error');
  if ((userData.balance || 0) < bet) return showToast('Недостаточно TON', 'error');
  await setBalance(userData.balance - bet);
  RocketGame.start(bet);
});
document.getElementById('rocket-cashout').addEventListener('click', () => RocketGame.cashout());

// Gift Upgrade (CS-style)
window.fillUpgradeInventory = function() {
  if (typeof GiftUpgrade === 'undefined') return;
  GiftUpgrade.selectedStake.clear();
  GiftUpgrade.selectedTarget = null;
  GiftUpgrade.renderStake(userData.inventory || []);
  GiftUpgrade.renderTargets();
  GiftUpgrade.updateUI(userData.inventory || []);
  const res = document.getElementById('cs-upgrade-result');
  if (res) { res.textContent = ''; res.className = 'cs-upgrade-result'; }
};

document.getElementById('upgrade-go').addEventListener('click', async () => {
  if (typeof GiftUpgrade === 'undefined' || GiftUpgrade.spinning) return;
  const result = await GiftUpgrade.play(userData.inventory || []);
  if (!result) return;
  let inv = [...(userData.inventory || [])];
  result.stakeIndices.forEach(i => {
    if (i >= 0 && i < inv.length) inv.splice(i, 1);
  });
  if (result.win && result.target) {
    inv.unshift(result.target);
    showToast('Апгрейд успешен! ' + result.target.emoji + ' ' + result.target.name, 'success');
  } else {
    showToast('Апгрейд провален — предметы сгорели', 'error');
  }
  await db.collection('users').doc(currentUser.uid).update({ inventory: inv });
  userData.inventory = inv;
  updateUI();
  fillUpgradeInventory();
});


// Backdrop close
['spin-modal','deposit-modal','withdraw-modal'].forEach(id => {
  document.getElementById(id).addEventListener('click', e => {
    if (e.target.id === id && !isSpinning) e.target.classList.add('hidden');
  });
});

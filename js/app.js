// StarDrop App — cases, requests, admin, games, leaderboard
const ADMIN_EMAIL = 'strepoomich27@gmail.com';

let currentUser = null;
let userData = null;
let currentCase = null;
let currentWinner = null;
let isSpinning = false;
let isAdmin = false;

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
  if (isAdmin) loadAdminRequests();
}

async function setBalance(newBal) {
  await db.collection('users').doc(currentUser.uid).update({ balance: newBal });
  userData.balance = newBal;
  balanceEl.textContent = newBal.toFixed(2);
}

document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());

// NAV
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
  const isTon = e.target.value === 'ton';
  document.getElementById('give-ton-row').classList.toggle('hidden', !isTon);
  document.getElementById('give-gift-row').classList.toggle('hidden', isTon);
});

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
  if (!amount || amount <= 0) return showToast('Укажи сумму', 'error');
  const user = await findUser(target);
  if (!user) return showToast('Пользователь не найден', 'error');
  await db.collection('users').doc(user.id).update({ balance: (user.data.balance || 0) + amount });
  showToast('+' + amount + ' TON → ' + (user.data.username || target), 'success');
  if (user.id === currentUser.uid) await loadUserData();
});

document.getElementById('give-gift-btn').addEventListener('click', async () => {
  if (!isAdmin) return;
  const target = document.getElementById('give-target').value;
  const val = document.getElementById('give-gift-select').value;
  const [id, emoji, name, rarity, value] = val.split('|');
  const user = await findUser(target);
  if (!user) return showToast('Пользователь не найден', 'error');
  const inv = user.data.inventory || [];
  inv.unshift({ id, emoji, name, rarity, value: parseFloat(value), wonAt: new Date().toISOString(), fromAdmin: true });
  await db.collection('users').doc(user.id).update({ inventory: inv });
  showToast(emoji + ' ' + name + ' → ' + (user.data.username || target), 'success');
  if (user.id === currentUser.uid) await loadUserData();
});

// LEADERBOARD
async function loadLeaderboard() {
  const el = document.getElementById('lb-list');
  try {
    // Need public read of users for LB - fallback: only show if rules allow
    const snap = await db.collection('users').orderBy('balance', 'desc').limit(20).get();
    if (snap.empty) { el.innerHTML = '<p class="empty-state">Пока пусто</p>'; return; }
    el.innerHTML = snap.docs.map((d, i) => {
      const u = d.data();
      const rankClass = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
      return `<div class="lb-row"><div class="lb-rank ${rankClass}">#${i+1}</div><div class="lb-user">${u.username||'?'}<span>ID ${u.numericId||'—'}</span></div><div class="lb-score">${(u.balance||0).toFixed(2)} TON</div></div>`;
    }).join('');
  } catch (e) {
    // If rules block orderBy on all users, show message
    el.innerHTML = '<p class="empty-state">Лидерборд: добавь в Firestore rules чтение users для авторизованных, или индекс balance.</p>';
  }
}

// CASES
document.querySelectorAll('.btn-open').forEach(btn => {
  btn.addEventListener('click', () => openCase(btn.dataset.case));
});
function openCase(caseId) {
  const c = CASES[caseId]; if (!c) return;
  if ((userData.balance||0) < c.price) return showToast('Недостаточно TON', 'error');
  currentCase = caseId; currentWinner = null; isSpinning = false;
  document.getElementById('spin-case-name').textContent = c.name;
  document.getElementById('spin-result').classList.add('hidden');
  document.getElementById('spin-btn').classList.remove('hidden');
  document.getElementById('spin-btn').disabled = false;
  document.getElementById('spin-btn').textContent = 'Крутить';
  const { items } = generateRouletteItems(caseId, c.items[0], 50);
  renderRoulette(items);
  document.getElementById('spin-modal').classList.remove('hidden');
}
function renderRoulette(items) {
  const track = document.getElementById('roulette-track');
  track.innerHTML = ''; track.style.transition = 'none'; track.style.transform = 'translateX(0)';
  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'roulette-item rarity-' + item.rarity;
    el.innerHTML = `<span class="emoji">${item.emoji}</span><span class="name">${item.name}</span>`;
    track.appendChild(el);
  });
}
document.getElementById('spin-btn').addEventListener('click', async () => {
  if (isSpinning || !currentCase) return;
  const c = CASES[currentCase];
  if ((userData.balance||0) < c.price) return showToast('Недостаточно TON', 'error');
  isSpinning = true;
  document.getElementById('spin-btn').disabled = true;
  document.getElementById('spin-btn').textContent = 'Крутим...';
  try {
    await setBalance(userData.balance - c.price);
  } catch (e) {
    isSpinning = false; document.getElementById('spin-btn').disabled = false;
    document.getElementById('spin-btn').textContent = 'Крутить';
    return showToast('Ошибка', 'error');
  }
  currentWinner = rollItem(currentCase);
  const { items, winIndex } = generateRouletteItems(currentCase, currentWinner, 60);
  renderRoulette(items);
  const track = document.getElementById('roulette-track');
  const itemW = 118;
  const dist = winIndex * itemW - (track.parentElement.offsetWidth / 2) + itemW / 2 + Math.random() * 30 - 15;
  track.offsetHeight;
  track.style.transition = 'transform 5.5s cubic-bezier(0.15, 0.85, 0.25, 1)';
  track.style.transform = 'translateX(-' + dist + 'px)';
  setTimeout(() => {
    isSpinning = false;
    document.getElementById('spin-btn').classList.add('hidden');
    document.getElementById('result-emoji').textContent = currentWinner.emoji;
    document.getElementById('result-name').textContent = currentWinner.name;
    const re = document.getElementById('result-rarity');
    re.textContent = currentWinner.rarity; re.className = 'rarity ' + currentWinner.rarity;
    document.getElementById('result-value').textContent = currentWinner.value.toFixed(2) + ' TON';
    document.getElementById('spin-result').classList.remove('hidden');
  }, 5600);
});
document.getElementById('claim-btn').addEventListener('click', async () => {
  if (!currentWinner) return;
  const item = { ...currentWinner, caseId: currentCase, wonAt: new Date().toISOString() };
  const inv = userData.inventory || []; const hist = userData.history || [];
  inv.unshift(item); hist.unshift({ ...item, caseName: CASES[currentCase].name });
  if (hist.length > 50) hist.length = 50;
  await db.collection('users').doc(currentUser.uid).update({ inventory: inv, history: hist });
  userData.inventory = inv; userData.history = hist;
  updateUI();
  document.getElementById('spin-modal').classList.add('hidden');
  showToast('Получено: ' + item.name, 'success');
});
document.getElementById('close-spin').addEventListener('click', () => {
  if (!isSpinning) document.getElementById('spin-modal').classList.add('hidden');
});

function renderInventory() {
  const g = document.getElementById('inventory-grid');
  const inv = userData.inventory || [];
  g.innerHTML = inv.length ? inv.map(i => `<div class="inv-item"><span class="emoji">${i.emoji}</span><div class="name">${i.name}</div><div class="rarity ${i.rarity}">${i.rarity}</div></div>`).join('') : '<p class="empty-state">Пока пусто</p>';
}
function renderHistory() {
  const l = document.getElementById('history-list');
  const h = userData.history || [];
  l.innerHTML = h.length ? h.map(i => `<div class="history-item"><span class="emoji">${i.emoji}</span><div class="info"><div class="name">${i.name}</div><div class="meta">${i.caseName||''} · ${fmtDate(i.wonAt)}</div></div><div class="value">${(i.value||0).toFixed(2)} TON</div></div>`).join('') : '<p class="empty-state">Пусто</p>';
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
window.onUpgradeWin = async (amount, mult) => {
  await setBalance((userData.balance || 0) + amount);
  const el = document.getElementById('upgrade-result');
  el.textContent = 'Победа! x' + mult.toFixed(2) + ' → +' + amount.toFixed(2) + ' TON';
  el.className = 'upgrade-result win';
  showToast('Апгрейд успешен!', 'success');
};
window.onUpgradeLose = () => {
  const el = document.getElementById('upgrade-result');
  el.textContent = 'Неудача';
  el.className = 'upgrade-result lose';
};

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

// Upgrade
document.getElementById('upgrade-go').addEventListener('click', async () => {
  const bet = parseFloat(document.getElementById('upgrade-bet').value);
  const chance = parseInt(document.getElementById('upgrade-chance-range').value, 10);
  if (!bet || bet < 0.5) return showToast('Минимум 0.5 TON', 'error');
  if ((userData.balance || 0) < bet) return showToast('Недостаточно TON', 'error');
  await setBalance(userData.balance - bet);
  UpgradeGame.play(bet, chance);
});

// Backdrop close
['spin-modal','deposit-modal','withdraw-modal'].forEach(id => {
  document.getElementById(id).addEventListener('click', e => {
    if (e.target.id === id && !isSpinning) e.target.classList.add('hidden');
  });
});

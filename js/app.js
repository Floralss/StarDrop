// StarDrop — Main Application Logic
// Admin email: strepoomich27@gmail.com

const ADMIN_EMAIL = 'strepoomich27@gmail.com';

let currentUser = null;
let userData = null;
let currentCase = null;
let currentWinner = null;
let isSpinning = false;
let isAdmin = false;

// DOM
const loading = document.getElementById('loading');
const authModal = document.getElementById('auth-modal');
const app = document.getElementById('app');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const tabs = document.querySelectorAll('.tab');
const balanceEl = document.getElementById('balance');
const userIdEl = document.getElementById('user-id');
const userNameEl = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');
const depositBtn = document.getElementById('deposit-btn');
const withdrawBtn = document.getElementById('withdraw-btn');
const depositModal = document.getElementById('deposit-modal');
const withdrawModal = document.getElementById('withdraw-modal');
const spinModal = document.getElementById('spin-modal');
const rouletteTrack = document.getElementById('roulette-track');
const spinBtn = document.getElementById('spin-btn');
const spinResult = document.getElementById('spin-result');
const claimBtn = document.getElementById('claim-btn');
const closeSpin = document.getElementById('close-spin');
const closeDeposit = document.getElementById('close-deposit');
const closeWithdraw = document.getElementById('close-withdraw');
const toast = document.getElementById('toast');
const adminNavBtn = document.getElementById('admin-nav-btn');

// ========== AUTH ==========
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.tab;
    if (target === 'login') {
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
    } else {
      loginForm.classList.add('hidden');
      registerForm.classList.remove('hidden');
    }
  });
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    errorEl.textContent = translateAuthError(err.code);
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  let username = document.getElementById('reg-username').value.trim();
  if (!username.startsWith('@')) username = '@' + username;
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const errorEl = document.getElementById('reg-error');
  errorEl.textContent = '';
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    const uid = cred.user.uid;
    const numericId = Math.floor(Date.now() / 1000) % 10000000 + Math.floor(Math.random() * 1000);
    const isAdminUser = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    await db.collection('users').doc(uid).set({
      username,
      email,
      numericId,
      balance: 0,
      inventory: [],
      history: [],
      isAdmin: isAdminUser,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (err) {
    errorEl.textContent = translateAuthError(err.code);
  }
});

function translateAuthError(code) {
  const map = {
    'auth/email-already-in-use': 'Email уже зарегистрирован',
    'auth/invalid-email': 'Неверный email',
    'auth/weak-password': 'Пароль слишком слабый (мин. 6 символов)',
    'auth/user-not-found': 'Пользователь не найден',
    'auth/wrong-password': 'Неверный пароль',
    'auth/invalid-credential': 'Неверный email или пароль',
    'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже'
  };
  return map[code] || 'Ошибка: ' + code;
}

auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    await loadUserData();
    showApp();
  } else {
    currentUser = null;
    userData = null;
    isAdmin = false;
    showAuth();
  }
  loading.classList.add('hidden');
});

async function loadUserData() {
  const doc = await db.collection('users').doc(currentUser.uid).get();
  if (doc.exists) {
    userData = doc.data();
  } else {
    userData = { username: '@unknown', numericId: 0, balance: 0, inventory: [], history: [], email: currentUser.email };
  }
  // Admin check by email (even if flag missing)
  isAdmin = (userData.email || currentUser.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase() || userData.isAdmin === true;
  if (isAdmin) {
    adminNavBtn.classList.remove('hidden');
    // ensure flag in DB
    if (!userData.isAdmin) {
      await db.collection('users').doc(currentUser.uid).update({ isAdmin: true });
      userData.isAdmin = true;
    }
  } else {
    adminNavBtn.classList.add('hidden');
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

function showApp() {
  authModal.classList.add('hidden');
  app.classList.remove('hidden');
}

function showAuth() {
  app.classList.add('hidden');
  authModal.classList.remove('hidden');
}

logoutBtn.addEventListener('click', () => auth.signOut());

// ========== NAVIGATION ==========
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const page = btn.dataset.page;
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById('page-' + page).classList.remove('hidden');
    if (page === 'admin' && isAdmin) loadAdminRequests();
    if (page === 'requests') loadUserRequests();
  });
});

// User requests tabs
document.querySelectorAll('.req-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.req-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const t = tab.dataset.req;
    document.getElementById('user-deposits-list').classList.toggle('hidden', t !== 'deposits');
    document.getElementById('user-withdrawals-list').classList.toggle('hidden', t !== 'withdrawals');
  });
});

// Admin tabs
document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const t = tab.dataset.admin;
    document.getElementById('admin-deposits').classList.toggle('hidden', t !== 'deposits');
    document.getElementById('admin-withdrawals').classList.toggle('hidden', t !== 'withdrawals');
  });
});

// ========== DEPOSIT REQUEST ==========
depositBtn.addEventListener('click', () => {
  document.getElementById('deposit-amount').value = '';
  document.getElementById('deposit-comment').value = '';
  depositModal.classList.remove('hidden');
});

closeDeposit.addEventListener('click', () => depositModal.classList.add('hidden'));

document.getElementById('submit-deposit').addEventListener('click', async () => {
  const amount = parseFloat(document.getElementById('deposit-amount').value);
  const comment = document.getElementById('deposit-comment').value.trim();
  if (!amount || amount < 0.1) {
    showToast('Укажи сумму от 0.1 TON', 'error');
    return;
  }
  try {
    await db.collection('deposit_requests').add({
      userId: currentUser.uid,
      username: userData.username,
      email: userData.email || currentUser.email,
      numericId: userData.numericId,
      amount,
      comment,
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    depositModal.classList.add('hidden');
    showToast('Заявка на пополнение отправлена', 'success');
    loadUserRequests();
    if (isAdmin) loadAdminRequests();
  } catch (err) {
    console.error(err);
    showToast('Ошибка отправки заявки', 'error');
  }
});

// ========== WITHDRAW REQUEST ==========
withdrawBtn.addEventListener('click', () => {
  document.getElementById('withdraw-amount').value = '';
  document.getElementById('withdraw-comment').value = '';
  document.getElementById('withdraw-type').value = 'balance';
  document.getElementById('withdraw-balance-group').classList.remove('hidden');
  document.getElementById('withdraw-item-group').classList.add('hidden');
  fillWithdrawItems();
  withdrawModal.classList.remove('hidden');
});

closeWithdraw.addEventListener('click', () => withdrawModal.classList.add('hidden'));

document.getElementById('withdraw-type').addEventListener('change', (e) => {
  const isItem = e.target.value === 'item';
  document.getElementById('withdraw-balance-group').classList.toggle('hidden', isItem);
  document.getElementById('withdraw-item-group').classList.toggle('hidden', !isItem);
});

function fillWithdrawItems() {
  const select = document.getElementById('withdraw-item-select');
  const inv = userData.inventory || [];
  select.innerHTML = '<option value="">— выбери предмет —</option>';
  inv.forEach((item, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = `${item.emoji} ${item.name} (${item.rarity})`;
    select.appendChild(opt);
  });
}

document.getElementById('submit-withdraw').addEventListener('click', async () => {
  const type = document.getElementById('withdraw-type').value;
  const comment = document.getElementById('withdraw-comment').value.trim();
  let amount = 0;
  let itemData = null;
  let itemIndex = -1;

  if (type === 'balance') {
    amount = parseFloat(document.getElementById('withdraw-amount').value);
    if (!amount || amount < 0.1) {
      showToast('Укажи сумму от 0.1 TON', 'error');
      return;
    }
    if (amount > (userData.balance || 0)) {
      showToast('Недостаточно средств на балансе', 'error');
      return;
    }
  } else {
    itemIndex = parseInt(document.getElementById('withdraw-item-select').value, 10);
    if (isNaN(itemIndex) || itemIndex < 0) {
      showToast('Выбери предмет', 'error');
      return;
    }
    itemData = (userData.inventory || [])[itemIndex];
    if (!itemData) {
      showToast('Предмет не найден', 'error');
      return;
    }
  }

  try {
    // For balance: freeze amount (subtract now, return on reject)
    if (type === 'balance') {
      const newBalance = (userData.balance || 0) - amount;
      await db.collection('users').doc(currentUser.uid).update({ balance: newBalance });
      userData.balance = newBalance;
      updateUI();
    }

    // For item: remove from inventory (return on reject)
    if (type === 'item' && itemIndex >= 0) {
      const inv = [...(userData.inventory || [])];
      inv.splice(itemIndex, 1);
      await db.collection('users').doc(currentUser.uid).update({ inventory: inv });
      userData.inventory = inv;
      updateUI();
    }

    await db.collection('withdraw_requests').add({
      userId: currentUser.uid,
      username: userData.username,
      email: userData.email || currentUser.email,
      numericId: userData.numericId,
      type,
      amount: type === 'balance' ? amount : (itemData?.value || 0),
      item: itemData || null,
      comment,
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    withdrawModal.classList.add('hidden');
    showToast('Заявка на вывод отправлена. Админ свяжется в Telegram.', 'success');
    loadUserRequests();
    if (isAdmin) loadAdminRequests();
  } catch (err) {
    console.error(err);
    showToast('Ошибка отправки заявки', 'error');
  }
});

// ========== USER REQUESTS LIST ==========
async function loadUserRequests() {
  if (!currentUser) return;
  const depList = document.getElementById('user-deposits-list');
  const wdList = document.getElementById('user-withdrawals-list');

  try {
    const depSnap = await db.collection('deposit_requests')
      .where('userId', '==', currentUser.uid)
      .orderBy('createdAt', 'desc')
      .limit(30)
      .get();
    if (depSnap.empty) {
      depList.innerHTML = '<p class="empty-state">Заявок на пополнение нет</p>';
    } else {
      depList.innerHTML = depSnap.docs.map(d => {
        const r = d.data();
        return renderUserRequestCard(r, 'deposit');
      }).join('');
    }
  } catch (e) {
    // fallback without orderBy if index missing
    try {
      const depSnap = await db.collection('deposit_requests').where('userId', '==', currentUser.uid).limit(30).get();
      const docs = depSnap.docs.sort((a, b) => (b.data().createdAt?.seconds || 0) - (a.data().createdAt?.seconds || 0));
      depList.innerHTML = docs.length ? docs.map(d => renderUserRequestCard(d.data(), 'deposit')).join('') : '<p class="empty-state">Заявок на пополнение нет</p>';
    } catch (e2) {
      depList.innerHTML = '<p class="empty-state">Не удалось загрузить</p>';
    }
  }

  try {
    const wdSnap = await db.collection('withdraw_requests')
      .where('userId', '==', currentUser.uid)
      .orderBy('createdAt', 'desc')
      .limit(30)
      .get();
    if (wdSnap.empty) {
      wdList.innerHTML = '<p class="empty-state">Заявок на вывод нет</p>';
    } else {
      wdList.innerHTML = wdSnap.docs.map(d => renderUserRequestCard(d.data(), 'withdraw')).join('');
    }
  } catch (e) {
    try {
      const wdSnap = await db.collection('withdraw_requests').where('userId', '==', currentUser.uid).limit(30).get();
      const docs = wdSnap.docs.sort((a, b) => (b.data().createdAt?.seconds || 0) - (a.data().createdAt?.seconds || 0));
      wdList.innerHTML = docs.length ? docs.map(d => renderUserRequestCard(d.data(), 'withdraw')).join('') : '<p class="empty-state">Заявок на вывод нет</p>';
    } catch (e2) {
      wdList.innerHTML = '<p class="empty-state">Не удалось загрузить</p>';
    }
  }
}

function renderUserRequestCard(r, kind) {
  const statusClass = 'status-' + (r.status || 'pending');
  const statusText = { pending: 'Ожидает', approved: 'Одобрено', rejected: 'Отклонено', completed: 'Выполнено' }[r.status] || r.status;
  let detail = '';
  if (kind === 'deposit') {
    detail = `<strong>+${r.amount} TON</strong>`;
  } else {
    if (r.type === 'item' && r.item) {
      detail = `<strong>${r.item.emoji || ''} ${r.item.name}</strong>`;
    } else {
      detail = `<strong>−${r.amount} TON</strong>`;
    }
  }
  return `
    <div class="request-card">
      <div class="info">
        ${detail}
        <div class="meta">
          ${r.comment ? r.comment + '<br>' : ''}
          ${formatTs(r.createdAt)}
        </div>
      </div>
      <span class="status ${statusClass}">${statusText}</span>
    </div>
  `;
}

// ========== ADMIN REQUESTS ==========
async function loadAdminRequests() {
  if (!isAdmin) return;
  const depEl = document.getElementById('admin-deposits');
  const wdEl = document.getElementById('admin-withdrawals');

  try {
    let depDocs = [];
    try {
      const snap = await db.collection('deposit_requests').orderBy('createdAt', 'desc').limit(50).get();
      depDocs = snap.docs;
    } catch (e) {
      const snap = await db.collection('deposit_requests').limit(50).get();
      depDocs = snap.docs.sort((a, b) => (b.data().createdAt?.seconds || 0) - (a.data().createdAt?.seconds || 0));
    }
    const pendingDep = depDocs.filter(d => d.data().status === 'pending').length;
    document.getElementById('dep-count').textContent = pendingDep;
    if (depDocs.length === 0) {
      depEl.innerHTML = '<p class="empty-state">Заявок нет</p>';
    } else {
      depEl.innerHTML = depDocs.map(d => renderAdminDepositCard(d.id, d.data())).join('');
    }
  } catch (e) {
    console.error(e);
    depEl.innerHTML = '<p class="empty-state">Ошибка загрузки</p>';
  }

  try {
    let wdDocs = [];
    try {
      const snap = await db.collection('withdraw_requests').orderBy('createdAt', 'desc').limit(50).get();
      wdDocs = snap.docs;
    } catch (e) {
      const snap = await db.collection('withdraw_requests').limit(50).get();
      wdDocs = snap.docs.sort((a, b) => (b.data().createdAt?.seconds || 0) - (a.data().createdAt?.seconds || 0));
    }
    const pendingWd = wdDocs.filter(d => d.data().status === 'pending').length;
    document.getElementById('wd-count').textContent = pendingWd;
    if (wdDocs.length === 0) {
      wdEl.innerHTML = '<p class="empty-state">Заявок нет</p>';
    } else {
      wdEl.innerHTML = wdDocs.map(d => renderAdminWithdrawCard(d.id, d.data())).join('');
    }
  } catch (e) {
    console.error(e);
    wdEl.innerHTML = '<p class="empty-state">Ошибка загрузки</p>';
  }

  // Bind admin buttons
  depEl.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => handleAdminDeposit(btn.dataset.id, btn.dataset.action));
  });
  wdEl.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => handleAdminWithdraw(btn.dataset.id, btn.dataset.action));
  });
}

function renderAdminDepositCard(id, r) {
  const statusClass = 'status-' + (r.status || 'pending');
  const statusText = { pending: 'Ожидает', approved: 'Одобрено', rejected: 'Отклонено', completed: 'Выполнено' }[r.status] || r.status;
  const actions = r.status === 'pending' ? `
    <div class="request-actions">
      <button class="btn btn-approve" data-id="${id}" data-action="approve">Одобрить (+${r.amount} TON)</button>
      <button class="btn btn-reject" data-id="${id}" data-action="reject">Отклонить</button>
    </div>
  ` : '';
  return `
    <div class="request-card">
      <div class="info">
        <strong>+${r.amount} TON</strong>
        <div class="meta">
          ${r.username} · ID ${r.numericId} · ${r.email || ''}<br>
          ${r.comment || '—'}<br>
          ${formatTs(r.createdAt)}
        </div>
      </div>
      <span class="status ${statusClass}">${statusText}</span>
      ${actions}
    </div>
  `;
}

function renderAdminWithdrawCard(id, r) {
  const statusClass = 'status-' + (r.status || 'pending');
  const statusText = { pending: 'Ожидает', approved: 'Одобрено', rejected: 'Отклонено', completed: 'Выполнено' }[r.status] || r.status;
  let detail = r.type === 'item' && r.item
    ? `${r.item.emoji || ''} ${r.item.name} (${r.item.rarity})`
    : `−${r.amount} TON`;
  let actions = '';
  if (r.status === 'pending') {
    actions = `
      <div class="request-actions">
        <button class="btn btn-approve" data-id="${id}" data-action="approve">Одобрить</button>
        <button class="btn btn-complete" data-id="${id}" data-action="complete">Выдано / Переведено</button>
        <button class="btn btn-reject" data-id="${id}" data-action="reject">Отклонить (вернуть)</button>
      </div>
    `;
  } else if (r.status === 'approved') {
    actions = `
      <div class="request-actions">
        <button class="btn btn-complete" data-id="${id}" data-action="complete">Выдано / Переведено</button>
      </div>
    `;
  }
  return `
    <div class="request-card">
      <div class="info">
        <strong>${detail}</strong>
        <div class="meta">
          ${r.username} · ID ${r.numericId} · ${r.email || ''}<br>
          Тип: ${r.type === 'item' ? 'Предмет' : 'Баланс'} · ${r.comment || '—'}<br>
          ${formatTs(r.createdAt)}
        </div>
      </div>
      <span class="status ${statusClass}">${statusText}</span>
      ${actions}
    </div>
  `;
}

async function handleAdminDeposit(id, action) {
  try {
    const ref = db.collection('deposit_requests').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return;
    const r = snap.data();
    if (r.status !== 'pending') return;

    if (action === 'approve') {
      // Add balance to user
      const userRef = db.collection('users').doc(r.userId);
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        const bal = (userSnap.data().balance || 0) + r.amount;
        await userRef.update({ balance: bal });
      }
      await ref.update({ status: 'approved', processedAt: firebase.firestore.FieldValue.serverTimestamp(), processedBy: currentUser.uid });
      showToast(`Пополнение ${r.amount} TON одобрено для ${r.username}`, 'success');
    } else if (action === 'reject') {
      await ref.update({ status: 'rejected', processedAt: firebase.firestore.FieldValue.serverTimestamp(), processedBy: currentUser.uid });
      showToast('Заявка отклонена', 'success');
    }
    loadAdminRequests();
    // refresh own UI if same user
    if (r.userId === currentUser.uid) {
      await loadUserData();
    }
  } catch (err) {
    console.error(err);
    showToast('Ошибка', 'error');
  }
}

async function handleAdminWithdraw(id, action) {
  try {
    const ref = db.collection('withdraw_requests').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return;
    const r = snap.data();

    if (action === 'approve' && r.status === 'pending') {
      await ref.update({ status: 'approved', processedAt: firebase.firestore.FieldValue.serverTimestamp(), processedBy: currentUser.uid });
      showToast(`Вывод одобрен. Напиши ${r.username} в Telegram`, 'success');
    } else if (action === 'complete' && (r.status === 'pending' || r.status === 'approved')) {
      await ref.update({ status: 'completed', processedAt: firebase.firestore.FieldValue.serverTimestamp(), processedBy: currentUser.uid });
      showToast('Отмечено как выдано/переведено', 'success');
    } else if (action === 'reject' && r.status === 'pending') {
      // Return funds / item
      const userRef = db.collection('users').doc(r.userId);
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        const ud = userSnap.data();
        if (r.type === 'balance') {
          await userRef.update({ balance: (ud.balance || 0) + (r.amount || 0) });
        } else if (r.type === 'item' && r.item) {
          const inv = ud.inventory || [];
          inv.unshift(r.item);
          await userRef.update({ inventory: inv });
        }
      }
      await ref.update({ status: 'rejected', processedAt: firebase.firestore.FieldValue.serverTimestamp(), processedBy: currentUser.uid });
      showToast('Заявка отклонена, средства/предмет возвращены', 'success');
    }
    loadAdminRequests();
    if (r.userId === currentUser.uid) await loadUserData();
  } catch (err) {
    console.error(err);
    showToast('Ошибка', 'error');
  }
}

function formatTs(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// ========== OPEN CASE (same as before) ==========
document.querySelectorAll('.btn-open').forEach(btn => {
  btn.addEventListener('click', () => openCase(btn.dataset.case));
});

function openCase(caseId) {
  const caseData = CASES[caseId];
  if (!caseData) return;
  if ((userData.balance || 0) < caseData.price) {
    showToast('Недостаточно TON. Создай заявку на пополнение.', 'error');
    return;
  }
  currentCase = caseId;
  currentWinner = null;
  isSpinning = false;
  document.getElementById('spin-case-name').textContent = caseData.name;
  spinResult.classList.add('hidden');
  spinBtn.classList.remove('hidden');
  spinBtn.disabled = false;
  spinBtn.textContent = 'Крутить';
  const dummyWinner = caseData.items[0];
  const { items } = generateRouletteItems(caseId, dummyWinner, 50);
  renderRoulette(items);
  spinModal.classList.remove('hidden');
}

function renderRoulette(items) {
  rouletteTrack.innerHTML = '';
  rouletteTrack.style.transition = 'none';
  rouletteTrack.style.transform = 'translateX(0)';
  items.forEach(item => {
    const el = document.createElement('div');
    el.className = `roulette-item rarity-${item.rarity}`;
    el.innerHTML = `<span class="emoji">${item.emoji}</span><span class="name">${item.name}</span>`;
    rouletteTrack.appendChild(el);
  });
}

spinBtn.addEventListener('click', async () => {
  if (isSpinning || !currentCase) return;
  const caseData = CASES[currentCase];
  if ((userData.balance || 0) < caseData.price) {
    showToast('Недостаточно TON', 'error');
    return;
  }
  isSpinning = true;
  spinBtn.disabled = true;
  spinBtn.textContent = 'Крутим...';
  const newBalance = userData.balance - caseData.price;
  try {
    await db.collection('users').doc(currentUser.uid).update({ balance: newBalance });
    userData.balance = newBalance;
    updateUI();
  } catch (err) {
    showToast('Ошибка списания', 'error');
    isSpinning = false;
    spinBtn.disabled = false;
    spinBtn.textContent = 'Крутить';
    return;
  }
  currentWinner = rollItem(currentCase);
  const { items, winIndex } = generateRouletteItems(currentCase, currentWinner, 60);
  renderRoulette(items);
  const itemWidth = 118;
  const targetOffset = winIndex * itemWidth - (rouletteTrack.parentElement.offsetWidth / 2) + (itemWidth / 2);
  const distance = targetOffset + Math.random() * 40 - 20;
  rouletteTrack.offsetHeight;
  rouletteTrack.style.transition = 'transform 5.5s cubic-bezier(0.15, 0.85, 0.25, 1)';
  rouletteTrack.style.transform = `translateX(-${distance}px)`;
  setTimeout(() => {
    isSpinning = false;
    spinBtn.classList.add('hidden');
    showResult(currentWinner);
  }, 5600);
});

function showResult(item) {
  document.getElementById('result-emoji').textContent = item.emoji;
  document.getElementById('result-name').textContent = item.name;
  const rarityEl = document.getElementById('result-rarity');
  rarityEl.textContent = item.rarity;
  rarityEl.className = 'rarity ' + item.rarity;
  document.getElementById('result-value').textContent = item.value.toFixed(2) + ' TON';
  spinResult.classList.remove('hidden');
}

claimBtn.addEventListener('click', async () => {
  if (!currentWinner || !currentUser) return;
  const item = { ...currentWinner, caseId: currentCase, wonAt: new Date().toISOString() };
  const inventory = userData.inventory || [];
  const history = userData.history || [];
  inventory.unshift(item);
  history.unshift({ ...item, caseName: CASES[currentCase].name });
  if (history.length > 50) history.length = 50;
  if (inventory.length > 100) inventory.length = 100;
  try {
    await db.collection('users').doc(currentUser.uid).update({ inventory, history });
    userData.inventory = inventory;
    userData.history = history;
    updateUI();
    spinModal.classList.add('hidden');
    showToast(`Получено: ${item.name}`, 'success');
  } catch (err) {
    showToast('Ошибка сохранения', 'error');
  }
});

closeSpin.addEventListener('click', () => {
  if (isSpinning) return;
  spinModal.classList.add('hidden');
});

function renderInventory() {
  const grid = document.getElementById('inventory-grid');
  const inv = userData.inventory || [];
  if (inv.length === 0) {
    grid.innerHTML = '<p class="empty-state">Пока пусто. Открой кейс!</p>';
    return;
  }
  grid.innerHTML = inv.map(item => `
    <div class="inv-item">
      <span class="emoji">${item.emoji}</span>
      <div class="name">${item.name}</div>
      <div class="rarity ${item.rarity}">${item.rarity}</div>
    </div>
  `).join('');
}

function renderHistory() {
  const list = document.getElementById('history-list');
  const hist = userData.history || [];
  if (hist.length === 0) {
    list.innerHTML = '<p class="empty-state">История пуста</p>';
    return;
  }
  list.innerHTML = hist.map(item => `
    <div class="history-item">
      <span class="emoji">${item.emoji}</span>
      <div class="info">
        <div class="name">${item.name}</div>
        <div class="meta">${item.caseName || item.caseId} · ${formatDate(item.wonAt)}</div>
      </div>
      <div class="value">${item.value?.toFixed(2) || '0'} TON</div>
    </div>
  `).join('');
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function showToast(msg, type = 'success') {
  toast.textContent = msg;
  toast.className = 'toast ' + type;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3500);
}

[spinModal, depositModal, withdrawModal].forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal && !isSpinning) modal.classList.add('hidden');
  });
});

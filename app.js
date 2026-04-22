// ── Config ────────────────────────────────────────────────────
const API = 'https://fitnow-api-production.up.railway.app/api';

// ── State ─────────────────────────────────────────────────────
let token = localStorage.getItem('fn_token');
let currentUser = null;
let allActivities = [];
let currentActivityId = null;
let previousScreen = 'explore';
let selectedRole = 'athlete';
let activeFilter = null;

// ── API Client ────────────────────────────────────────────────
async function api(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${API}${path}`, opts);

  if (res.status === 401) {
    doLogout();
    throw new Error('Sesión expirada. Ingresá nuevamente.');
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.error || `Error ${res.status}`);
  }

  return data;
}

// ── Auth ──────────────────────────────────────────────────────
function openAuth(tab) {
  document.getElementById('auth-modal').classList.remove('hidden');
  switchAuthTab(tab || 'login');
}

function closeAuth() {
  document.getElementById('auth-modal').classList.add('hidden');
}

function switchAuthTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('tab-login').classList.toggle('active', isLogin);
  document.getElementById('tab-register').classList.toggle('active', !isLogin);
  document.getElementById('form-login').classList.toggle('hidden', !isLogin);
  document.getElementById('form-register').classList.toggle('hidden', isLogin);
}

function selectRole(role) {
  selectedRole = role;
  document.getElementById('role-athlete').classList.toggle('active', role === 'athlete');
  document.getElementById('role-provider').classList.toggle('active', role === 'provider');
  document.getElementById('provider-fields').classList.toggle('hidden', role !== 'provider');

  const nameInput = document.getElementById('reg-provider-name');
  const addrInput = document.getElementById('reg-provider-address');
  if (nameInput) nameInput.required = role === 'provider';
  if (addrInput) addrInput.required = role === 'provider';
}

async function submitLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  const errEl = document.getElementById('login-error');

  btn.disabled = true;
  btn.textContent = 'Ingresando...';
  errEl.classList.add('hidden');

  try {
    const data = await api('POST', '/auth/login', {
      email: document.getElementById('login-email').value.trim(),
      password: document.getElementById('login-password').value,
    });
    token = data.token;
    localStorage.setItem('fn_token', token);
    currentUser = data.user;
    closeAuth();
    enterApp();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Entrar';
  }
}

async function submitRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('register-btn');
  const errEl = document.getElementById('register-error');

  btn.disabled = true;
  btn.textContent = 'Creando cuenta...';
  errEl.classList.add('hidden');

  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  try {
    let endpoint, body;

    if (selectedRole === 'provider') {
      endpoint = '/auth/register-provider';
      body = {
        name,
        email,
        password,
        provider_name: document.getElementById('reg-provider-name').value.trim(),
        address: document.getElementById('reg-provider-address').value.trim(),
      };
    } else {
      endpoint = '/auth/register';
      body = { name, email, password };
    }

    const data = await api('POST', endpoint, body);
    token = data.token;
    localStorage.setItem('fn_token', token);
    currentUser = data.user;
    closeAuth();
    showToast('¡Cuenta creada! Bienvenido a FitNow 🎉');
    enterApp();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Crear cuenta';
  }
}

function doLogout() {
  token = null;
  currentUser = null;
  allActivities = [];
  localStorage.removeItem('fn_token');
  document.getElementById('app').classList.add('hidden');
  document.getElementById('landing').classList.remove('hidden');
}

// ── App Shell ─────────────────────────────────────────────────
function enterApp() {
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  renderBottomNav();
  renderHeaderAvatar();
  const startScreen = currentUser.role === 'provider_admin' ? 'provider' : 'explore';
  showScreen(startScreen);
}

function renderBottomNav() {
  const nav = document.getElementById('bottom-nav');
  const isProvider = currentUser.role === 'provider_admin';

  if (isProvider) {
    nav.innerHTML = `
      <button class="nav-btn" data-screen="provider" onclick="showScreen('provider')">
        <svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
        <span>Panel</span>
      </button>
      <button class="nav-btn" data-screen="explore" onclick="showScreen('explore')">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z"/></svg>
        <span>Explorar</span>
      </button>
      <button class="nav-btn" data-screen="profile" onclick="showScreen('profile')">
        <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 3a3 3 0 110 6 3 3 0 010-6zm0 14.2a7.2 7.2 0 01-6-3.22c.03-1.99 4-3.08 6-3.08s5.96 1.09 6 3.08a7.2 7.2 0 01-6 3.22z"/></svg>
        <span>Perfil</span>
      </button>
    `;
  } else {
    nav.innerHTML = `
      <button class="nav-btn" data-screen="explore" onclick="showScreen('explore')">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z"/></svg>
        <span>Explorar</span>
      </button>
      <button class="nav-btn" data-screen="enrollments" onclick="showScreen('enrollments')">
        <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H5V8h14v11zm-7-9H7v5h5v-5z"/></svg>
        <span>Mis Clases</span>
      </button>
      <button class="nav-btn" data-screen="profile" onclick="showScreen('profile')">
        <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 3a3 3 0 110 6 3 3 0 010-6zm0 14.2a7.2 7.2 0 01-6-3.22c.03-1.99 4-3.08 6-3.08s5.96 1.09 6 3.08a7.2 7.2 0 01-6 3.22z"/></svg>
        <span>Perfil</span>
      </button>
    `;
  }
}

function renderHeaderAvatar() {
  const el = document.getElementById('header-avatar');
  el.textContent = (currentUser.name || 'U').charAt(0).toUpperCase();
}

// ── Navigation ────────────────────────────────────────────────
function showScreen(name) {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.screen === name);
  });
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(`screen-${name}`);
  if (target) target.classList.add('active');

  if (name === 'explore') loadExplore();
  if (name === 'enrollments') loadEnrollments();
  if (name === 'provider') loadProviderDashboard();
  if (name === 'profile') loadProfile();
}

function goBack() {
  showScreen(previousScreen);
}

function openActivityDetail(id) {
  const active = document.querySelector('.screen.active');
  previousScreen = active ? active.id.replace('screen-', '') : 'explore';
  currentActivityId = id;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('screen-activity').classList.add('active');
  loadActivityDetail(id);
}

// ── Explore ───────────────────────────────────────────────────
async function loadExplore() {
  const list = document.getElementById('activities-list');
  if (allActivities.length > 0) {
    renderActivities(allActivities);
    return;
  }

  list.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Cargando actividades...</p></div>';

  try {
    const data = await api('GET', '/activities');
    allActivities = normalizeList(data, 'activities');
    renderActivities(allActivities);
  } catch (err) {
    list.innerHTML = `
      <div class="empty-state">
        <p>No se pudieron cargar las actividades</p>
        <button class="cta-btn" onclick="allActivities=[];loadExplore()">Reintentar</button>
      </div>`;
  }
}

function renderActivities(activities) {
  const list = document.getElementById('activities-list');
  const search = (document.getElementById('search-input').value || '').toLowerCase();

  let filtered = activities.filter(a => a.status === 'active' || !a.status);

  if (activeFilter) {
    filtered = filtered.filter(a =>
      (a.difficulty || '').toLowerCase().includes(activeFilter)
    );
  }

  if (search) {
    filtered = filtered.filter(a =>
      (a.name || '').toLowerCase().includes(search) ||
      (a.description || '').toLowerCase().includes(search) ||
      (a.provider_name || '').toLowerCase().includes(search)
    );
  }

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>No se encontraron actividades</p></div>';
    return;
  }

  list.innerHTML = filtered.map(a => activityCard(a)).join('');
}

function activityCard(a) {
  const price = a.price != null ? `<div class="activity-price">$${Number(a.price).toLocaleString('es-AR')}</div>` : '';
  const desc = a.description ? `<p class="activity-desc">${escHtml(a.description.slice(0, 90))}${a.description.length > 90 ? '…' : ''}</p>` : '';
  const tags = [
    a.difficulty ? `<span class="tag">${escHtml(a.difficulty)}</span>` : '',
    a.capacity ? `<span class="tag tag--slate">${a.capacity} lugares</span>` : '',
    (a.status === 'active') ? '<span class="tag tag--green">Activo</span>' : '',
  ].filter(Boolean).join('');

  return `
    <div class="activity-card" onclick="openActivityDetail(${a.id})">
      <div class="activity-card-header">
        <div class="activity-card-icon" style="background: var(--grad-primary)">
          <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H5V8h14v11zm-7-9H7v5h5v-5z"/></svg>
        </div>
        <div class="activity-card-info">
          <h3>${escHtml(a.name || 'Actividad')}</h3>
          <p class="activity-provider">${escHtml(a.provider_name || a.provider?.name || '')}</p>
        </div>
        ${price}
      </div>
      ${desc}
      ${tags ? `<div class="activity-tags">${tags}</div>` : ''}
    </div>`;
}

function filterActivities() {
  renderActivities(allActivities);
}

function filterByCategory(cat, btn) {
  activeFilter = cat;
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  renderActivities(allActivities);
}

// ── Activity Detail ───────────────────────────────────────────
async function loadActivityDetail(id) {
  const el = document.getElementById('activity-detail-content');
  el.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Cargando...</p></div>';

  try {
    const [activity, sessionsData] = await Promise.all([
      api('GET', `/activities/${id}`),
      api('GET', `/activities/${id}/sessions`).catch(() => []),
    ]);

    const sessions = normalizeList(sessionsData, 'sessions');
    const isProvider = currentUser.role === 'provider_admin';

    const metaItems = [
      activity.price != null ? `<div class="meta-item"><span class="meta-label">Precio</span><span class="meta-val">$${Number(activity.price).toLocaleString('es-AR')}/mes</span></div>` : '',
      activity.capacity ? `<div class="meta-item"><span class="meta-label">Capacidad</span><span class="meta-val">${activity.capacity} personas</span></div>` : '',
      activity.difficulty ? `<div class="meta-item"><span class="meta-label">Nivel</span><span class="meta-val">${escHtml(activity.difficulty)}</span></div>` : '',
    ].filter(Boolean).join('');

    const sessionsHtml = sessions.length > 0 ? `
      <h3 class="section-heading">Próximas sesiones</h3>
      <div class="sessions-list">
        ${sessions.slice(0, 6).map(s => `
          <div class="session-row">
            <div class="session-info">
              <span class="session-date">${formatDate(s.start_time)}</span>
              <span class="session-time">${formatTime(s.start_time)} – ${formatTime(s.end_time)}</span>
            </div>
            ${!isProvider ? `<button class="session-book-btn" onclick="bookSession(${s.id}, this)">Reservar</button>` : ''}
          </div>`).join('')}
      </div>` : '';

    el.innerHTML = `
      <div class="detail-hero">
        <div class="detail-icon" style="background: var(--grad-primary)">
          <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H5V8h14v11zm-7-9H7v5h5v-5z"/></svg>
        </div>
        <div>
          <h1 class="detail-title">${escHtml(activity.name || '')}</h1>
          <p class="detail-provider">${escHtml(activity.provider_name || activity.provider?.name || '')}</p>
        </div>
      </div>

      ${activity.description ? `<p class="detail-desc">${escHtml(activity.description)}</p>` : ''}

      ${metaItems ? `<div class="detail-meta">${metaItems}</div>` : ''}

      ${sessionsHtml}

      ${!isProvider ? `
        <button class="cta-btn enroll-btn" id="enroll-btn-${id}" onclick="enrollActivity(${id}, this)">
          Inscribirse a la actividad
        </button>` : ''}
    `;
  } catch (err) {
    el.innerHTML = `<div class="empty-state"><p>${escHtml(err.message)}</p></div>`;
  }
}

async function enrollActivity(activityId, btn) {
  btn.disabled = true;
  btn.textContent = 'Inscribiendo...';
  try {
    await api('POST', '/enrollments', { activity_id: activityId });
    showToast('¡Inscripción exitosa!');
    btn.textContent = '✓ Inscripto';
    btn.style.background = 'var(--grad-success)';
    btn.style.boxShadow = '0 8px 24px rgba(0,230,118,0.3)';
  } catch (err) {
    showToast(err.message, 'error');
    btn.disabled = false;
    btn.textContent = 'Inscribirse a la actividad';
  }
}

async function bookSession(sessionId, btn) {
  btn.disabled = true;
  btn.textContent = '...';
  try {
    await api('POST', `/sessions/${sessionId}/book`);
    showToast('¡Sesión reservada!');
    btn.textContent = '✓ Reservado';
    btn.style.color = 'var(--fn-green)';
    btn.style.borderColor = 'var(--fn-green)';
  } catch (err) {
    showToast(err.message, 'error');
    btn.disabled = false;
    btn.textContent = 'Reservar';
  }
}

// ── Enrollments ───────────────────────────────────────────────
async function loadEnrollments() {
  const list = document.getElementById('enrollments-list');
  list.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Cargando clases...</p></div>';

  try {
    const data = await api('GET', '/enrollments/mine');
    const enrollments = normalizeList(data, 'enrollments');

    if (enrollments.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H5V8h14v11zm-7-9H7v5h5v-5z"/></svg>
          <p>Todavía no te inscribiste en ninguna clase</p>
          <button class="cta-btn" onclick="showScreen('explore')">Explorar actividades</button>
        </div>`;
      return;
    }

    list.innerHTML = enrollments.map(e => `
      <div class="enrollment-card">
        <div class="enrollment-info">
          <h3>${escHtml(e.activity_name || e.activity?.name || 'Actividad')}</h3>
          <p>${escHtml(e.provider_name || e.activity?.provider_name || '')}</p>
          <div class="enrollment-meta">
            <span class="tag tag--green">${escHtml(e.status || 'activo')}</span>
            ${e.enrolled_at ? `<span class="tag tag--slate">Desde ${formatDate(e.enrolled_at)}</span>` : ''}
          </div>
        </div>
        <button class="cancel-btn" title="Cancelar inscripción" onclick="cancelEnrollment(${e.id}, this)">
          <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>`).join('');
  } catch (err) {
    list.innerHTML = `<div class="empty-state"><p>Error al cargar: ${escHtml(err.message)}</p></div>`;
  }
}

async function cancelEnrollment(id, btn) {
  if (!confirm('¿Cancelar inscripción?')) return;
  btn.disabled = true;
  try {
    await api('DELETE', `/enrollments/${id}`);
    showToast('Inscripción cancelada');
    loadEnrollments();
  } catch (err) {
    showToast(err.message, 'error');
    btn.disabled = false;
  }
}

// ── Provider Dashboard ────────────────────────────────────────
async function loadProviderDashboard() {
  const el = document.getElementById('provider-content');
  el.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Cargando panel...</p></div>';

  try {
    const [enrollmentsData, activitiesData] = await Promise.all([
      api('GET', '/enrollments/provider').catch(() => []),
      api('GET', '/activities'),
    ]);

    const enrollments = normalizeList(enrollmentsData, 'enrollments');
    const allActs = normalizeList(activitiesData, 'activities');
    const myActs = allActs.filter(a => a.provider_id === currentUser.provider_id);

    el.innerHTML = `
      <div class="provider-stats">
        <div class="pstat">
          <div class="pstat-val">${myActs.length}</div>
          <div class="pstat-label">Actividades</div>
        </div>
        <div class="pstat">
          <div class="pstat-val">${enrollments.length}</div>
          <div class="pstat-label">Inscriptos</div>
        </div>
      </div>

      ${myActs.length > 0 ? `
        <h3 class="section-heading">Mis actividades</h3>
        <div class="card-list">
          ${myActs.map(a => activityCard(a)).join('')}
        </div>` : `<div class="empty-state"><p>Todavía no tenés actividades creadas</p></div>`}

      ${enrollments.length > 0 ? `
        <h3 class="section-heading" style="margin-top:24px">Últimas inscripciones</h3>
        <div class="card-list">
          ${enrollments.slice(0, 10).map(e => `
            <div class="enrollment-card">
              <div class="enrollment-info">
                <h3>${escHtml(e.user_name || e.user?.name || 'Usuario')}</h3>
                <p>${escHtml(e.activity_name || e.activity?.name || '')}</p>
                <div class="enrollment-meta">
                  <span class="tag tag--green">${escHtml(e.status || 'activo')}</span>
                </div>
              </div>
            </div>`).join('')}
        </div>` : ''}
    `;
  } catch (err) {
    el.innerHTML = `<div class="empty-state"><p>Error: ${escHtml(err.message)}</p></div>`;
  }
}

// ── Profile ───────────────────────────────────────────────────
function loadProfile() {
  const el = document.getElementById('profile-content');
  if (!currentUser) return;

  const initials = (currentUser.name || 'U')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const roleLabels = {
    user: 'Atleta',
    provider_admin: 'Proveedor',
    admin: 'Administrador',
  };
  const roleLabel = roleLabels[currentUser.role] || currentUser.role;

  el.innerHTML = `
    <div class="profile-card">
      <div class="profile-avatar">${initials}</div>
      <h2 class="profile-name">${escHtml(currentUser.name || '')}</h2>
      <p class="profile-email">${escHtml(currentUser.email || '')}</p>
      <span class="tag tag--blue">${roleLabel}</span>
    </div>
    <div class="profile-actions">
      <button class="logout-btn" onclick="doLogout()">
        <svg viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4a2 2 0 00-2 2v14a2 2 0 002 2h8v-2H4V5z"/></svg>
        Cerrar sesión
      </button>
    </div>`;
}

// ── Helpers ───────────────────────────────────────────────────
function normalizeList(data, key) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data[key])) return data[key];
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-AR', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast toast--${type === 'error' ? 'error' : 'success'}`;
  setTimeout(() => t.classList.add('hidden'), 3200);
}

// ── PWA Install ───────────────────────────────────────────────
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
});

function closeIosPrompt() {
  document.getElementById('iosPrompt').classList.remove('visible');
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

window.addEventListener('load', () => {
  if (isIos() && !isStandalone()) {
    setTimeout(() => {
      document.getElementById('iosPrompt').classList.add('visible');
    }, 4000);
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// ── Init ──────────────────────────────────────────────────────
async function init() {
  if (!token) return;
  try {
    currentUser = await api('GET', '/auth/me');
    enterApp();
  } catch {
    localStorage.removeItem('fn_token');
    token = null;
  }
}

init();

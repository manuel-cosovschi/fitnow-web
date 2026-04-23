// ── Config ────────────────────────────────────────────────────
const API = 'https://fitnow-api-production.up.railway.app/api';

// ── State ─────────────────────────────────────────────────────
let token = localStorage.getItem('fn_token');
let currentUser = null;
let allActivities = [];
let enrolledIds = new Set();
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
  const startScreen = currentUser.role === 'provider_admin' ? 'provider' : 'home';
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
      <button class="nav-btn" data-screen="home" onclick="showScreen('home')">
        <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
        <span>Home</span>
      </button>
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

  if (name === 'home') loadHome();
  if (name === 'explore') loadExplore();
  if (name === 'enrollments') loadEnrollments();
  if (name === 'offers') loadOffers();
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
    allActivities = normalizeList(data, 'items');
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
      (a.kind || '').toLowerCase() === activeFilter ||
      (a.modality || '').toLowerCase() === activeFilter
    );
  }

  if (search) {
    filtered = filtered.filter(a =>
      (a.title || '').toLowerCase().includes(search) ||
      (a.description || '').toLowerCase().includes(search) ||
      (a.provider_name || '').toLowerCase().includes(search) ||
      (a.location || '').toLowerCase().includes(search)
    );
  }

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>No se encontraron actividades</p></div>';
    return;
  }

  list.innerHTML = filtered.map(a => activityCard(a)).join('');
}

const KIND_ICONS = {
  gym: `<path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>`,
  club: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z"/>`,
  trainer: `<path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3A7.03 7.03 0 0019 13v-2a4.85 4.85 0 01-4.3-2.4l-1-1.6a2.01 2.01 0 00-1.7-1c-.3 0-.5.1-.8.1L6 9v5h2v-4l2.1-1.1-1.8 8.6L4 16.1l-.7 1.9 5.3 2.1.3.2z"/>`,
  default: `<path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H5V8h14v11zm-7-9H7v5h5v-5z"/>`,
};

const KIND_COLORS = {
  gym: 'var(--grad-primary)',
  club: 'var(--grad-success)',
  trainer: 'var(--grad-purple)',
  club_sport: 'linear-gradient(135deg, var(--fn-amber), #E65100)',
};

function activityCard(a) {
  const icon = KIND_ICONS[a.kind] || KIND_ICONS.default;
  const color = KIND_COLORS[a.kind] || 'var(--grad-primary)';
  const price = a.price != null ? `<div class="activity-price">$${Number(a.price).toLocaleString('es-AR')}</div>` : '';
  const desc = a.description ? `<p class="activity-desc">${escHtml(a.description.slice(0, 90))}${a.description.length > 90 ? '…' : ''}</p>` : '';
  const seatsTag = a.seats_left != null
    ? `<span class="tag ${a.seats_left === 0 ? 'tag--red' : 'tag--slate'}">${a.seats_left === 0 ? 'Sin lugares' : `${a.seats_left} lugares`}</span>`
    : '';
  const tags = [
    a.difficulty ? `<span class="tag">${escHtml(a.difficulty)}</span>` : '',
    seatsTag,
    a.modality ? `<span class="tag tag--slate">${escHtml(a.modality)}</span>` : '',
  ].filter(Boolean).join('');

  return `
    <div class="activity-card" onclick="openActivityDetail(${a.id})">
      <div class="activity-card-header">
        <div class="activity-card-icon" style="background: ${color}">
          <svg viewBox="0 0 24 24">${icon}</svg>
        </div>
        <div class="activity-card-info">
          <h3>${escHtml(a.title || 'Actividad')}</h3>
          <p class="activity-provider">${escHtml(a.provider_name || '')}</p>
        </div>
        ${price}
      </div>
      ${desc}
      ${a.location ? `<p class="activity-location"><svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>${escHtml(a.location)}</p>` : ''}
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

// ── Home ──────────────────────────────────────────────────────
async function loadHome() {
  const el = document.getElementById('home-content');
  el.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Cargando...</p></div>';

  const firstName = (currentUser?.name || '').split(' ')[0] || 'Atleta';
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Buen día' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';

  try {
    const [activitiesData, enrollmentsData] = await Promise.all([
      api('GET', '/activities').catch(() => []),
      api('GET', '/enrollments/mine').catch(() => []),
    ]);

    const activities = normalizeList(activitiesData, 'items');
    allActivities = activities;
    const enrollments = normalizeList(enrollmentsData, 'enrollments');
    enrolledIds = new Set(enrollments.map(e => Number(e.activity_id || e.activity?.id)).filter(Boolean));

    const upcoming = enrollments.slice(0, 3);
    const featured = activities.filter(a => a.status === 'active' || !a.status).slice(0, 4);

    const upcomingHtml = upcoming.length > 0 ? `
      <h3 class="section-heading">Tus próximas clases</h3>
      <div class="card-list">
        ${upcoming.map(e => homeEnrollmentCard(e)).join('')}
      </div>` : `
      <div class="home-empty">
        <p>Todavía no estás inscripto en ninguna clase.</p>
        <button class="cta-btn" onclick="showScreen('explore')">Explorar actividades</button>
      </div>`;

    const featuredHtml = featured.length > 0 ? `
      <div class="home-section-header">
        <h3 class="section-heading">Actividades destacadas</h3>
        <button class="link-btn" onclick="showScreen('explore')">Ver todas</button>
      </div>
      <div class="card-list">
        ${featured.map(a => activityCard(a)).join('')}
      </div>` : '';

    el.innerHTML = `
      <div class="home-greeting">
        <p class="home-greet-label">${greet},</p>
        <h1 class="home-greet-name">${escHtml(firstName)} 👋</h1>
      </div>
      <div class="home-shortcuts">
        <button class="home-shortcut" onclick="showScreen('offers')">
          <svg viewBox="0 0 24 24"><path d="M21.41 11.58l-9-9A2 2 0 0011 2H4a2 2 0 00-2 2v7a2 2 0 00.59 1.42l9 9a2 2 0 002.82 0l7-7a2 2 0 000-2.84zM5.5 7A1.5 1.5 0 114 5.5 1.5 1.5 0 015.5 7z"/></svg>
          <span>Ofertas</span>
        </button>
        <button class="home-shortcut" onclick="showScreen('explore')">
          <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          <span>Buscar</span>
        </button>
      </div>
      ${upcomingHtml}
      ${featuredHtml}
    `;
  } catch (err) {
    el.innerHTML = `<div class="empty-state"><p>Error al cargar: ${escHtml(err.message)}</p></div>`;
  }
}

function homeEnrollmentCard(e) {
  const id = Number(e.activity_id || e.activity?.id);
  const title = e.activity_title || e.activity_name || e.activity?.title || e.activity?.name || 'Actividad';
  const provider = e.provider_name || e.activity?.provider_name || '';
  return `
    <div class="activity-card" onclick="openActivityDetail(${id})">
      <div class="activity-card-header">
        <div class="activity-card-icon" style="background: var(--grad-success)">
          <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H5V8h14v11zm-7-9H7v5h5v-5z"/></svg>
        </div>
        <div class="activity-card-info">
          <h3>${escHtml(title)}</h3>
          <p class="activity-provider">${escHtml(provider)}</p>
        </div>
        <span class="tag tag--green">Inscripto</span>
      </div>
    </div>`;
}

// ── Activity Detail ───────────────────────────────────────────
async function loadActivityDetail(id) {
  const el = document.getElementById('activity-detail-content');
  el.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Cargando...</p></div>';

  try {
    const res = await api('GET', `/activities/${id}`);
    // API returns { activity: {...}, provider: {...} }
    const activity = res.activity || res;
    const provider = res.provider || {};
    const sessions = activity.sessions || [];
    const isProvider = currentUser.role === 'provider_admin';
    const isEnrolled = enrolledIds.has(Number(id));
    const color = KIND_COLORS[activity.kind] || 'var(--grad-primary)';
    const icon = KIND_ICONS[activity.kind] || KIND_ICONS.default;

    const metaItems = [
      activity.price != null ? `<div class="meta-item"><span class="meta-label">Precio</span><span class="meta-val">$${Number(activity.price).toLocaleString('es-AR')}/mes</span></div>` : '',
      activity.seats_left != null ? `<div class="meta-item"><span class="meta-label">Lugares disponibles</span><span class="meta-val">${activity.seats_left} de ${activity.capacity}</span></div>` : '',
      activity.difficulty ? `<div class="meta-item"><span class="meta-label">Nivel</span><span class="meta-val">${escHtml(activity.difficulty)}</span></div>` : '',
      activity.sport?.name ? `<div class="meta-item"><span class="meta-label">Deporte</span><span class="meta-val">${escHtml(activity.sport.name)}</span></div>` : '',
      provider.city ? `<div class="meta-item"><span class="meta-label">Ciudad</span><span class="meta-val">${escHtml(provider.city)}</span></div>` : '',
      activity.location ? `<div class="meta-item"><span class="meta-label">Dirección</span><span class="meta-val" style="text-align:right;max-width:58%">${escHtml(activity.location)}</span></div>` : '',
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

    const enrollBtn = isProvider ? '' : isEnrolled
      ? `<button class="cta-btn enroll-btn enroll-btn--done" disabled>✓ Ya estás inscripto</button>`
      : `<button class="cta-btn enroll-btn" onclick="enrollActivity(${activity.id}, this)">Inscribirse a la actividad</button>`;

    el.innerHTML = `
      <div class="detail-hero">
        <div class="detail-icon" style="background: ${color}">
          <svg viewBox="0 0 24 24">${icon}</svg>
        </div>
        <div>
          <h1 class="detail-title">${escHtml(activity.title || '')}</h1>
          <p class="detail-provider">${escHtml(provider.name || activity.provider_name || '')}</p>
        </div>
      </div>

      ${activity.description ? `<p class="detail-desc">${escHtml(activity.description)}</p>` : ''}

      ${metaItems ? `<div class="detail-meta">${metaItems}</div>` : ''}

      ${sessionsHtml}

      ${enrollBtn}
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
    enrolledIds.add(Number(activityId));
    showToast('¡Inscripción exitosa!');
    btn.textContent = '✓ Inscripto';
    btn.disabled = true;
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
    enrolledIds = new Set(enrollments.map(e => Number(e.activity_id || e.activity?.id)).filter(Boolean));

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
          <h3>${escHtml(e.activity_title || e.activity_name || e.activity?.title || e.activity?.name || 'Actividad')}</h3>
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
    const enrollment = await api('DELETE', `/enrollments/${id}`);
    enrolledIds.delete(Number(enrollment?.activity_id));
    showToast('Inscripción cancelada');
    loadEnrollments();
  } catch (err) {
    showToast(err.message, 'error');
    btn.disabled = false;
  }
}

// ── Offers ────────────────────────────────────────────────────
async function loadOffers() {
  const list = document.getElementById('offers-list');
  list.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Cargando ofertas...</p></div>';

  try {
    const data = await api('GET', '/offers');
    const offers = normalizeList(data, 'items');

    if (offers.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <p>No hay ofertas disponibles por ahora</p>
        </div>`;
      return;
    }

    list.innerHTML = offers.map(o => offerCard(o)).join('');
  } catch (err) {
    list.innerHTML = `<div class="empty-state"><p>Error al cargar: ${escHtml(err.message)}</p></div>`;
  }
}

function offerCard(o) {
  const color = KIND_COLORS[o.activity_kind] || 'var(--grad-purple)';
  const discount = o.discount_percent != null
    ? `${o.discount_percent}% OFF`
    : (o.discount_label || '');
  const validUntil = o.valid_until ? `Hasta ${formatDate(o.valid_until)}` : '';
  const desc = o.description ? `<p class="activity-desc">${escHtml(o.description.slice(0, 140))}${o.description.length > 140 ? '…' : ''}</p>` : '';

  return `
    <div class="offer-card">
      <div class="offer-card-header">
        <div class="offer-card-icon" style="background: ${color}">
          <svg viewBox="0 0 24 24"><path d="M21.41 11.58l-9-9A2 2 0 0011 2H4a2 2 0 00-2 2v7a2 2 0 00.59 1.42l9 9a2 2 0 002.82 0l7-7a2 2 0 000-2.84zM5.5 7A1.5 1.5 0 114 5.5 1.5 1.5 0 015.5 7z"/></svg>
        </div>
        <div class="activity-card-info">
          <h3>${escHtml(o.title || 'Oferta')}</h3>
          <p class="activity-provider">${escHtml(o.provider_name || '')}</p>
        </div>
        ${discount ? `<span class="offer-badge">${escHtml(discount)}</span>` : ''}
      </div>
      ${desc}
      ${validUntil ? `<p class="offer-validity">${validUntil}</p>` : ''}
    </div>`;
}

// ── Provider Dashboard ────────────────────────────────────────
async function loadProviderDashboard() {
  const el = document.getElementById('provider-content');
  el.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Cargando panel...</p></div>';

  const pid = currentUser.provider_id;
  if (!pid) {
    el.innerHTML = `<div class="empty-state"><p>Todavía no tenés un proveedor asignado.</p></div>`;
    return;
  }

  try {
    const [activeData, draftData, enrollmentsData] = await Promise.all([
      api('GET', `/activities?provider_id=${pid}&status=active`).catch(() => []),
      api('GET', `/activities?provider_id=${pid}&status=draft`).catch(() => []),
      api('GET', '/enrollments/provider').catch(() => []),
    ]);

    const activeActs = normalizeList(activeData, 'items');
    const draftActs = normalizeList(draftData, 'items');
    const myActs = [...activeActs, ...draftActs];
    const enrollments = normalizeList(enrollmentsData, 'enrollments');
    const activeEnrolls = enrollments.filter(e => (e.status || 'active') === 'active');

    el.innerHTML = `
      <div class="provider-stats">
        <div class="pstat">
          <div class="pstat-val">${activeActs.length}</div>
          <div class="pstat-label">Activas</div>
        </div>
        <div class="pstat">
          <div class="pstat-val">${draftActs.length}</div>
          <div class="pstat-label">Borradores</div>
        </div>
        <div class="pstat">
          <div class="pstat-val">${activeEnrolls.length}</div>
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
                <p>${escHtml(e.activity_title || e.activity_name || e.activity?.title || e.activity?.name || '')}</p>
                <div class="enrollment-meta">
                  <span class="tag tag--green">${escHtml(e.status || 'activo')}</span>
                  ${e.enrolled_at ? `<span class="tag tag--slate">${formatDate(e.enrolled_at)}</span>` : ''}
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
async function loadProfile() {
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
  const memberSince = currentUser.created_at ? formatDate(currentUser.created_at) : null;

  const infoRows = [
    currentUser.phone ? { label: 'Teléfono', value: currentUser.phone } : null,
    currentUser.units ? { label: 'Unidades', value: currentUser.units === 'metric' ? 'Métrico (km)' : 'Imperial (mi)' } : null,
    currentUser.language ? { label: 'Idioma', value: currentUser.language === 'es' ? 'Español' : currentUser.language } : null,
    memberSince ? { label: 'Miembro desde', value: memberSince } : null,
  ].filter(Boolean);

  const infoHtml = infoRows.length > 0 ? `
    <div class="profile-info">
      ${infoRows.map(r => `
        <div class="profile-info-row">
          <span class="profile-info-label">${r.label}</span>
          <span class="profile-info-val">${escHtml(r.value)}</span>
        </div>`).join('')}
    </div>` : '';

  const bioHtml = currentUser.bio ? `
    <div class="profile-bio">
      <h4>Sobre mí</h4>
      <p>${escHtml(currentUser.bio)}</p>
    </div>` : '';

  el.innerHTML = `
    <div class="profile-card">
      <div class="profile-avatar">${initials}</div>
      <h2 class="profile-name">${escHtml(currentUser.name || '')}</h2>
      <p class="profile-email">${escHtml(currentUser.email || '')}</p>
      <span class="tag tag--blue">${roleLabel}</span>
    </div>
    <div id="profile-stats" class="profile-stats"></div>
    ${infoHtml}
    ${bioHtml}
    <div class="profile-actions">
      <button class="logout-btn" onclick="doLogout()">
        <svg viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4a2 2 0 00-2 2v14a2 2 0 002 2h8v-2H4V5z"/></svg>
        Cerrar sesión
      </button>
    </div>`;

  loadProfileStats();
}

async function loadProfileStats() {
  const el = document.getElementById('profile-stats');
  if (!el) return;

  try {
    if (currentUser.role === 'provider_admin') {
      const [activitiesData, enrollmentsData] = await Promise.all([
        api('GET', '/activities').catch(() => []),
        api('GET', '/enrollments/provider').catch(() => []),
      ]);
      const acts = normalizeList(activitiesData, 'activities');
      const enrolls = normalizeList(enrollmentsData, 'enrollments');
      const mine = acts.filter(a => a.provider_id === currentUser.provider_id);
      el.innerHTML = `
        <div class="pstat"><div class="pstat-val">${mine.length}</div><div class="pstat-label">Actividades</div></div>
        <div class="pstat"><div class="pstat-val">${enrolls.length}</div><div class="pstat-label">Inscriptos</div></div>`;
    } else {
      const data = await api('GET', '/enrollments/mine').catch(() => []);
      const enrolls = normalizeList(data, 'enrollments');
      enrolledIds = new Set(enrolls.map(e => Number(e.activity_id || e.activity?.id)).filter(Boolean));
      const active = enrolls.filter(e => (e.status || 'active') === 'active').length;
      el.innerHTML = `
        <div class="pstat"><div class="pstat-val">${enrolls.length}</div><div class="pstat-label">Inscripciones</div></div>
        <div class="pstat"><div class="pstat-val">${active}</div><div class="pstat-label">Activas</div></div>`;
    }
  } catch {
    el.innerHTML = '';
  }
}

// ── Helpers ───────────────────────────────────────────────────
function normalizeList(data, key) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data[key])) return data[key];
  if (data && Array.isArray(data.items)) return data.items;
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

// ── PWA Install ──────────────────────────────────────────────

let deferredPrompt = null;

// Android / Chrome: capture beforeinstallprompt
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
});

function handleInstall() {
  if (deferredPrompt) {
    // Android / Chrome / Edge
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(choice => {
      deferredPrompt = null;
      if (choice.outcome === 'accepted') {
        document.getElementById('installBtn').textContent = '✓ Instalado';
      }
    });
  } else if (isIos()) {
    // iOS: show manual instruction
    document.getElementById('iosPrompt').classList.add('visible');
  } else {
    // Desktop / Other: show generic instructions
    alert('Para instalar: abrí el menú del navegador (⋮) y seleccioná "Agregar a pantalla de inicio" o "Instalar aplicación".');
  }
}

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

// Auto-show iOS prompt on first visit
window.addEventListener('load', () => {
  if (isIos() && !isStandalone()) {
    setTimeout(() => {
      document.getElementById('iosPrompt').classList.add('visible');
    }, 3000);
  }
});

// ── Service Worker ───────────────────────────────────────────

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

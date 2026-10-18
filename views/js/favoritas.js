(function () {
  'use strict';
  const KEY = 'excusify.favorites.v1';
  const CUSTOM_KEY = 'excusify.customExcuses.v1';
  const DISMISSED_KEY = 'excusify.dismissedCustomFavorites.v1';
  const categories = ['Trabajo', 'Estudio', 'Vida cotidiana'];
  let refresh = () => {};
  const identity = item => JSON.stringify([item.category, item.text.trim()]);
  function readRecords(key) {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(data) ? data.filter(x => x && typeof x.text === 'string' && x.text.trim() && categories.includes(x.category)) : [];
    } catch (_) { return []; }
  }
  function read() { return readRecords(KEY); }
  function readDismissed() {
    try {
      const data = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
      return new Set(Array.isArray(data) ? data.filter(value => typeof value === 'string') : []);
    } catch (_) { return new Set(); }
  }
  function readSaved() {
    const dismissed = readDismissed();
    const custom = readRecords(CUSTOM_KEY).filter(item => !dismissed.has(identity(item)));
    // Una excusa creada y marcada como favorita solo aparece y se cuenta una vez.
    const unique = new Map();
    [...read(), ...custom].forEach(item => {
      const id = identity(item);
      if (!unique.has(id)) unique.set(id, item);
    });
    return [...unique.values()];
  }
  function write(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); refresh(); return true; }
    catch (_) { notify('No se pudo guardar. Revisa el almacenamiento del navegador.'); return false; }
  }
  function removeSaved(item) {
    const id = identity(item);
    const favorites = read();
    const remaining = favorites.filter(favorite => identity(favorite) !== id);
    // Quitar una excusa de esta vista no borra el original del formulario Crear.
    if (readRecords(CUSTOM_KEY).some(custom => identity(custom) === id)) {
      const dismissed = readDismissed();
      dismissed.add(id);
      try { localStorage.setItem(DISMISSED_KEY, JSON.stringify([...dismissed])); }
      catch (_) { notify('No se pudo quitar. Revisa el almacenamiento del navegador.'); return false; }
    }
    if (remaining.length === favorites.length) { refresh(); return true; }
    return write(remaining);
  }
  let timer;
  function notify(message) {
    let node = document.getElementById('favoritesNotice');
    if (!node) {
      node = document.createElement('div'); node.id = 'favoritesNotice'; node.setAttribute('role', 'status');
      node.className = 'favorites-notice';
      document.body.appendChild(node);
    }
    node.hidden = false; node.textContent = message;
    clearTimeout(timer); timer = setTimeout(() => { node.hidden = true; }, 3000);
  }
  async function copy(text) {
    try {
      try { await navigator.clipboard.writeText(text); }
      catch (_) {
        const field = document.createElement('textarea'); field.value = text;
        field.className = 'clipboard-field'; document.body.appendChild(field); field.select();
        const ok = document.execCommand('copy'); field.remove(); if (!ok) throw new Error('copy');
      }
      notify('¡Excusa copiada al portapapeles!');
    } catch (_) { notify('No se pudo copiar. Selecciona el texto y cópialo manualmente.'); }
  }
  function add(item) {
    const items = read();
    if (items.some(x => x.text === item.text && x.category === item.category)) { notify('Esta excusa ya está en tus favoritas.'); return; }
    if (write([{ text: item.text, category: item.category, absurdity: Math.min(5, Math.max(1, Number(item.absurdity) || 5)), savedAt: new Date().toISOString() }, ...items])) notify('¡Excusa guardada en Mis favoritas!');
  }
  window.ExcusifyFavorites = { read, readSaved, write, add, copy, removeSaved };
  const clean = text => text.trim().replace(/^["“]|["”]$/g, '').trim();
  const source = document.getElementById('generatedExcuseText') || document.getElementById('resultText');
  if (source) {
    const isResult = location.pathname.endsWith('/resultado-generado.html');
    if (isResult) {
      try {
        const current = JSON.parse(localStorage.getItem('excusify.currentExcuse.v1') || 'null');
        if (current && typeof current.text === 'string' && categories.includes(current.category)) {
          source.textContent = `“${current.text}”`;
          source.dataset.category = current.category;
          document.getElementById('resultCategoryPill').textContent = `Categoría: ${current.category}`;
          document.getElementById('resultLevel').textContent = `${current.absurdity || 5}/5 🚨`;
        }
      } catch (_) { /* La tarjeta inicial sigue disponible si no hay almacenamiento. */ }
    }
    function remember() {
      if (isResult) return;
      const cat = document.getElementById('resultCategoryPill') || document.getElementById('resultCategory');
      const meter = document.getElementById('resultAbsurdMeter') || document.getElementById('resultAbsurdity') || document.getElementById('resultLevel');
      const item = { text: clean(source.textContent), category: source.dataset.category || categories.find(x => cat && cat.textContent.includes(x)), absurdity: meter ? (meter.textContent.match(/([1-5])\/5/) || [0, 5])[1] : 5 };
      if (item.text && item.category) {
        try { localStorage.setItem('excusify.currentExcuse.v1', JSON.stringify(item)); } catch (_) { /* Guardar favoritas informará del error. */ }
      }
    }
    new MutationObserver(remember).observe(source, { childList: true, characterData: true, subtree: true });
    const button = document.createElement('button'); button.type = 'button'; button.textContent = '☆ Guardar en favoritas';
    button.className = 'save-favorite';
    source.parentElement.appendChild(button);
    button.addEventListener('click', () => {
      const cat = document.getElementById('resultCategoryPill') || document.getElementById('resultCategory');
      const meter = document.getElementById('resultAbsurdMeter') || document.getElementById('resultAbsurdity') || document.getElementById('resultLevel');
      const category = source.dataset.category || categories.find(x => cat && cat.textContent.includes(x)) || 'Vida cotidiana';
      add({ text: clean(source.textContent), category, absurdity: meter ? (meter.textContent.match(/([1-5])\/5/) || [0, 5])[1] : 5 });
    });
  }
  const list = document.getElementById('cardsList');
  if (!list) return;
  const template = document.getElementById('favoriteTemplate');
  const search = document.getElementById('excuseSearchInput');
  const dialog = document.getElementById('removeFavorite');
  let category = 'Todas', pending = null, trigger = null;
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function render() {
    const items = readSaved();
    const words = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
    const visible = items.filter(item => (category === 'Todas' || item.category === category)
      && words.every(word => normalize(item.text).includes(word)));
    document.getElementById('favoritesCount').textContent = words.length || category !== 'Todas'
      ? `${visible.length} de ${items.length} excusas guardadas coinciden`
      : `${items.length} ${items.length === 1 ? 'excusa guardada' : 'excusas guardadas'} para la emergencia`;
    document.querySelectorAll('.filter-pill').forEach(button => {
      const cat = button.dataset.category;
      button.textContent = `${cat} (${items.filter(x => cat === 'Todas' || x.category === cat).length})`;
      button.setAttribute('aria-pressed', String(cat === category));
    });
    document.getElementById('clearSearchBtn').hidden = !search.value;
    list.replaceChildren();
    visible.forEach(item => {
      const card = template.content.firstElementChild.cloneNode(true);
      card.querySelector('.excuse-text').textContent = `“${item.text}”`;
      card.querySelector('[data-category-label]').textContent = item.category;
      card.querySelector('[data-level]').textContent = `Nivel ${Math.min(5, Math.max(1, Number(item.absurdity) || 5))}/5 ⚡`;
      card.querySelector('.copy-btn').onclick = () => copy(item.text);
      card.querySelector('.share-btn').onclick = () => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(item.text)}`, '_blank', 'noopener,noreferrer');
      card.querySelector('.delete-trigger-btn').onclick = event => { pending = item; trigger = event.currentTarget; dialog.showModal(); };
      list.appendChild(card);
    });
    const empty = document.getElementById('favoritesEmpty'); empty.hidden = !!visible.length;
    empty.textContent = items.length ? 'No hay excusas que coincidan con la búsqueda y el filtro.' : 'Aún no tienes excusas guardadas. Crea una excusa o pulsa «Guardar en favoritas» en el generador.';
  }
  document.querySelectorAll('.filter-pill').forEach(button => button.onclick = () => { category = button.dataset.category; render(); });
  search.addEventListener('input', render);
  search.addEventListener('search', render);
  document.getElementById('clearSearchBtn').onclick = () => { search.value = ''; render(); search.focus(); };
  document.getElementById('cancelRemove').onclick = () => dialog.close();
  dialog.addEventListener('close', () => { if (trigger && trigger.isConnected) trigger.focus(); pending = null; });
  document.getElementById('confirmRemove').onclick = () => {
    if (pending && removeSaved(pending)) {
      dialog.close(); render(); search.focus(); notify('Excusa eliminada de tus favoritas.');
    }
  };
  refresh = render;
  window.addEventListener('storage', event => {
    if ([KEY, CUSTOM_KEY, DISMISSED_KEY, null].includes(event.key)) render();
  });
  window.addEventListener('pageshow', render);
  render();
})();

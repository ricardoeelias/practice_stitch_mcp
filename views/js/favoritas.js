(function () {
  'use strict';
  const KEY = 'excusify.favorites.v1';
  const categories = ['Trabajo', 'Estudio', 'Vida cotidiana'];
  function read() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(data) ? data.filter(x => x && typeof x.text === 'string' && x.text.trim() && categories.includes(x.category)) : [];
    } catch (_) { return []; }
  }
  function write(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); return true; }
    catch (_) { notify('No se pudo guardar. Revisa el almacenamiento del navegador.'); return false; }
  }
  let timer;
  function notify(message) {
    let node = document.getElementById('favoritesNotice');
    if (!node) {
      node = document.createElement('div'); node.id = 'favoritesNotice'; node.setAttribute('role', 'status');
      node.style.cssText = 'position:fixed;top:76px;left:50%;transform:translateX(-50%);z-index:1000;background:#332c48;color:white;padding:12px 20px;border-radius:24px;max-width:90vw';
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
        field.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(field); field.select();
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
  window.ExcusifyFavorites = { read, write, add, copy };
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
    button.style.cssText = 'background:#e7deff;color:#4c15c8;padding:10px 16px;border:0;border-radius:24px;font:inherit;cursor:pointer;margin-top:12px';
    source.parentElement.appendChild(button);
    button.addEventListener('click', () => {
      const cat = document.getElementById('resultCategoryPill') || document.getElementById('resultCategory');
      const meter = document.getElementById('resultAbsurdMeter') || document.getElementById('resultAbsurdity') || document.getElementById('resultLevel');
      const category = source.dataset.category || categories.find(x => cat && cat.textContent.includes(x)) || 'Vida cotidiana';
      add({ text: clean(source.textContent), category, absurdity: meter ? (meter.textContent.match(/([1-5])\/5/) || [0, 5])[1] : 5 });
    });
    // Usa la misma copia con detección de errores en las vistas existentes.
    window.copyGeneratedExcuse = () => copy(clean(source.textContent));
    window.copyCardText = (_button, text) => copy(text);
  }
  const list = document.getElementById('cardsList');
  if (!list) return;
  const template = document.getElementById('favoriteTemplate');
  const search = document.getElementById('excuseSearchInput');
  const dialog = document.getElementById('removeFavorite');
  let category = 'Todas', pending = null, trigger = null;
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function render() {
    const items = read(), query = normalize(search.value.trim());
    const visible = items.filter(x => (category === 'Todas' || x.category === category) && normalize(x.text).includes(query));
    document.getElementById('favoritesCount').textContent = `${items.length} excusas listas para la emergencia`;
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
    empty.textContent = items.length ? 'No hay excusas que coincidan con la búsqueda y el filtro.' : 'Aún no tienes favoritas. Genera una excusa y pulsa «Guardar en favoritas».';
  }
  document.querySelectorAll('.filter-pill').forEach(button => button.onclick = () => { category = button.dataset.category; render(); });
  search.addEventListener('input', render);
  document.getElementById('clearSearchBtn').onclick = () => { search.value = ''; render(); search.focus(); };
  document.getElementById('cancelRemove').onclick = () => dialog.close();
  dialog.addEventListener('close', () => { if (trigger && trigger.isConnected) trigger.focus(); pending = null; });
  document.getElementById('confirmRemove').onclick = () => {
    if (pending && write(read().filter(x => x.text !== pending.text || x.category !== pending.category))) {
      dialog.close(); render(); search.focus(); notify('Excusa eliminada de tus favoritas.');
    }
  };
  window.addEventListener('storage', event => { if (event.key === KEY || event.key === null) render(); });
  render();
})();

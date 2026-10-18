(() => {
  'use strict';

  const STORAGE_KEY = 'excusify.customExcuses.v1';
  const seededExcuses = [
    { id: 'seed-work-1', category: 'Trabajo', text: 'Mi gato cerró la laptop de un salto y ahora Windows está en ruso.', absurdity: 4, success: 98, uses: 1400 },
    { id: 'seed-work-2', category: 'Trabajo', text: 'Mi conexión a internet fue secuestrada por una actualización de microondas inteligente.', absurdity: 5, success: 96, uses: 1120 },
    { id: 'seed-work-3', category: 'Trabajo', text: 'La impresora entró en una negociación sindical y rechazó imprimir mis pendientes.', absurdity: 3, success: 91, uses: 760 },
    { id: 'seed-study-1', category: 'Estudio', text: 'Se me desconfiguró la noción del tiempo tras intentar entender derivadas.', absurdity: 3, success: 92, uses: 890 },
    { id: 'seed-study-2', category: 'Estudio', text: 'El PDF de la entrega mutó a formato jeroglífico tras exportarlo con prisas.', absurdity: 4, success: 95, uses: 680 },
    { id: 'seed-study-3', category: 'Estudio', text: 'Mi cuaderno pidió una prórroga para procesar la cantidad de apuntes.', absurdity: 2, success: 88, uses: 520 }
  ];

  let activeCategory = 'Todas';
  let selectedRating = 5;
  let toastTimer;
  let customExcuses = loadExcuses();

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function loadExcuses() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(saved) ? saved.filter(item => item && typeof item.text === 'string' && ['Trabajo', 'Estudio'].includes(item.category)) : [];
    } catch (error) {
      return [];
    }
  }

  function saveExcuses() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customExcuses));
      return true;
    } catch (error) {
      showToast('No se pudo guardar en este navegador.');
      return false;
    }
  }

  function allExcuses() {
    return seededExcuses.concat(customExcuses);
  }

  function visibleByCategory(items) {
    return activeCategory === 'Todas' ? items : items.filter(item => item.category === activeCategory);
  }

  function categoryIcon(category) {
    return category === 'Trabajo' ? '💼' : '📚';
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2400);
  }

  function updatePopular() {
    const popular = visibleByCategory(allExcuses().filter(item => item.popular !== false))
      .sort((a, b) => (Number(b.uses) || 0) - (Number(a.uses) || 0));
    const list = $('#popularList');
    $('#popularCount').textContent = `${popular.length} ${popular.length === 1 ? 'excusa' : 'excusas'}`;
    $('#popularSubtitle').textContent = activeCategory === 'Todas'
      ? 'Las favoritas de Trabajo y Estudio esta semana.'
      : `Las favoritas de ${activeCategory} esta semana.`;

    if (!popular.length) {
      list.innerHTML = '<div class="empty-list">Todavía no hay excusas populares en esta categoría. ¡Agrega una y comparte tu creatividad!</div>';
      return;
    }

    list.innerHTML = popular.map(item => {
      const owned = customExcuses.some(custom => custom.id === item.id);
      const uses = Number(item.uses) || 0;
      const usageLabel = uses >= 1000 ? `${(uses / 1000).toFixed(1).replace('.0', '')}k` : String(uses);
      return `<article class="excuse-card">
        <div class="card-top"><div class="card-tags"><span class="tag">${categoryIcon(item.category)} ${item.category}</span><span class="absurdity">Absurdo: ${item.absurdity || 5}/5</span></div>
          <button class="small-btn copy-card" type="button" data-id="${escapeAttribute(item.id)}" aria-label="Copiar excusa">▢ Copiar</button></div>
        <p>${escapeHTML(item.text)}</p>
        <div class="meta-row card-meta"><span>Usada ${usageLabel} veces</span><span>⭐ ${item.success || 94}% éxito</span>${owned ? `<button class="remove-btn" type="button" data-remove="${escapeAttribute(item.id)}">Quitar</button>` : ''}</div>
      </article>`;
    }).join('');
  }

  function updateCustomList() {
    const saved = visibleByCategory(customExcuses).slice().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    const list = $('#customList');
    $('#myExcusesCount').textContent = `${saved.length} ${saved.length === 1 ? 'excusa' : 'excusas'}`;
    if (!saved.length) {
      list.innerHTML = `<div class="empty-list">${activeCategory === 'Todas' ? 'Todavía no has agregado excusas. Usa el formulario para crear la primera.' : `No tienes excusas guardadas en ${activeCategory}.`}</div>`;
      return;
    }
    list.innerHTML = saved.map(item => `<article class="excuse-card">
      <div class="card-top"><div class="card-tags"><span class="tag">${categoryIcon(item.category)} ${item.category}</span><span class="tag privacy-tag">${item.popular === false ? '🔒 Solo para ti' : '🔥 En populares'}</span></div>
        <button class="small-btn copy-card" type="button" data-id="${escapeAttribute(item.id)}">▢ Copiar</button></div>
      <p>${escapeHTML(item.text)}</p>
      <div class="meta-row card-meta"><span>Absurdo: ${item.absurdity || 5}/5</span><button class="remove-btn" type="button" data-remove="${escapeAttribute(item.id)}">Quitar</button></div>
    </article>`).join('');
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  }

  function escapeAttribute(value) {
    return escapeHTML(value).replace(/`/g, '&#96;');
  }

  function setCategory(category) {
    activeCategory = category;
    $$('.filter').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === category)));
    $('#filterSummary').textContent = category;
    updatePopular();
    updateCustomList();
    const current = $('#resultText').dataset.category;
    if (current && category !== 'Todas' && current !== category) {
      $('#resultStatus').textContent = '● Cambió el filtro';
    }
  }

  function generateExcuse() {
    const pool = visibleByCategory(allExcuses());
    if (!pool.length) {
      showToast('No hay excusas para esta categoría. Agrega una primero.');
      return;
    }
    const item = pool[Math.floor(Math.random() * pool.length)];
    const hyperbolic = $('#hyperbolicToggle').checked;
    let text = item.text;
    if (hyperbolic && !item.id.startsWith('seed-')) text = `${text.replace(/[.!?…]+$/, '')} ¡y el universo todavía no presenta disculpas!`;
    $('#emptyResult').hidden = true;
    $('#generatedResult').hidden = false;
    $('#resultText').textContent = `“${text}”`;
    $('#resultText').dataset.category = item.category;
    $('#resultCategory').textContent = `${categoryIcon(item.category)} ${item.category}`;
    $('#resultAbsurdity').textContent = `Absurdo: ${item.absurdity || 5}/5 🚨`;
    $('#resultSuccess').textContent = `${item.success || 94}%`;
    $('#resultStatus').textContent = '● Generada';
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      $('#generateBtn').animate([{ transform: 'scale(.97)' }, { transform: 'scale(1)' }], { duration: 180, easing: 'ease-out' });
    }
  }

  async function copyText(text) {
    try {
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        const temp = document.createElement('textarea');
        temp.value = text;
        temp.className = 'clipboard-field';
        document.body.appendChild(temp);
        try {
          temp.select();
          if (!document.execCommand('copy')) throw new Error('No se pudo copiar');
        } finally {
          temp.remove();
        }
      }
      showToast('¡Excusa copiada al portapapeles! 🚀');
    } catch (error) {
      showToast('No se pudo copiar. Selecciona el texto y cópialo manualmente.');
    }
  }

  function addExcuse(event) {
    event.preventDefault();
    const field = $('#excuseInput');
    const text = field.value.trim();
    if (text.length < 8) {
      field.setCustomValidity('Escribe una excusa de al menos 8 caracteres.');
      field.reportValidity();
      return;
    }
    field.setCustomValidity('');
    const category = $('#excuseCategory').value;
    const newExcuse = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      category,
      text,
      absurdity: selectedRating,
      success: Math.floor(80 + Math.random() * 19),
      uses: 0,
      popular: $('#publishToggle').checked,
      createdAt: new Date().toISOString()
    };
    customExcuses.unshift(newExcuse);
    if (!saveExcuses()) { customExcuses.shift(); return; }
    event.currentTarget.reset();
    selectedRating = 5;
    $$('.rating button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.rating === '5')));
    $('#charCount').textContent = '0/220';
    updatePopular();
    updateCustomList();
    showToast(newExcuse.popular ? '¡Excusa agregada al ranking semanal! ✨' : '¡Excusa guardada en tu colección! ✨');
    if (activeCategory === 'Todas' || activeCategory === category) {
      $('#resultText').dataset.category = '';
    }
  }

  $('#generateBtn').addEventListener('click', generateExcuse);
  $$('.filter').forEach(button => button.addEventListener('click', () => setCategory(button.dataset.category)));
  $('#excuseForm').addEventListener('submit', addExcuse);
  $('#excuseInput').addEventListener('input', event => {
    $('#charCount').textContent = `${event.currentTarget.value.length}/220`;
    event.currentTarget.setCustomValidity('');
  });
  $$('.rating button').forEach(button => button.addEventListener('click', () => {
    selectedRating = Number(button.dataset.rating);
    $$('.rating button').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
  }));
  $('#copyResultBtn').addEventListener('click', () => {
    if (!$('#generatedResult').hidden) copyText($('#resultText').textContent.replace(/^“|”$/g, ''));
  });
  $('#shareBtn').addEventListener('click', () => {
    if ($('#generatedResult').hidden) return;
    const text = `Oye, no voy a poder ir: ${$('#resultText').textContent}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  });
  function handleListAction(event) {
    const copyButton = event.target.closest('.copy-card');
    if (copyButton) {
      const item = allExcuses().find(excuse => excuse.id === copyButton.dataset.id);
      if (item) copyText(item.text);
      return;
    }
    const removeButton = event.target.closest('[data-remove]');
    if (removeButton) {
      customExcuses = customExcuses.filter(item => item.id !== removeButton.dataset.remove);
      saveExcuses();
      updatePopular();
      updateCustomList();
      showToast('Excusa quitada de tu colección.');
    }
  }
  $('#popularList').addEventListener('click', handleListAction);
  $('#customList').addEventListener('click', handleListAction);

  updatePopular();
  updateCustomList();
})();

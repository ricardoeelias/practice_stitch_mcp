(() => {
  'use strict';

  // Inicio y resultado comparten estas acciones sin manejadores inline ni globales.
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const source = document.getElementById('generatedExcuseText');
    const text = source?.textContent.trim() ?? '';
    switch (button.dataset.action) {
      case 'copy-generated':
        window.ExcusifyFavorites.copy(text.replace(/^["“]|["”]$/g, '').trim());
        break;
      case 'copy-card':
        window.ExcusifyFavorites.copy(button.dataset.copyText);
        break;
      case 'share':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Oye, no voy a poder ir: ' + text)}`, '_blank', 'noopener,noreferrer');
        break;
    }
  });
})();

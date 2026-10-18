(() => {
  'use strict';

  let activeCategory = 'Todas';
  const excuseDatabase = [
    { cat: 'Trabajo', text: 'Mi gato cerró la laptop de un salto y ahora Windows está en ruso.', absurd: '4/5' },
    { cat: 'Trabajo', text: 'Mi conexión a internet fue secuestrada por una actualización de microondas inteligente.', absurd: '5/5' },
    { cat: 'Estudio', text: 'Se me desconfiguró la noción del tiempo tras intentar entender derivadas.', absurd: '3/5' },
    { cat: 'Estudio', text: 'El PDF de la entrega mutó a formato jeroglífico tras exportarlo con prisas.', absurd: '4/5' },
    { cat: 'Vida cotidiana', text: 'La gravedad en mi cama aumentó un 300% debido a una tormenta solar.', absurd: '5/5' },
    { cat: 'Vida cotidiana', text: 'Salí a comprar perejil y acabé participando como testigo en una boda gitana.', absurd: '4/5' }
  ];

  const chips = document.querySelectorAll('.category-chip');
  const activeClasses = ['bg-primary-container', 'text-on-primary-container', 'border-primary-container', 'shadow-[0_4px_12px_rgba(109,69,232,0.24)]'];
  const inactiveClasses = ['bg-surface-container-lowest', 'text-on-surface-variant', 'border-outline-variant', 'hover:bg-surface-container-high'];

  function setCategory(selected) {
    activeCategory = selected.dataset.category;
    chips.forEach(chip => {
      const active = chip === selected;
      chip.setAttribute('aria-pressed', String(active));
      chip.classList.remove(...(active ? inactiveClasses : activeClasses));
      chip.classList.add(...(active ? activeClasses : inactiveClasses));
    });
  }

  function generateRandomExcuse() {
    const button = document.getElementById('generateBtn');
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      button.classList.add('scale-95');
      setTimeout(() => button.classList.remove('scale-95'), 150);
    }
    const pool = activeCategory === 'Todas' ? excuseDatabase : excuseDatabase.filter(item => item.cat === activeCategory);
    const item = pool[Math.floor(Math.random() * pool.length)];

    document.getElementById('emptyState').classList.add('hidden');
    const activeState = document.getElementById('activeState');
    activeState.classList.remove('hidden');
    activeState.classList.add('flex');
    const container = document.getElementById('excuseCardContainer');
    container.classList.remove('border-dashed', 'border-primary/30');
    container.classList.add('border-solid', 'border-outline-variant/60');

    document.getElementById('generatedExcuseText').textContent = `"${item.text}"`;
    document.getElementById('resultCategoryPill').textContent = item.cat;
    document.getElementById('resultAbsurdMeter').textContent = `${item.absurd} 🚨`;
    document.getElementById('stateBadge').innerHTML = '<span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Generada';
  }

  chips.forEach(chip => chip.addEventListener('click', () => setCategory(chip)));
  document.getElementById('generateBtn').addEventListener('click', generateRandomExcuse);
})();

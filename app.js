(function () {
  const groups = window.GROUPS;
  const root = document.getElementById('groups');
  const dialog = document.getElementById('case');
  const body = document.getElementById('caseBody');

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const pad = (n) => String(n).padStart(2, '0');
  const byId = {};

  root.innerHTML = groups.map((g, gi) => `
    <article class="group">
      <h3><span>${pad(gi + 1)} /</span> ${esc(g.title)}</h3>
      <p class="group__tags">${g.tags.map(esc).join('<i>/</i>')}</p>
      <div class="group__row">
        ${g.cases.map((c) => {
          byId[c.id] = c;
          return `
          <button class="tile" data-id="${c.id}">
            <span class="tile__img"><img src="images/${c.id}/cover.webp" alt="${esc(c.title)}" loading="lazy"></span>
            <span class="tile__kind">${esc(c.kind)}</span>
            <span class="tile__title">${esc(c.title)}</span>
          </button>`;
        }).join('')}
      </div>
    </article>`).join('');

  root.addEventListener('click', (e) => {
    const tile = e.target.closest('.tile');
    if (!tile) return;
    const c = byId[tile.dataset.id];
    const shots = Array.from({ length: c.shots }, (_, i) =>
      `<img src="images/${c.id}/${pad(i + 1)}.webp" alt="${esc(c.title)} — макет ${i + 1}" loading="lazy">`).join('');
    body.innerHTML = `
      <p class="eyebrow">${esc(c.kind)}</p>
      <h2>${esc(c.title)}</h2>
      <p class="case__lead">${esc(c.lead)}</p>
      <div class="case__facts">
        <div><h4>Задача</h4><p>${esc(c.task)}</p></div>
        <div><h4>Что сделала</h4><ul>${c.work.map((w) => `<li>${esc(w)}</li>`).join('')}</ul></div>
        <div><h4>Результат</h4><p>${esc(c.result)}</p></div>
      </div>
      <div class="case__gallery ${c.wide ? 'is-wide' : ''} ${c.tall ? 'is-tall' : ''}">${shots}</div>`;
    dialog.showModal();
    dialog.scrollTop = 0;
  });

  // Верхняя полоса на компьютере появляется, когда первый экран ушёл
  const bar = document.querySelector('.bar');
  const hero = document.querySelector('.hero');
  new IntersectionObserver(([e]) => bar.classList.toggle('is-shown', !e.isIntersecting), { threshold: 0.1 }).observe(hero);

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.closest('[data-close]')) dialog.close();
  });
})();

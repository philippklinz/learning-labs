(() => {
  'use strict';

  const cards = [...document.querySelectorAll('#project-cards .card')];
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const search = document.getElementById('project-search');
  const results = document.getElementById('result-count');
  const empty = document.getElementById('no-results');
  const clear = document.getElementById('clear-search');
  const languageMenu = document.querySelector('.language-menu');
  const editionLinks = [...languageMenu.querySelectorAll('[hreflang]')];
  const messages = JSON.parse(results.dataset.messages);
  const language = document.documentElement.lang;
  const plurals = new Intl.PluralRules(language);
  const numbers = new Intl.NumberFormat(language);
  const params = new URL(location.href).searchParams;
  let filter = buttons.find(button => button.dataset.filter === params.get('filter'))?.dataset.filter || 'all';
  search.value = params.get('q') || '';

  function normalize(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase(language);
  }

  // These are ordinary links even on file:// and with JavaScript disabled.
  // Keep a section, a shared journey and the current search when changing edition.
  function updateEditionLinks() {
    for (const link of editionLinks) {
      const url = new URL(link.href);
      url.search = location.search;
      if (filter === 'all') url.searchParams.delete('filter');
      else url.searchParams.set('filter', filter);
      if (search.value) url.searchParams.set('q', search.value);
      else url.searchParams.delete('q');
      url.hash = location.hash;
      link.href = url.href;
    }
  }

  function update() {
    const query = normalize(search.value.trim());
    let shown = 0;
    for (const card of cards) {
      const tags = card.dataset.tags.split(/\s+/);
      const text = normalize(card.textContent + ' ' + card.dataset.search);
      card.hidden = (filter !== 'all' && !tags.includes(filter)) || !text.includes(query);
      if (!card.hidden) shown++;
    }
    const pattern = messages[plurals.select(shown)] ?? messages.other;
    results.textContent = pattern.replace('{count}', numbers.format(shown));
    empty.hidden = shown !== 0;
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
    updateEditionLinks();
  }

  for (const button of buttons) button.addEventListener('click', () => {
    filter = button.dataset.filter;
    update();
  });
  search.addEventListener('input', update);
  clear.addEventListener('click', () => {
    filter = 'all';
    search.value = '';
    update();
    search.focus();
  });
  languageMenu.addEventListener('keydown', event => {
    if (event.key === 'Escape' && languageMenu.open) {
      languageMenu.open = false;
      languageMenu.querySelector('summary').focus();
    }
  });
  document.addEventListener('click', event => {
    if (languageMenu.open && !languageMenu.contains(event.target)) languageMenu.open = false;
  });

  document.querySelector('.journey-shelf').addEventListener('click', event => {
    const summary = event.target.closest('.journey > summary');
    if (!summary) return;
    const journey = summary.parentElement;
    const hash = journey.open ? '#journeys' : '#' + journey.id;
    // The browser toggles the disclosure after this click. Keep its URL shareable
    // without moving the reader away from the control they just activated.
    try { history.replaceState(history.state, '', hash); } catch { return; }
    updateEditionLinks();
  });

  function openLinkedJourney() {
    if (!location.hash.startsWith('#journey-')) return;
    const target = document.getElementById(location.hash.slice(1));
    const journey = target?.closest('.journey');
    if (journey) {
      journey.open = true;
    } else {
      // Editions may offer different journeys. Land on this edition's guide.
      location.replace('#journeys');
    }
  }
  window.addEventListener('hashchange', () => {
    openLinkedJourney();
    updateEditionLinks();
  });
  openLinkedJourney();
  update();
  document.getElementById('project-filters').hidden = false;
})();

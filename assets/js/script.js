const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.main-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

document.querySelectorAll('[data-rule-link]').forEach(link => {
  link.addEventListener('click', () => {
    const id = link.dataset.ruleLink;
    const detail = document.getElementById(id);
    if (detail && detail.tagName === 'DETAILS') detail.open = true;
  });
});

if (location.hash) {
  const target = document.querySelector(location.hash);
  if (target && target.tagName === 'DETAILS') target.open = true;
}


// V1.8.5 — recherche rapide du site
(() => {
  const headerRow = document.querySelector('.header-row');
  const nav = document.querySelector('.main-nav');
  const toggle = document.querySelector('.nav-toggle');
  if (!headerRow || !nav || document.querySelector('.site-search')) return;

  const scriptEl = document.currentScript;
  const siteRoot = scriptEl && scriptEl.src
    ? new URL('../../', scriptEl.src)
    : new URL('./', window.location.href);

  const entries = [
    { title: 'Accueil', category: 'Site', path: 'index.html', keywords: 'accueil triarchia noctis portail clan' },
    { title: 'Outils', category: 'Outils', path: 'outils.html', keywords: 'outils calculateurs analyseurs bloodwars' },
    { title: 'Analyseur de toucher', category: 'Outils', path: 'outils/toucher.html', keywords: 'toucher precision perception agilité agilite chance toucher final calculateur' },
    { title: 'Analyseur de Croisade', category: 'Outils', path: 'outils/croisade.html', keywords: 'croisade rc yog yog-saron dégâts degats initiative arcanes talismans boss' },
    { title: 'Guides', category: 'Guides', path: 'guides.html', keywords: 'guides tutoriels aide jeu bloodwars' },
    { title: 'Comment chasser un enchantement', category: 'Guide approfondi', path: 'guides/chasse-enchantements.html', keywords: 'enchantement enchantements cmt sang chance combat roi colline palier bonus' },
    { title: 'Le Voyage — les rudiments', category: 'Guide approfondi', path: 'guides/voyage.html', keywords: 'voyage pds points sang boss repos minuit sac récompenses recompenses' },
    { title: 'La Chasse — quel équipement privilégier ?', category: 'Guide approfondi', path: 'guides/chasse-equipement.html', keywords: 'chasse équipement equipement agilité agilite perception chien démon demon moindre supérieur superieur dévoreur devoreur massacrateur nécromorphe necromorphe esquive pv' },
    { title: 'Comparatif des armes Épiques / Anciennes', category: 'Guide', path: 'guides/comparatif-armes.html', keywords: 'armes arme épique epique ancienne anciennes dégâts degats ratio équipement equipement' },
    { title: 'Clan — Présentation', category: 'Clan', path: 'clan.html#presentation', keywords: 'clan presentation triarchia noctis tn' },
    { title: 'Histoire du clan', category: 'Clan', path: 'clan.html#histoire', keywords: 'histoire origine united for honor typhus souls shadows héritage heritage' },
    { title: 'Règlement du clan', category: 'Clan', path: 'clan.html#reglement', keywords: 'reglement règlement règles regles organisation leaders conseillers filou yanoss conseil' },
    { title: 'Activité et Z3', category: 'Règlement', path: 'clan.html#activite', keywords: 'activité activite z3 départ depart inactivité inactivite zone quitter clan' },
    { title: 'Discord et communication', category: 'Règlement', path: 'clan.html#communication', keywords: 'discord communication salon salons section sections' },
    { title: 'Événements et combats de clan', category: 'Règlement', path: 'clan.html#evenements', keywords: 'evenements événements combats clan chasse croisade cvc consignes' },
    { title: 'Recrutement', category: 'Clan', path: 'clan.html#recrutement', keywords: 'recrutement rejoindre candidature places clan' },
    { title: 'Zones du clan', category: 'Clan', path: 'clan/zones.html', keywords: 'zones zone z3 bâtiments batiments quartiers valeur combat classement membres' },
    { title: 'Actualités', category: 'Site', path: 'actualites.html', keywords: 'actualités actualites nouvelles mises jour maj historique' }
  ];

  const normalize = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const searchBox = document.createElement('div');
  searchBox.className = 'site-search';
  searchBox.innerHTML = `
    <form class="site-search-form" role="search" autocomplete="off">
      <input class="site-search-input" type="search" aria-label="Rechercher sur le site" placeholder="Rechercher…" />
      <button class="site-search-button" type="submit" aria-label="Lancer la recherche">⌕</button>
    </form>
    <div class="site-search-results" role="listbox" aria-label="Résultats de recherche"></div>
  `;

  headerRow.insertBefore(searchBox, toggle || nav);

  const form = searchBox.querySelector('.site-search-form');
  const input = searchBox.querySelector('.site-search-input');
  const results = searchBox.querySelector('.site-search-results');
  let currentMatches = [];

  const scoreEntry = (entry, query) => {
    const q = normalize(query);
    if (!q) return 0;
    const title = normalize(entry.title);
    const keywords = normalize(entry.keywords);
    const category = normalize(entry.category);
    const tokens = q.split(/\s+/).filter(Boolean);
    let score = 0;

    if (title === q) score += 140;
    if (title.startsWith(q)) score += 100;
    else if (title.includes(q)) score += 70;
    if (keywords.split(' ').includes(q)) score += 65;
    else if (keywords.includes(q)) score += 35;
    if (category.includes(q)) score += 15;

    for (const token of tokens) {
      if (title.split(' ').includes(token)) score += 24;
      else if (title.includes(token)) score += 16;
      if (keywords.split(' ').includes(token)) score += 18;
      else if (keywords.includes(token)) score += 10;
    }
    return score;
  };

  const render = () => {
    const query = input.value.trim();
    if (!query) {
      currentMatches = [];
      results.classList.remove('open');
      results.innerHTML = '';
      return;
    }

    currentMatches = entries
      .map(entry => ({ entry, score: scoreEntry(entry, query) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title, 'fr'))
      .slice(0, 6);

    if (!currentMatches.length) {
      results.innerHTML = '<div class="site-search-empty">Aucun résultat pour cette recherche.</div>';
      results.classList.add('open');
      return;
    }

    results.innerHTML = currentMatches.map(({ entry }) => {
      const url = new URL(entry.path, siteRoot).href;
      return `<a class="site-search-result" role="option" href="${url}"><strong>${entry.title}</strong><span>${entry.category}</span></a>`;
    }).join('');
    results.classList.add('open');
  };

  input.addEventListener('input', render);
  input.addEventListener('focus', () => { if (input.value.trim()) render(); });
  input.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      results.classList.remove('open');
      input.blur();
    }
    if (event.key === 'ArrowDown' && results.classList.contains('open')) {
      const first = results.querySelector('.site-search-result');
      if (first) { event.preventDefault(); first.focus(); }
    }
  });

  results.addEventListener('keydown', event => {
    const links = [...results.querySelectorAll('.site-search-result')];
    const index = links.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' && index >= 0) {
      event.preventDefault();
      (links[index + 1] || links[0]).focus();
    } else if (event.key === 'ArrowUp' && index >= 0) {
      event.preventDefault();
      (links[index - 1] || input).focus();
    } else if (event.key === 'Escape') {
      results.classList.remove('open');
      input.focus();
    }
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    render();
    if (currentMatches.length) {
      window.location.href = new URL(currentMatches[0].entry.path, siteRoot).href;
    }
  });

  document.addEventListener('click', event => {
    if (!searchBox.contains(event.target)) results.classList.remove('open');
  });
})();

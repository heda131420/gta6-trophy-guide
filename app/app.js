// Leonida Trophy Tracker: checklist, detail guides and roadmap for GTA VI's 55 PS5 trophies.
// Views and filters live in the URL (?view=checklist|detail|roadmap, &grade=&category=&status=&missable=1&spoilers=on&q=&trophy=N)
// so any state can be linked to, screenshotted and shared. Progress lives in localStorage.
import { PHASES, CATEGORY_LABELS, readParams, filterTrophies, isSpoilerHidden } from './src/filters.js';
import { loadEarned, saveEarned, downloadProgress, parseProgressFile, gradeCounts } from './src/progress.js';

const params = readParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));
let earned = loadEarned();

const $ = (id) => document.getElementById(id);
const els = {
  progressCount: $('progress-count'), progressFill: $('progress-fill'), progressGrades: $('progress-grades'),
  tabsNote: $('tabs-note'), roadmapStrip: $('roadmap-strip'), controls: $('controls'),
  q: $('q'), grade: $('grade'), category: $('category'), status: $('status'),
  missableOnly: $('missable-only'), spoilers: $('spoilers'),
  resultLine: $('result-line'), rows: $('rows'),
  viewChecklist: $('view-checklist'), viewDetail: $('view-detail'), viewRoadmap: $('view-roadmap'),
  detail: $('detail'), detailNav: $('detail-nav'), phases: $('phases'), missableCallout: $('missable-callout'),
};

function gradeBadge(grade) {
  const s = document.createElement('span');
  s.className = `badge ${grade}`;
  s.textContent = grade;
  return s;
}

function trophyLink(t) {
  const a = document.createElement('a');
  a.className = 'open-link';
  a.href = `?view=detail&trophy=${t.id}`;
  a.textContent = 'Guide →';
  return a;
}

function renderProgress() {
  const n = earned.size;
  els.progressCount.textContent = `${n} of ${trophies.length} earned`;
  els.progressFill.style.width = `${Math.round((n / trophies.length) * 100)}%`;
  const counts = gradeCounts(trophies, earned);
  els.progressGrades.textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${g[0].toUpperCase() + g.slice(1)} ${counts[g].earned}/${counts[g].total}`).join(' · ');
}

function renderStrip() {
  els.roadmapStrip.replaceChildren();
  for (const p of PHASES) {
    const list = trophies.filter((t) => t.phase === p.n);
    const done = list.filter((t) => earned.has(t.id)).length;
    const a = document.createElement('a');
    a.className = 'phase-chip';
    a.href = '?view=roadmap';
    const b = document.createElement('b');
    b.textContent = p.title;
    const s = document.createElement('span');
    s.textContent = `${done}/${list.length} earned — ${p.sub}`;
    a.append(b, s);
    els.roadmapStrip.append(a);
  }
}

function excerpt(text, max = 200) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 120 ? lastSpace : max)}…`;
}

function renderChecklist() {
  const shown = filterTrophies(trophies, params, earned);
  const bits = [];
  if (params.grade !== 'all') bits.push(`grade: ${params.grade}`);
  if (params.category !== 'all') bits.push(`category: ${CATEGORY_LABELS[params.category]}`);
  if (params.status !== 'all') bits.push(params.status === 'earned' ? 'earned only' : 'not yet earned');
  if (params.missableOnly) bits.push('missable only');
  if (params.q) bits.push(`matching “${params.q}”`);
  els.resultLine.textContent = `Showing ${shown.length} of ${trophies.length} trophies${bits.length ? ` — ${bits.join(', ')}` : ''}. Tick a trophy when you earn it; progress is saved in this browser.`;
  els.rows.replaceChildren();
  if (shown.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.className = 'empty';
    td.textContent = 'No trophies match these filters. Clear a filter to see more.';
    tr.append(td);
    els.rows.append(tr);
    return;
  }
  for (const t of shown) {
    const tr = document.createElement('tr');
    if (earned.has(t.id)) tr.classList.add('earned');
    const tdBox = document.createElement('td');
    tdBox.className = 'col-earned';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Mark trophy #${t.id} as earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      saveEarned(earned);
      renderAll();
    });
    tdBox.append(box);
    const tdName = document.createElement('td');
    const name = document.createElement('div');
    name.className = 'trophy-name';
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    if (isSpoilerHidden(t, params, earned)) {
      name.textContent = `Hidden story trophy #${t.id}`;
      name.classList.add('spoiler-hidden');
      desc.textContent = 'Earn it to reveal its name and description.';
    } else {
      name.textContent = t.name;
      desc.textContent = t.description;
    }
    tdName.append(name, desc);
    if (t.missable) {
      const flag = document.createElement('span');
      flag.className = 'flag-missable';
      flag.textContent = 'Missable';
      tdName.append(flag);
    }
    if (t.id === 49) {
      const flag = document.createElement('span');
      flag.className = 'flag-unconfirmed';
      flag.textContent = 'Unconfirmed';
      tdName.append(flag);
    }
    const tdGrade = document.createElement('td');
    tdGrade.className = 'col-grade';
    tdGrade.append(gradeBadge(t.grade));
    const tdGuide = document.createElement('td');
    tdGuide.className = 'trophy-guide';
    tdGuide.textContent = isSpoilerHidden(t, params, earned)
      ? 'Hidden until earned — tick the box to reveal it.'
      : excerpt(t.guide);
    const tdOpen = document.createElement('td');
    tdOpen.className = 'col-open';
    tdOpen.append(trophyLink(t));
    tr.append(tdBox, tdName, tdGrade, tdGuide, tdOpen);
    els.rows.append(tr);
  }
}

function renderDetail() {
  const t = byId.get(params.trophy);
  if (!t) {
    els.detail.replaceChildren();
    const p = document.createElement('p');
    p.textContent = 'No such trophy. Pick one from the checklist.';
    els.detail.append(p);
    els.detailNav.replaceChildren();
    return;
  }
  const hidden = isSpoilerHidden(t, params, earned);
  els.detail.replaceChildren();
  const h2 = document.createElement('h2');
  h2.textContent = hidden ? `Hidden story trophy #${t.id}` : t.name;
  if (hidden) h2.classList.add('spoiler-hidden');
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.append(gradeBadge(t.grade));
  const cat = document.createElement('span');
  cat.textContent = `${CATEGORY_LABELS[t.category]} · Roadmap phase ${t.phase}`;
  meta.append(cat);
  if (t.missable) {
    const flag = document.createElement('span');
    flag.className = 'flag-missable';
    flag.textContent = 'Missable — do it before Chapter 1 ends';
    meta.append(flag);
  }
  const desc = document.createElement('p');
  desc.className = 'desc';
  desc.textContent = hidden ? 'Earn it to reveal its official description.' : t.description;
  const earnedRow = document.createElement('p');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.id = 'detail-earned';
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    saveEarned(earned);
    renderAll();
  });
  const lab = document.createElement('label');
  lab.htmlFor = 'detail-earned';
  lab.textContent = ' I have earned this trophy';
  earnedRow.append(box, lab);
  const hGuide = document.createElement('h3');
  hGuide.textContent = 'How to get it';
  const guide = document.createElement('p');
  guide.textContent = hidden
    ? 'Hidden until earned — tick the box above to reveal the guide and sources, or turn spoilers off.'
    : t.guide;
  els.detail.append(h2, meta, desc, earnedRow, hGuide, guide);
  if (t.missable) {
    const warn = document.createElement('div');
    warn.className = 'warn';
    const strong = document.createElement('strong');
    strong.textContent = 'Do this one early. ';
    warn.append(strong, document.createTextNode('The Chapter 1 meditation at Jason\u2019s house disappears once Chapter 1 ends, and it is still unconfirmed whether it counts toward the trophy. Talk to Lucia in the kitchen on a Chapter 1 morning, follow her to the balcony, and accept.'));
    els.detail.append(warn);
  }
  if (t.id === 49) {
    const warn = document.createElement('div');
    warn.className = 'warn';
    const strong = document.createElement('strong');
    strong.textContent = 'Unconfirmed. ';
    warn.append(strong, document.createTextNode('No guide has confirmed this trophy\u2019s exact trigger yet. The leading suspicion is the Payday Loans store from the prologue — check the cited sources for updates before attempting it.'));
    els.detail.append(warn);
  }
  if (!hidden) {
    const hSrc = document.createElement('h3');
    hSrc.textContent = 'Sources';
    const ul = document.createElement('ul');
    ul.className = 'sources';
    for (const url of t.sources) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = url;
      a.rel = 'noopener';
      a.textContent = url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
      li.append(a);
      ul.append(li);
    }
    els.detail.append(hSrc, ul);
  }
  els.detailNav.replaceChildren();
  const prev = byId.get(t.id - 1);
  const next = byId.get(t.id + 1);
  if (prev) {
    const a = document.createElement('a');
    a.href = `?view=detail&trophy=${prev.id}`;
    a.textContent = `← ${isSpoilerHidden(prev, params, earned) ? `Hidden story trophy #${prev.id}` : prev.name}`;
    els.detailNav.append(a);
  }
  if (next) {
    const a = document.createElement('a');
    a.href = `?view=detail&trophy=${next.id}`;
    a.textContent = `${isSpoilerHidden(next, params, earned) ? `Hidden story trophy #${next.id}` : next.name} →`;
    els.detailNav.append(a);
  }
}

function renderRoadmap() {
  els.phases.replaceChildren();
  for (const p of PHASES) {
    const list = trophies.filter((t) => t.phase === p.n);
    const done = list.filter((t) => earned.has(t.id)).length;
    const card = document.createElement('div');
    card.className = 'phase-card';
    const h3 = document.createElement('h3');
    h3.textContent = p.title;
    const count = document.createElement('span');
    count.className = 'count';
    count.textContent = ` — ${done}/${list.length} earned`;
    h3.append(count);
    const sub = document.createElement('p');
    sub.textContent = p.text;
    const ul = document.createElement('ul');
    for (const t of list) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `?view=detail&trophy=${t.id}`;
      a.textContent = isSpoilerHidden(t, params, earned) ? `Hidden story trophy #${t.id}` : t.name;
      if (earned.has(t.id)) a.style.textDecoration = 'line-through';
      li.append(a);
      if (t.missable) {
        const flag = document.createElement('span');
        flag.className = 'flag-missable';
        flag.textContent = 'Missable';
        li.append(' ', flag);
      }
      ul.append(li);
    }
    card.append(h3, sub, ul);
    els.phases.append(card);
  }
  els.missableCallout.replaceChildren();
  const h3 = document.createElement('h3');
  h3.textContent = 'The one trophy you can miss';
  const p1 = document.createElement('p');
  const strong = document.createElement('strong');
  strong.textContent = 'Positive Mental Attitude';
  p1.append(strong, document.createTextNode(' — meditate at every spot across Leonida. The first meditation, at Jason\u2019s house, is only available during Chapter 1. After the mission Down to Earth, talk to Lucia in the kitchen in the morning, follow her to the balcony and accept.'));
  const p2 = document.createElement('p');
  p2.textContent = 'Everything else can be finished in free-roam after the story. Keep a save at the start and end of each chapter (15 manual slots) so a missed optional mission never costs you a playthrough.';
  els.missableCallout.append(h3, p1, p2);
}

function syncControls() {
  els.q.value = params.q;
  els.grade.value = params.grade;
  els.category.value = params.category;
  els.status.value = params.status;
  els.missableOnly.checked = params.missableOnly;
  els.spoilers.checked = params.spoilers;
}

function currentQuery() {
  const p = new URLSearchParams();
  p.set('view', params.view);
  if (params.grade !== 'all') p.set('grade', params.grade);
  if (params.category !== 'all') p.set('category', params.category);
  if (params.status !== 'all') p.set('status', params.status);
  if (params.missableOnly) p.set('missable', '1');
  if (params.spoilers) p.set('spoilers', 'on');
  if (params.q) p.set('q', params.q);
  if (params.view === 'detail' && params.trophy) p.set('trophy', String(params.trophy));
  return p.toString();
}

function onFilterChange() {
  params.q = els.q.value.trim();
  params.grade = els.grade.value;
  params.category = els.category.value;
  params.status = els.status.value;
  params.missableOnly = els.missableOnly.checked;
  params.spoilers = els.spoilers.checked;
  params.view = 'checklist';
  history.replaceState(null, '', `?${currentQuery()}`);
  renderAll();
}

function renderAll() {
  renderProgress();
  const isChecklist = params.view === 'checklist';
  const isDetail = params.view === 'detail';
  const isRoadmap = params.view === 'roadmap';
  els.viewChecklist.hidden = !isChecklist;
  els.viewDetail.hidden = !isDetail;
  els.viewRoadmap.hidden = !isRoadmap;
  els.controls.style.display = isChecklist ? '' : 'none';
  els.roadmapStrip.style.display = isChecklist ? '' : 'none';
  document.querySelector('#tab-checklist').classList.toggle('active', isChecklist || isDetail);
  document.querySelector('#tab-roadmap').classList.toggle('active', isRoadmap);
  const detailTrophy = byId.get(params.trophy);
  els.tabsNote.textContent = isDetail
    ? `Guide: ${detailTrophy ? (isSpoilerHidden(detailTrophy, params, earned) ? `Hidden story trophy #${detailTrophy.id}` : detailTrophy.name) : ''}`
    : `${earned.size} of ${trophies.length} earned · 1 platinum · 2 gold · 6 silver · 46 bronze`;
  if (isChecklist) { renderStrip(); renderChecklist(); }
  if (isDetail) renderDetail();
  if (isRoadmap) renderRoadmap();
}

els.q.addEventListener('input', () => { params.q = els.q.value.trim(); params.view = 'checklist'; history.replaceState(null, '', `?${currentQuery()}`); renderAll(); });
els.grade.addEventListener('change', onFilterChange);
els.category.addEventListener('change', onFilterChange);
els.status.addEventListener('change', onFilterChange);
els.missableOnly.addEventListener('change', onFilterChange);
els.spoilers.addEventListener('change', onFilterChange);
$('export').addEventListener('click', () => downloadProgress(earned));
$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    earned = parseProgressFile(await file.text());
    saveEarned(earned);
    renderAll();
  } catch {
    alert('That file is not a Leonida Trophy Tracker progress export.');
  }
  e.target.value = '';
});

syncControls();
renderAll();

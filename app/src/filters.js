// Pure helpers for reading URL params and filtering the trophy list.
// No DOM access here, so the rules are easy to test in isolation.

export const PHASES = [
  { n: 1, title: 'Phase 1 — Story first', sub: 'Chapters 1–5 · 17 trophies', text: 'Play the story and pick up what you can along the way: the chapter trophies, the first fishing and arcade trophies, the Chapter 1 meditation, and easy scans and fights as they come.' },
  { n: 2, title: 'Phase 2 — Side questlines', sub: 'Strangers & friends · 7 trophies', text: 'Finish the optional questlines for Andy, Kenton, Billy, Randy, Tyrone and Bret, plus 8 Strangers & Freaks strands. None of these are missable — all remain open in free-roam.' },
  { n: 3, title: 'Phase 3 — Activities & collectibles', sub: 'Stunts, ranges, cards · 9 trophies', text: 'Grind the repeatable systems: 250 stunts, gold at every shooting range, drone races, card sets, WAiNK scans, challenges and full map exploration.' },
  { n: 4, title: 'Phase 4 — Robberies, money & cleanup', sub: 'The long tail · 22 trophies', text: 'Bank vaults, armored trucks, gang operations, garages, laundering and the odd jobs — then 100% Completion and the platinum.' },
];

export const CATEGORY_LABELS = {
  platinum: 'Platinum',
  story: 'Story',
  'side-quests': 'Side questlines',
  activities: 'Activities',
  collectibles: 'Collectibles',
  combat: 'Combat & robberies',
  exploration: 'Exploration & money',
};

export function readParams(search) {
  const p = new URLSearchParams(search || '');
  const view = p.get('view') === 'roadmap' ? 'roadmap' : p.get('view') === 'detail' ? 'detail' : 'checklist';
  const grade = ['platinum', 'gold', 'silver', 'bronze'].includes(p.get('grade')) ? p.get('grade') : 'all';
  const category = Object.keys(CATEGORY_LABELS).includes(p.get('category')) ? p.get('category') : 'all';
  const status = ['earned', 'todo'].includes(p.get('status')) ? p.get('status') : 'all';
  const trophy = Number.parseInt(p.get('trophy') || '', 10);
  return {
    view,
    grade,
    category,
    status,
    missableOnly: p.get('missable') === '1',
    spoilers: p.get('spoilers') === 'on',
    q: (p.get('q') || '').trim(),
    trophy: Number.isFinite(trophy) && trophy >= 1 && trophy <= 55 ? trophy : null,
  };
}

export function filterTrophies(trophies, f, earned) {
  const q = f.q.toLowerCase();
  return trophies.filter((t) => {
    if (f.grade !== 'all' && t.grade !== f.grade) return false;
    if (f.category !== 'all' && t.category !== f.category) return false;
    if (f.status === 'earned' && !earned.has(t.id)) return false;
    if (f.status === 'todo' && earned.has(t.id)) return false;
    if (f.missableOnly && !t.missable) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
    return true;
  });
}

export function isSpoilerHidden(t, f, earned) {
  return f.spoilers && t.category === 'story' && !earned.has(t.id);
}

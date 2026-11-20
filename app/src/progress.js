// Progress persistence: earned trophy ids in localStorage, plus export/import.
// The stored value is a JSON array of trophy ids (numbers).

export const STORAGE_KEY = 'leonida-trophy-tracker-earned-v1';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55));
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

export function downloadProgress(earned) {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b) }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

export function parseProgressFile(text) {
  const data = JSON.parse(text);
  const arr = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(arr)) throw new Error('not a progress file');
  const ids = arr.map((v) => (typeof v === 'string' ? Number.parseInt(v, 10) : v)).filter((n) => Number.isInteger(n) && n >= 1 && n <= 55);
  return new Set(ids);
}

export function gradeCounts(trophies, earned) {
  const out = {};
  for (const t of trophies) {
    out[t.grade] = out[t.grade] || { total: 0, earned: 0 };
    out[t.grade].total += 1;
    if (earned.has(t.id)) out[t.grade].earned += 1;
  }
  return out;
}

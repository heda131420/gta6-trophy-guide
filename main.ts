// Leonida Trophy Tracker — the entry program for gta6-trophy-guide-01 (Node 22, standard library only).
//
// The guide itself is this directory's app/ folder: plain static files a browser opens at
// app/index.html (ES modules, CSS, no build step), fully offline — it loads nothing over the
// network — and its trophy list and guides live in app/data/trophies.json. This program hands
// the entry in: it copies app/ and screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads (the screenshots, the first load's files
// and bytes, and the source), with the vendored make.fun library. Leave
// vendor/makefun-frontend.ts as it is: the scorer requires dossier.json to be byte for byte
// what its own copy writes.
//
// Serve the app locally with any static server rooted at app/ (for example
// `python3 -m http.server` from app/), then open the served index.html.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The copies come first: buildDossier reads app/ and screenshots/ out of the output
// directory, so both must be in place before it runs. The dossier's cover is the
// first screenshot by name (screenshots/1-checklist.jpg).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);

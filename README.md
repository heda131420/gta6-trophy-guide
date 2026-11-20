# Leonida Trophy Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/heda131420/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/heda131420/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI. Every trophy is listed with its official name, description and grade, a practical guide in our own words with cited sources, and a place in a four-phase roadmap to the platinum. The checklist saves your progress in the browser (localStorage) and can be exported and imported; filters cover grade, category, status and missables, and a spoiler setting hides story trophy names until you earn them.

## Run it

```sh
# Serve app/ with any static server, then open the served index.html:
python3 -m http.server --directory app 8080
# or: cd app && python3 -m http.server 8080
```

No build step, no network: the app is plain HTML, CSS and JavaScript under `app/`, and `app/data/trophies.json` holds the 55 trophies with their guides and sources.

## Deep links

Every view is a URL, so you can bookmark or share it:

- `?view=checklist` — the full checklist with filters.
- `?view=detail&trophy=28` — one trophy's guide and sources.
- `?view=roadmap` — the four-phase roadmap to platinum.
- `?view=checklist&grade=silver` — only the silver trophies.
- `?view=checklist&missable=1` — the one trophy you can miss.
- `?view=checklist&spoilers=on` — hides the names, descriptions and guides of story trophies you have not earned yet (they reappear once you tick them earned).
- `?view=checklist&q=stunt` — search by name or keyword.

## What's inside

- `app/index.html`, `app/style.css`, `app/app.js` — the tracker (checklist, detail guides, roadmap views driven by URL parameters).
- `app/src/filters.js` — URL parameter parsing and trophy filtering.
- `app/src/progress.js` — localStorage progress, export/import.
- `app/data/trophies.json` — the 55 official trophies with guides, sources, categories, roadmap phases and the one missable flag.
- `main.ts` — the entry program: copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.
- `screenshots/` — four screenshots of the app running in a browser (the first is the cover).

## Roadmap to platinum

1. **Story first** — play Chapters 1–5 and pick up what you can along the way (17 trophies). Do the Chapter 1 meditation for Positive Mental Attitude before Chapter 1 ends — it is the only missable trophy.
2. **Side questlines** — Andy, Kenton, Billy, Randy, Tyrone, Bret and 8 Strangers & Freaks strands (7 trophies).
3. **Activities & collectibles** — stunts, shooting ranges, drone races, card sets, WAiNK scans, challenges and full map exploration (9 trophies).
4. **Robberies, money & cleanup** — bank vaults, armored trucks, gang operations, garages and laundering, then 100% Completion and the platinum (22 trophies).

About 200 hours in all. Only one trophy can be missed; everything else can be finished in free-roam after the story.

---

<sub>Entered on [make.fun](https://make.fun/?ref=p3a162wj&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>

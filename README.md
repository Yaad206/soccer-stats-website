# Blaugrana Squad

An unofficial fan website about the FC Barcelona first team, built with HTML, CSS, and vanilla JavaScript.

## Pages
- `index.html`: Home (squad at a glance, players to know, honours, images)
- `players.html`: all 27 first-team players, filterable by position, with official profile links
- `statistics.html`: sortable squad table, chart of players by position, share-of-squad table, Quick Finder search form
- `club.html`: club facts (definition list), honours table, coaching staff
- `about.html`: purpose, disclaimer, creator, Sources
- `404.html`, `favicon.png`, `robots.txt`, `sitemap.xml`, `css/styles.css`, `js/main.js`, `images/`

## Publishing over your existing repo
1. In your repo, delete the old files that are no longer used: `teams.html` and the three old images in `images/` (basketball, soccer, baseball).
2. Keep your `.nojekyll` file.
3. Upload everything in this folder (keep the `css`, `js`, and `images` folders) and commit. Replace files when GitHub asks.
4. Wait a minute or two, then reload your Pages site.

## Notes
- Squad data (names, shirt numbers, positions, honours, staff) comes from the official FC Barcelona and LaLiga squad pages, as listed in October 2026. Squads change, so update `players.html`, `statistics.html`, and the finder data in `js/main.js` after transfer windows.
- The FC Barcelona crest (`images/fc-barcelona-crest.png`) is a club trademark, used here only to identify the subject of this unofficial fan site. The three other images are illustrations drawn for this site; no official photographs are used. Swap in your own photos only if you have the right to use them, and give each a descriptive `alt`.
- Canonical URLs, the sitemap, and robots.txt point to `https://yaad206.github.io/soccer-stats-website/`. Update them if your repo name changes.

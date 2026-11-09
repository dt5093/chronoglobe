# Chronoglobe

A browser game: you get a spinning globe showing the world's countries, colonies and capitals as they were on 1 July of some year between 1900 and 2026. Use the historical clues to guess the year.

- Five rounds per game, one from each quarter-century (1900–24, 1925–49, 1950–74, 1975–99, 2000–26).
- Up to 5,000 points a round. Points fall off with every year you miss by.
- Colonies are tinted in their ruling empire's colour. Hover or tap a territory to see its capital and who ruled it.
- Drag to rotate, scroll or pinch to zoom, or use the + / − buttons.

## Running it

It's a static site with no build step. Serve the folder over HTTP (opening `index.html` straight from disk won't load the map files):

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

To publish it with GitHub Pages, go to **Settings → Pages**, choose **Deploy from a branch**, and pick `main` with the `/ (root)` folder.

### Deploying to Render

The repo includes a `render.yaml` Blueprint for a free Render static site.

1. In the [Render dashboard](https://dashboard.render.com), choose **New → Blueprint** and connect this GitHub repo.
2. Render reads `render.yaml` and creates a static site named `chronoglobe`. Click **Apply**.

To set it up by hand instead, choose **New → Static Site**, pick the repo, leave **Build Command** empty (or `echo "No build step"`), and set **Publish Directory** to `.`. Every push to `main` redeploys.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The whole game: markup, styles and script. Loads d3 and topojson from cdnjs. |
| `maps/world.json` | Every territory from 1900 to 2019 as TopoJSON. Each one has its start and end dates plus a list of periods: name, ruler and capital. |
| `maps/land.json` | Coastlines, drawn under the borders. |
| `scripts/history.js` | Hand-written table of period names, colonial rulers, independence dates and capital corrections. |
| `render.yaml` | Render Blueprint: static site, no build step. |
| `scripts/build-map.js` | Combines CShapes with `history.js` to produce the data in `maps/world.json`. |

## Rebuilding the map data

1. Download `CShapes-2.0.geojson` from https://icr.ethz.ch/data/cshapes/ and save it as `data-src/cshapes/cshapes.geojson`.
2. Install the tools and build:

```bash
npm install
```

```bash
node scripts/build-map.js data-src
```

```bash
npx mapshaper -i data-src/cshapes/prepared.geojson -simplify 25% keep-shapes planar -rename-layers borders -o maps/world.json format=topojson quantization=100000
```

## Data sources and licences

- **Borders and capitals:** [CShapes 2.0](https://icr.ethz.ch/data/cshapes/), ETH Zurich (Schvitz, Girardin, Rüegger, Weidmann, Cederman & Gleditsch, 2022), licensed [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). `maps/world.json` is derived from it and is shared under the same licence, so it may not be used commercially.
- **Rulers, period names and capital fixes** in `scripts/history.js` were compiled by hand for this game. CShapes doesn't record colonial rulers, and for some colonies it lists today's capital.
- **Coastlines:** [Natural Earth](https://www.naturalearthdata.com/) via [world-atlas](https://github.com/topojson/world-atlas), public domain.

CShapes ends in 2019. Borders haven't changed since, so 2020–2026 show the 2019 map.

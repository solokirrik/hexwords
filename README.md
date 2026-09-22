# #hexwords
A small web app that lists hex colors which spell words, sorted by hue family and lightness.

This is a fork of [paoloricciuti/hexwords](https://github.com/paoloricciuti/hexwords).

## What's different in this fork

### Color sorting

The original lists colors in word order. This fork sorts them by how they look:

- **Perceptual color math.** Every color is converted to [OkLCh](https://oklch.fyi) (perceived lightness, chroma and hue). Colors with transparency are first blended over white, so they are sorted as they appear on the page.
- **Greys first.** Colors with very low chroma (below 0.04) go into their own grey group, so near-greys such as `#C0C0A5` and `#D0DDED` don't scatter across the other groups.
- **12 color groups:** red, orange, yellow, brown, green, cyan, blue, violet, purple, magenta, pink and grey. The crowded purple range is split into violet, purple and magenta. Dark tans and olives get their own brown group instead of landing in orange or yellow.
- **2D layout.** Within each group, every row is one lightness step, lightest at the top, running from vivid to muted. Rows follow the number of columns on screen, so the layout holds when you resize the window, filter or show transparent colors.
- **Flat view.** With grouping turned off, all colors form one grid: lightness from top to bottom and the color spectrum from left to right.

### Finding similar colors

- **Perceptual distance.** "Order by proximity" compares colors in OkLab, which matches what looks similar far better than comparing RGB values.
- **Only close matches.** A proximity search shows the 60 nearest colors, either grouped by color (closest group first) or as a flat list.
- **Live color picking.** The results update while you move through the color picker, with no need to press Enter.

### Tiles and controls

- **Click to copy.** Clicking a tile copies its hex code and sets it as the page background.
- **Compact tiles.** Tiles are 8rem wide by default, instead of 15rem, with square corners and no gaps. A slider adjusts the width from 4rem to 15rem.
- **New controls.** Switches for transparent colors (Alpha) and for grouping by hue sit in one row with the width slider. The search box and the proximity input have the same width and line up.

### Under the hood

- Built with plain [Vite](https://vite.dev) and Svelte 5 instead of SvelteKit, which the single page didn't need. This runs on current Node.js versions and cuts the dependencies to under 50 packages.
- The original project's Google Analytics tag has been removed.

## Development

Requires Node.js 22.12 or newer. `.nvmrc` pins Node 26, so with nvm, `nvm use` picks it.

```bash
nvm use
npm install
npm run dev     # dev server on http://localhost:3009
npm run build   # static site in build/
npm run check   # type check
```

Made with love and with Svelte.

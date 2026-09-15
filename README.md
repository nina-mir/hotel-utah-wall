# The sticker wall at Hotel Utah Saloon

A zoomable recreation of the sticker wall beside the stage at
[Hotel Utah Saloon](https://hotelutah.com), 500 4th Street, San Francisco — one of the
oldest continuously operating bars in the city. Bands that play the room leave a sticker.
This is that wall, rebuilt from photographs, with each sticker linked to the band where
one could be found.

Roughly 112 stickers, 63 of them linked.

## Running it

It's a static site, but the stickers load from a JSON file, so `file://` won't work —
you need to serve the folder:

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

Any static host will serve it as-is. No build step, no dependencies.

## Getting around

| Action | Mouse / trackpad | Touch | Keyboard |
| --- | --- | --- | --- |
| Zoom | scroll, or `+` / `−` | pinch, double-tap | `+` `−`, `0` to fit |
| Pan | drag | drag | arrow keys |
| Jump | drag the navigator box | tap the navigator | — |
| Band details | click a sticker | tap a sticker | `Esc` closes |

## Structure

```
index.html          the scene: wall, framed photograph, sconce
css/wall.css        all styling; the scene is drawn in CSS and SVG
js/wall.js          renders stickers from JSON, then pan/zoom/navigator
data/stickers.json  every sticker: position, rotation, name, link
img/                the sticker images, cropped from photographs
```

The wall is authored in a fixed 952 × 1265 coordinate space. Every sticker's `x`, `y`,
`w`, `h` and `rot` are in those units, and the whole stage is transformed to fit the
viewport. To move a sticker, edit `data/stickers.json` — nothing else needs to change.

The light and the framed 1896 photograph of Pacific & Larkin are part of the scene
markup rather than the sticker data. The sconce is drawn in SVG; the photograph is a
crop of the print hanging on the wall.

## Adding a sticker

Bands keep playing the room. See
[HOW-TO-ADD-A-NEW-IMAGE.md](HOW-TO-ADD-A-NEW-IMAGE.md) — crop the image, add an entry to
`data/stickers.json`, push.

## About the links

Links were found by searching each sticker's name and point to the official site,
Bandcamp, or social account that best matches. Matching is by name and logo, so a link
may occasionally point to a different act sharing a name. Entries marked `uncertain`
in the data are educated guesses rather than confirmed matches. Some stickers have no
link because no matching artist could be found.

Nothing here is affiliated with or endorsed by the venue or the bands. If a sticker is
yours and you'd like the link corrected or the sticker removed,
[open an issue](https://github.com/nina-mir/hotel-utah-wall/issues).

## Credit

Photographs of the wall and the project by [@nina-mir](https://github.com/nina-mir).
Sticker artwork belongs to the respective bands and artists.

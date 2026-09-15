# How to add a new sticker to the wall

Bands keep playing the room, so the wall keeps growing. Adding one here takes three
steps: crop the image, add a line to the data file, push.

No build step, no tooling to install. Everything below is a text editor and an image
editor.

---

## 1. Crop the image

Photograph the sticker as straight-on as you can — standing off to the side gives it a
keystone lean that's hard to undo. Crop tight to its edges, so the image contains the
sticker and nothing else.

Save it into `img/`, named after the band in lowercase with hyphens:

```
img/new-band.jpg
```

**Size.** About 300px on the long edge. Larger is wasted bandwidth; smaller goes soft
when someone zooms in.

**Rectangles and circles** can stay as `.jpg`.

**Die-cut shapes** — a lemon, a lizard, a logo with an irregular outline — need a
transparent background, so save those as `.png` with the wall keyed out. Photoshop,
GIMP, or a one-click tool like [remove.bg](https://remove.bg) all work. A circular
sticker on a square background is fine as a `.jpg`; the `ro` shape below will mask it.

---

## 2. Add an entry to `data/stickers.json`

Every sticker on the wall is one object in the `stickers` array. Add yours:

```json
{
 "img": "new-band.jpg",
 "shape": "rd",
 "x": 620,
 "y": 880,
 "w": 54,
 "h": 40,
 "rot": -3,
 "name": "New Band",
 "note": "Oakland post-punk",
 "url": "https://newband.bandcamp.com/",
 "uncertain": false
}
```

### The fields

| Field | What it does |
| --- | --- |
| `img` | Filename inside `img/`. Just the name, no path. |
| `shape` | `rd` rectangle with softly rounded corners · `ro` circle · `cut` die-cut PNG with transparency |
| `x`, `y` | Top-left corner, in wall coordinates (see below) |
| `w`, `h` | Size in the same units. Keep the ratio matching your crop or it will stretch. |
| `rot` | Rotation in degrees. Real stickers are never straight — ±1 to ±8 looks right. |
| `name` | Shown on hover and in the tap sheet. Leave `""` for a sticker with no identifiable band. |
| `note` | A short line of context: city, genre, year. Optional. |
| `url` | The band's site, Bandcamp, or social account. Leave `""` if you can't find one — the sticker still shows its name, it just won't be clickable. |
| `uncertain` | `true` if you're not confident the link is the right band. Displays a `(?)` and a note on hover. |

### Coordinates

The wall is a fixed **952 × 1265** space, and everything is positioned in those units
regardless of screen size. Useful landmarks:

| Region | Roughly |
| --- | --- |
| Panel above the light | x 500–890, y 120–440 |
| Main sticker field | x 180–930, y 440–960 |
| Door trim column, right edge | x 920–950, y 200–880 |
| Framed 1896 photograph | x 55–415, y 300–600 — keep off it |
| The sconce | around x 440–560, y 230–480 — keep clear |
| Below y 980 | the wainscot: nothing goes here |

### Overlap

Entries later in the array draw on top of earlier ones. To tuck a new sticker
*underneath* an existing one, put it earlier in the list; to layer it on top, put it
later. Overlapping is good — the real wall is layers of them.

---

## 3. Find the coordinates without guessing

Open the site, zoom to where you want the sticker, then paste this into the browser
console:

```js
document.getElementById('viewport').addEventListener('click', e => {
  const t = stage.style.transform.match(/-?[\d.]+/g);
  console.log(Math.round((e.clientX - t[0]) / t[2]),
              Math.round((e.clientY - t[1]) / t[2]));
});
```

Now click the spot on the wall. It prints the `x` and `y` in wall coordinates — paste
those straight into your entry.

To judge `w` and `h`, look at neighbouring stickers in `stickers.json`. Most sit between
30 and 70 units wide.

---

## 4. Check it locally

The stickers load from a JSON file, so opening `index.html` by double-clicking will not
work — the browser blocks the fetch. Serve the folder instead:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. If the sticker doesn't appear, open the console: a
404 means the filename in `stickers.json` doesn't match the file in `img/`, and a JSON
parse error usually means a missing comma between entries.

---

## 5. Push

```bash
git add -A
git commit -m "add New Band"
git push
```

GitHub Pages rebuilds in about a minute.

---

## Notes on links

Links are found by searching the band name and pointing at whatever official site,
Bandcamp, or social account best matches. Matching is done by name and logo, so it's
possible to land on a different act sharing a name. When in doubt set `"uncertain":
true` rather than leaving a confident wrong link — a marked guess is honest, a clean
guess isn't.

If a sticker is yours and you'd like the link corrected or the sticker taken down,
[open an issue](https://github.com/nina-mir/hotel-utah-wall/issues).

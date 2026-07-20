# TheyLive

They Live Movie Experience — an interactive homage to John Carpenter's *They Live* (1988).

No footage, images, or dialogue from the film are used. Instead, the site recreates the
film's central idea — a hidden layer of control messaging beneath ordinary advertising —
as an original interactive page.

## What it does

- Loads into a colorful, "everything's fine" advertising landing page.
- A floating **PUT ON THE GLASSES** button flips the page into a stark black-and-white
  view that reveals a rotating set of hidden command words (`OBEY`, `CONSUME`, `SUBMIT`,
  `WATCH TV`, `MARRY AND REPRODUCE`, `STAY ASLEEP`, `NO INDEPENDENT THOUGHT`, `BUY`,
  `DO NOT QUESTION AUTHORITY`, `THIS IS YOUR GOD`, `CONFORM`, `SLEEP`, `WORK`, `BELIEVE`,
  `PAY YOUR TAXES`), styled as original short phrases rather than movie dialogue.
- **Reveal Another** shows a new random command; **Auto-Cycle** rotates them on a timer.
- A CRT scanline overlay, flicker animation, and a brief static "transition" flash play
  whenever the glasses go on/off or a new command appears.
- **Sound** toggle plays a short burst of synthesized static (generated in-browser via the
  Web Audio API — no audio files, nothing to license).
- A **counter** (persisted in `localStorage`) tracks how many commands you've revealed.
- **Share** uses the native share sheet where available, otherwise copies the link.
- Tapping/clicking the big command word five times quickly triggers an easter egg.
- A live **QR code** on the glasses screen always points at whatever URL the page is
  currently served from (via api.qrserver.com), so it works automatically once deployed.
- A **Learn more about They Live** link goes to the film's Wikipedia page.

## Files

The whole site is three files — no build step, no dependencies:

- `index.html`
- `style.css`
- `script.js`

## Running locally

Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploying to GitHub Pages

1. Push this repo to GitHub (already set up).
2. In the repo settings, enable **GitHub Pages** for the branch/folder containing these files
   (e.g. `main` branch, root).
3. Your site will be live at `https://<username>.github.io/<repo>/`.
4. The QR code on the page auto-generates from the live URL — no extra step needed.

## Custom domain

If you point a custom domain at GitHub Pages, add a `CNAME` file with the domain name at the
repo root and configure your DNS per [GitHub's Pages docs](https://docs.github.com/pages).

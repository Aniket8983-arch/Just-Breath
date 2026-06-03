# JustBreath

> A calm, minimal meditation and breathing exercise web app.  
> Built with **HTML · CSS · JavaScript** — no frameworks, no build tools.

---

## 🗂 Project Structure

```
JustBreath/
├── index.html          ← Main HTML page
├── style.css           ← All styles (dark theme, animations, responsive)
├── script.js           ← App logic (timer engine, sound controller, nav)
├── .gitignore
├── README.md
└── assets/
    ├── sounds/         ← Ambient audio files (.mp3 / .ogg)
    │   └── README.md
    └── images/         ← Icons, og-image, hero backgrounds
        └── README.md
```

---

## 🚀 Getting Started

1. **Clone / download** this repository.
2. Open `index.html` in any modern browser — no server needed.
3. (Optional) Add audio files to `assets/sounds/` — see that folder's README.

---

## 🌬 Features

| Feature                | Details                                       |
|------------------------|-----------------------------------------------|
| **Breathing Timer**    | Box · 4-7-8 · Diaphragmatic techniques        |
| **Animated Circle**    | Expands on inhale, contracts on exhale        |
| **Ambient Sounds**     | Rain · Ocean · Forest · Singing Bowl (layerable) |
| **Dark Glassmorphic UI** | Deep navy + purple/teal gradient palette   |
| **Fully Responsive**   | Mobile-first, works on any screen size        |
| **Zero Dependencies**  | Pure HTML, CSS, and vanilla JS                |

---

## 🎨 Design Tokens

All colours, spacing, and typography values live in CSS custom properties at the
top of `style.css` — easy to customise.

```css
--color-primary:  #6c63ff;   /* Purple */
--color-accent:   #48c9b0;   /* Teal   */
--color-bg:       #0b0c1a;   /* Near-black navy */
```

---

## 📦 Adding Sounds

Drop `.mp3` files into `assets/sounds/` matching these names:

```
rain.mp3  |  ocean.mp3  |  forest.mp3  |  bowl.mp3
```

Free sources: [Freesound.org](https://freesound.org) · [Pixabay](https://pixabay.com/sound-effects/)

---

## 🗺 Roadmap Ideas

- [ ] Session history & streak tracking (localStorage)
- [ ] Custom breathing pattern editor
- [ ] Background colour theme switcher
- [ ] PWA / offline support
- [ ] Binaural beats integration

---

## 📄 License

MIT — free to use and modify.

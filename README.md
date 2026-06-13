# TGP Portfolio

Taegeon Park personal portfolio — scroll-driven landing with motion-rich project previews.

## Deploy

- **Live**: https://ponezzo.github.io/portfolio/
- **Figma**: https://www.figma.com/design/izxX8YJ16HiW3JB4sQsClp

## Structure

- Lenis + GSAP ScrollTrigger scroll experience
- Landing → About → Projects → Skills → Footer
- `/works/` project grid subpage

## Page text (editable)

Edit **`content/page-text.txt`** — tab-indented sections (see file header), then:

```bash
npm run apply:text   # merge into content/home.json
npm run apply:home   # regenerate js/home-generated.js
```

Or `npm run apply:all` / `npm run deploy` to run everything.


## Deploy to GitHub Pages

```bash
npm run deploy
```

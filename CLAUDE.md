# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Static marketing site for erlendhaddeland.no. Ten top-level HTML pages, one shared `styles.css`, one shared `script.js`, plus a self-contained one-file web app under `demo/`. Norwegian-language content and code (class names, IDs, and JS identifiers are in Norwegian: `ramme`, `topp`, `knapp`, `skjema`, `faner`, etc.).

No package.json, no build step, no test suite, no linter. Netlify serves the folder as-is; pushing to `main` publishes.

## Husregler

Disse reglene gjelder alt arbeid i dette repoet, og går foran generelle vaner.

**Språk og tekst**
- Skriv på norsk. Det gjelder både innhold på nettsidene og svar i chatten.
- Ingen tankestreker. Bruk komma, punktum eller parentes i stedet.
- Ingen emojier, verken i tekst, kode eller commit-meldinger.
- Komma etter tiltale. «Hei Erlend,» og ikke «Hei Erlend».

**Design**
- Bruk fargevariablene i `styles.css` (`--natt`, `--lys`, `--brod`, `--dempet`, `--strek`, `--bla`, `--aksent`, `--dypbla`, `--kakao`). Aldri nye hexverdier. Trengs en farge som ikke finnes, legg den inn som ny variabel på `:root` først.
- Bricolage Grotesque er eneste font. Fallback-stakken `"Helvetica Neue",Arial,sans-serif` blir stående, men ingen andre fonter skal legges til.
- Skarpe hjørner. Ingen `border-radius` på bokser, kort, knapper, felt eller bilder. Unntaket er de sirklene som allerede finnes (`.prikk`, `.signatur img` og dekorsirkelen rundt linje 157), der `border-radius:50%` lager formen. Ikke legg til nye avrundinger.

**Struktur**
- Meny (`header.topp`) og bunn (`footer.bunn`) ligger i alle ti HTML-filene. Endres én, må alle endres: `index.html`, `tjenester.html`, `tilbud.html`, `prosjekter.html`, `om.html`, `kontakt.html`, `faq.html`, `filer.html`, `personvern.html`, `404.html`. Sjekk også `demo/tilbud-kakaobygg.html` når det er relevant.
- `404.html` er en kakaovits, ikke en vanlig side. Overskriften er «Kakao not found», og de to firetallene flankerer et bilde av Erlend som heller kakao, slik at bildet blir nullen. Tallene er `font-weight:200` med negativ margin, så de går litt bak bildet. Endrer du bildebredden, må marginene følge etter, ellers blir sifrene stående og flyte. `--kakao` er hentet som gjennomsnittsfarge fra kakaoen i bildet og lysnet til 5,85 i kontrast mot `--natt`.
- `404.html` er også unntaket i lenkestil. Netlify serverer den på hvilken som helst ukjent adresse, også `/noe/dypt/her`, så alle stier der er rotrelative (`/styles.css`, `/tjenester.html`, `/bilder/logo.png`). Bruker du `tjenester.html` uten skråstrek, peker lenken feil. De andre ni sidene bruker relative stier som før.
- Hver side har `<a class="hopp" href="#innhold">` rett etter `<body>`, og `<main id="innhold">`. Lenken ligger utenfor skjermen til den får tastaturfokus. Nye sider skal ha begge deler.
- Hver side skal ha én `h1`, egen `title`, egen `meta description` og `canonical`. Ingen sider deler tekst her.
- Spørsmål og svar ligger i `faq.html`, i `details` og `summary`. Trekkspillet er ren HTML og CSS, uten JavaScript, så nye spørsmål legges rett inn i markupen.

**Arbeidsflyt**
- Commit rett på `main`. Ikke opprett gren, og ikke lag PR, med mindre Erlend ber om det. Han er eneste bidragsyter, så en PR gir ingen review, bare et ekstra steg.
- Push publiserer. Netlify bygger fra `main`, så `git push` legger endringen ut på erlendhaddeland.no med en gang. Derfor: commit fritt, men push kun når Erlend sier fra.
- Trengs det en titt på endringen før den er offentlig, er PR-veien fortsatt riktig, fordi Netlify lager en deploy preview per PR. Det er unntaket, ikke standarden.
- Forhåndsvis alltid. Er endringen synlig på en side, skal den vises i nettleserpanelet før du melder fra at du er ferdig. Erlend skal se endringen, ikke bare lese om den. Gjelder også små tekstendringer.
- Slik startes forhåndsvisningen: `python3 -m http.server 8000` i bakgrunnen via Bash, så `navigate` til `http://localhost:8000/`. `preview_start` med `launch.json` virker ikke her, fordi serverprosessen ikke får lese `~/Documents` på macOS og svarer 404 på alt. Sett vindusbredden til 1280 før du tar bilder, ellers havner du i mobilvisningen.

## Working locally

Any static server works. From the repo root:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000/`. Opening the HTML files directly via `file://` works too, but the contact form (Formspree POST) and Google Fonts will behave more realistically over HTTP.

## Architecture

### Shared chrome is duplicated per page

The `<header class="topp">` nav and `<footer class="bunn">` block are copy-pasted into every top-level HTML file. Contact info (email, phone, org.nr.) appears in each footer. Any change to nav links, brand info, or footer content must be made in all ten pages (`index.html`, `tjenester.html`, `tilbud.html`, `prosjekter.html`, `om.html`, `kontakt.html`, `faq.html`, `filer.html`, `personvern.html`, `404.html`) and, where relevant, also in `demo/tilbud-kakaobygg.html`. The README calls this out as intentional.

### `script.js`: five unrelated behaviors, one IIFE

The whole file is a single IIFE that wires up five independent features by scanning for data-attributes, so every page loads it even if the page only uses one:

- `.meny-knapp` — mobilmenyen. Under 600 piksler er hovedmenyen skjult bak hamburgerknappen, som toggler klassen `apen` på `.topp`. Lukkes med knappen, med Escape og ved klikk på en lenke. Selve panelet ligger i `styles.css` under `@media (max-width:600px)`.
- `[data-faner]` — accessible tab widget (arrow-key navigation, `aria-selected`/`hidden` toggling). Used on the home page and the services page.
- `[data-skjema]` — the contact form. POSTs to Formspree (`https://formspree.io/f/xyeynkjn`). On network failure or non-OK response it falls back to a `mailto:` link that pre-fills subject and body. Includes a `_gotcha` honeypot field. The form exists on `index.html` and `kontakt.html` with different `id` prefixes but the same behavior.
- `.kort .flate[data-embed]` — click-to-embed video cards on the projects page (avoids loading iframes until user opts in).
- Scroll-innglidning. Siste blokk i IIFE-en samler opp innholdet i `main section > .ramme` og gir dem klassen `synlig` via en `IntersectionObserver`, med 80 ms forskyvning mellom naboer. Er rammen `.brod`, glir hele tekstblokken inn samlet, ellers glir hvert barn inn for seg, og `.rutenett` pakkes opp så hvert `.kort` teller som ett. Selve skjulingen ligger i `styles.css` bak `@media (scripting:enabled) and (prefers-reduced-motion:no-preference)`, slik at innholdet står synlig uten JavaScript. Legger du nye seksjoner inn på en side, blir de med automatisk, men innhold som ligger skjult i en fane eller blir tegnet på nytt med `innerHTML` må ikke havne i utvalget, ellers kan det bli stående usynlig.

### `demo/tilbud-kakaobygg.html` is the entire "tilbudssystem" product

One ~3000-line HTML file with inlined base64 fonts, CSS, and JS — no external dependencies at runtime beyond what the browser provides. This is the shippable artifact for the "PDF proposal builder" pitched on `tilbud.html`; each customer receives their own copy of this file with their logo/colors/templates baked in.

Key patterns to know before editing it:

- **PDF generation is `window.print()`.** All PDF styling lives in `@media print` blocks and page-break rules. There is no jsPDF/pdfmake — "Lag PDF" just prints with print CSS.
- **State persists by rewriting the HTML file itself.** The file contains a `var LAGRET = null;/*LAGRET_SLUTT*/` marker. "Save" reads the current HTML, regex-replaces that assignment with a serialized `LAGRET = {...}` payload, and offers the modified HTML as a download. Reopening the downloaded file restores state. Do not remove or reformat the `/*LAGRET_SLUTT*/` sentinel — the load/save regex depends on it.
- **Templates and senders are top-level constants.** `MALER` / `MAL_START` hold prosjekttype templates (nybygg, etc.), and `AVSENDERE` holds the sender profiles (logo, colors, contact info). New customers = new entries in `AVSENDERE` and a re-baked file.
- Excel/PDF import is user-driven via hidden `<input type="file">` elements; XLSX parsing is done inline in the file.

### CSS

Single stylesheet with CSS custom properties at `:root` (`--natt`, `--lys`, `--brod`, `--aksent`, `--mal` for max page width `1180px`, `--topph` for fixed-nav height). Layout containers use `.ramme` (centered max-width wrapper). Norwegian class names throughout — do not "translate" them to English when refactoring; the HTML across all ten pages depends on them.

### Deling, ikoner og headere

- **Delingsbildene er generert, ikke fotografert.** `bilder/deling.jpg` og `bilder/deling-tilbud.jpg` (begge 1200x630) er rendret fra HTML-maler med headless Chrome, i samme farger og font som nettsiden. Skal de endres, bygg malen på nytt og rendre på 2x før du skalerer ned, ellers blir teksten uskarp. Alle sider utenom `tilbud.html` bruker `deling.jpg`.
- Hver side har `og:site_name`, `og:image` med `og:image:width`, `og:image:height` og `og:image:alt`, samt `twitter:card` satt til `summary_large_image`. Facebook, LinkedIn, Slack og iMessage leser de samme taggene.
- Ikonene (`favicon.ico`, `apple-touch-icon.png`, `bilder/ikon-192.png`, `bilder/ikon-512.png`) er «EH» i `--lys` på `--natt`, rendret fra samme oppsett. `site.webmanifest` peker på de to største.
- `netlify.toml` setter sikkerhetsheadere på alt og en ukes cache på `/bilder/*`. Ingen CSP, fordi siden henter fra Google Fonts, Formspree, Facebook og Google Calendar, og en for stram regel ville brukket skjemaet eller videoene.
- `faq.html` har `FAQPage`-strukturerte data i `head`. Blokken er generert fra `details`-elementene på siden, så legger du til et spørsmål, må JSON-en oppdateres i samme slengen, ellers spriker de.

### Character encoding inconsistency

`tilbud.html` uses HTML entities for Norwegian characters (`&aring;`, `&oslash;`, `&aelig;`). All other pages use direct UTF-8 (`å`, `ø`, `æ`). Files declare `<meta charset="utf-8">` so both work, but if you're editing `tilbud.html` match the surrounding entity style; elsewhere, use UTF-8.

## Known drift

Ingen kjente avvik.

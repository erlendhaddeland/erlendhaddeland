# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Static marketing site for erlendhaddeland.no. Fifteen top-level HTML pages (ten faste, fem tjenestesider), plus any `artikkel-*.html` built from `innhold/`, one shared `styles.css`, one shared `script.js`, plus a self-contained one-file web app under `demo/`. Norwegian-language content and code (class names, IDs, and JS identifiers are in Norwegian: `ramme`, `topp`, `knapp`, `skjema`, `faner`, etc.).

No package.json, no test suite, no linter. Netlify serves the folder as-is; pushing to `main` publishes.

There is one optional build step, `bygg.py`, and Netlify never runs it. It turns the text files in `innhold/` into the five `tjeneste-*.html` pages, any `artikkel-*.html`, and the card blocks on `index.html` and `tjenester.html`. Run it by hand after editing `innhold/`, then commit the HTML it writes. The site works without Python; the generated HTML is what ships.

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
- Meny (`header.topp`) og bunn (`footer.bunn`) ligger i alle HTML-filene i rota. Endres én, må alle endres: `index.html`, `tjenester.html`, `tjeneste-tekst.html`, `tjeneste-video.html`, `tjeneste-linkedin.html`, `tjeneste-strategi.html`, `tjeneste-foredrag.html`, `artikkel-*.html`, `tilbud.html`, `prosjekter.html`, `om.html`, `kontakt.html`, `faq.html`, `filer.html`, `personvern.html`, `404.html`. Sjekk også `demo/tilbud-kakaobygg.html` når det er relevant.
- `404.html` er en kakaovits, ikke en vanlig side. Overskriften er «Kakao not found», og de to firetallene flankerer et bilde av Erlend som heller kakao, slik at bildet blir nullen. Tallene er `font-weight:200` med negativ margin, så de går litt bak bildet. Endrer du bildebredden, må marginene følge etter, ellers blir sifrene stående og flyte. `--kakao` er hentet som gjennomsnittsfarge fra kakaoen i bildet og lysnet til 5,85 i kontrast mot `--natt`.
- `404.html` er også unntaket i lenkestil. Netlify serverer den på hvilken som helst ukjent adresse, også `/noe/dypt/her`, så alle stier der er rotrelative (`/styles.css`, `/tjenester.html`, `/bilder/logo.png`). Bruker du `tjenester.html` uten skråstrek, peker lenken feil. Alle de andre sidene bruker relative stier som før.
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

The `<header class="topp">` nav and `<footer class="bunn">` block are copy-pasted into every top-level HTML file. Contact info (email, phone, org.nr.) appears in each footer. Any change to nav links, brand info, or footer content must be made in every page in the repo root (`index.html`, `tjenester.html`, the five `tjeneste-*.html` pages, every `artikkel-*.html`, `tilbud.html`, `prosjekter.html`, `om.html`, `kontakt.html`, `faq.html`, `filer.html`, `personvern.html`, `404.html`) and, where relevant, also in `demo/tilbud-kakaobygg.html`. The README calls this out as intentional.

### `script.js`: five unrelated behaviors, one IIFE

The whole file is a single IIFE that wires up five independent features by scanning for data-attributes, so every page loads it even if the page only uses one:

- `.meny-knapp` — mobilmenyen. Under 600 piksler er hovedmenyen skjult bak hamburgerknappen, som toggler klassen `apen` på `.topp`. Lukkes med knappen, med Escape og ved klikk på en lenke. Selve panelet ligger i `styles.css` under `@media (max-width:600px)`.
- `[data-faner]` — accessible tab widget (arrow-key navigation, `aria-selected`/`hidden` toggling). Used on the home page and the services page.
- `[data-skjema]` — the contact form. POSTs to Formspree (`https://formspree.io/f/xyeynkjn`). On network failure or non-OK response it falls back to a `mailto:` link that pre-fills subject and body. Includes a `_gotcha` honeypot field. The form exists on `index.html` and `kontakt.html` with different `id` prefixes but the same behavior.
- `.kort .flate[data-embed]` — click-to-embed video cards on the projects page (avoids loading iframes until user opts in).
- Scroll-innglidning. Siste blokk i IIFE-en samler opp innholdet i `main section > .ramme` og gir dem klassen `synlig` via en `IntersectionObserver`, med 80 ms forskyvning mellom naboer. Er rammen `.brod`, glir hele tekstblokken inn samlet, ellers glir hvert barn inn for seg, og `.rutenett` pakkes opp så hvert `.kort` teller som ett. Selve skjulingen ligger i `styles.css` bak `@media (scripting:enabled) and (prefers-reduced-motion:no-preference)`, slik at innholdet står synlig uten JavaScript. Legger du nye seksjoner inn på en side, blir de med automatisk, men innhold som ligger skjult i en fane eller blir tegnet på nytt med `innerHTML` må ikke havne i utvalget, ellers kan det bli stående usynlig.

### Tjenestefeltet, tjenestesidene og artiklene bygges fra `innhold/`

All tekst på de fem tjenestesidene, referansesitatene, artiklene og bindeleddene mellom dem ligger som markdown i `innhold/`. Erlend redigerer den mappen, ikke HTML-en. `python3 bygg.py` skriver resultatet.

```
innhold/tjenester.md      de fem tjenestene: navn, ingress, korttekst, bilde, brødtekst, punkter
innhold/referanser.md     sitatene, hentet inn per tjeneste med slug
innhold/sider.md          overskrifter og introer som binder sidene sammen
innhold/artikler/*.md     én fil per artikkel. Filer med understrek foran bygges ikke
```

- **Ikke rediger `tjeneste-*.html` eller `artikkel-*.html` direkte.** De overskrives ved neste bygg. Skal noe endres der, endres det i `innhold/`, eventuelt i malen i `bygg.py` hvis det er strukturen og ikke teksten.
- Kortene på `index.html` og `tjenester.html` skrives inn mellom `<!-- kort:start -->` og `<!-- kort:slutt -->`. Introen på forsiden ligger mellom `<!-- intro:start -->` og `<!-- intro:slutt -->`, og ingressen på oversikten mellom `<!-- ingress:start -->` og `<!-- ingress:slutt -->`. Fjerner du et merke, stopper bygget med `ValueError: substring not found`.
- Meny og bunn kopieres ordrett fra `kontakt.html` ved hvert bygg. Endrer du menyen der, får alle de bygde sidene den automatisk. Endrer du den et annet sted først, blir den overskrevet neste gang.
- `bygg.py` sletter `tjeneste-*.html` og `artikkel-*.html` som ikke lenger har en tekstfil, og holder `sitemap.xml` i takt. Legger du til en sjette tjeneste, holder det å legge inn en `## slug`-bolk i `innhold/tjenester.md`. `hasOfferCatalog` på forsiden må fortsatt oppdateres for hånd.
- `width` og `height` på bildene leses ut av selve filene, så de stemmer alltid. Er bildet høyere enn bredt, sett `Staaende: ja`, ellers klippes hodet i 16:10-utsnittet.
- Tomme felt faller bort i stedet for å rendre tomme elementer. Det er meningen: Erlend fyller inn ingressene selv, og siden skal se hel ut i mellomtiden.

### Tjenestefeltet på forsiden

Forsiden presenterer tjenestene som fem kort til høyre, med en intro som står stille til venstre mens kortene ruller forbi. Mønsteret er hentet fra brakk.no.

- **Kortene gjenbruker `.rutenett` og `.kort` med vilje.** Innglidningen i `script.js` pakker opp `.rutenett` og lar hvert `.kort` gli inn for seg. Bytter du til et eget klassenavn på lista, blir kortene stående usynlige, fordi CSS-en som skjuler dem bare slippes av `.synlig`.
- Introen er to nivåer: `.tjeneste-intro` er rutenettbarnet som glir inn, og `.tjeneste-fast` inni er den som er `position:sticky`. De må være to elementer. Legger du `sticky` rett på rutenettbarnet, mister det høyden å feste seg i, fordi grid-barn ikke strekkes når `align-items` ikke er `stretch`.
- Forsiden bruker `.tjenestespalte` (én spalte), `tjenester.html` bruker `.tjenesterutenett` (tre spalter). Samme markup ellers.

### `demo/tilbud-kakaobygg.html` is the entire "tilbudssystem" product

One ~3000-line HTML file with inlined base64 fonts, CSS, and JS — no external dependencies at runtime beyond what the browser provides. This is the shippable artifact for the "PDF proposal builder" pitched on `tilbud.html`; each customer receives their own copy of this file with their logo/colors/templates baked in.

Key patterns to know before editing it:

- **PDF generation is `window.print()`.** All PDF styling lives in `@media print` blocks and page-break rules. There is no jsPDF/pdfmake — "Lag PDF" just prints with print CSS.
- **State persists by rewriting the HTML file itself.** The file contains a `var LAGRET = null;/*LAGRET_SLUTT*/` marker. "Save" reads the current HTML, regex-replaces that assignment with a serialized `LAGRET = {...}` payload, and offers the modified HTML as a download. Reopening the downloaded file restores state. Do not remove or reformat the `/*LAGRET_SLUTT*/` sentinel — the load/save regex depends on it.
- **Templates and senders are top-level constants.** `MALER` / `MAL_START` hold prosjekttype templates (nybygg, etc.), and `AVSENDERE` holds the sender profiles (logo, colors, contact info). New customers = new entries in `AVSENDERE` and a re-baked file.
- Excel/PDF import is user-driven via hidden `<input type="file">` elements; XLSX parsing is done inline in the file.

### CSS

Single stylesheet with CSS custom properties at `:root` (`--natt`, `--lys`, `--brod`, `--aksent`, `--mal` for max page width `1180px`, `--topph` for fixed-nav height). Layout containers use `.ramme` (centered max-width wrapper). Norwegian class names throughout — do not "translate" them to English when refactoring; the HTML across every page depends on them.

### Logobåndet på forsiden

Fjorten oppdragsgiverlogoer ruller i et bånd rett under heroen på `index.html`. Filene ligger i `bilder/logoer/`.

- **Logoene er behandlet, ikke originaler.** Hver av dem er gjort om til en hvit silhuett med gjennomsiktig bunn, fordi originalene kommer i fjorten ulike farger, og flere har egen bakgrunnsflate (Nullvisjonen på svart, XL Bygg på beige, LH Drift på mørk boks). Alle får samme lerretshøyde, 96 piksler, altså 2x av de 48 i CSS. Da holder én høydeverdi i `styles.css` for hele båndet.
- Silhuetten lages på tre måter, avhengig av originalen. Ligger grafikken alt på gjennomsiktig bunn, brukes alfakanalen. Er den mørk på lys bunn, brukes omvendt lysstyrke. Er den lys på mørk bunn, brukes lysstyrken. LH Drift har gull og grått ved siden av hverandre, og der teller avstanden fra bunnfargen i stedet, ellers blir gullet stående grått. Metningspunktet finnes per logo, slik at en beige og en svart logo blir like hvite.
- Størrelsen er ikke lik høyde, men lik optisk vekt. En kvadratisk merkelogo som fyller hele høyden ser tyngre ut enn en bred ordlogo, så de kompakte trekkes ned med en faktor. Telenor Cyberdefence er bevisst gitt større vekt enn de andre.
- **Rekkefølgen er ikke tilfeldig.** Kantene toner ut med `mask-image`, så logoen som står først er halvveis usynlig ved sidelast. Derfor står en av de mindre viktige først, og Telenor på tredjeplass, godt innenfor.
- Rullingen er to identiske rader etter hverandre, der sporet skyves en halv bredde i en evig runde. Avstanden over skjøten må være lik `gap` ellers i raden, derfor har `.logorad` samme verdi i `gap` og `padding-right`. Endrer du den ene, må den andre følge etter, ellers hakker båndet én gang per runde.
- Ved `prefers-reduced-motion` stopper rullingen, masken slås av, duplikatraden skjules og logoene brekker over flere linjer, slik at alle fjorten fortsatt er synlige.
- **Logoene står alene, uten overskrift over seg.** Seksjonen holder derfor avstanden selv, gjennom `main > section.logo-seksjon` i `styles.css`. Selektoren er ikke tilfeldig lang. `main > section:first-child` lenger oppe i filen setter `padding-top:48px`, og en ren `.logo-seksjon` ville tapt mot den. Regelen vinner fordi den har samme spesifisitet og står sist. Flytter du den lenger opp, faller luften over båndet sammen.
- Nye logoer legges inn i begge radene i `index.html`. Duplikatraden har `aria-hidden="true"` og tom `alt`, så den ikke leses opp to ganger. `width` og `height` på hver `img` må stemme med filen, ellers hopper layouten når bildene lastes.

### Deling, ikoner og headere

- **Delingsbildene er generert, ikke fotografert.** `bilder/deling.jpg` og `bilder/deling-tilbud.jpg` (begge 1200x630) er rendret fra HTML-maler med headless Chrome, i samme farger og font som nettsiden. Skal de endres, bygg malen på nytt og rendre på 2x før du skalerer ned, ellers blir teksten uskarp. Alle sider utenom `tilbud.html` bruker `deling.jpg`.
- Hver side har `og:site_name`, `og:image` med `og:image:width`, `og:image:height` og `og:image:alt`, samt `twitter:card` satt til `summary_large_image`. Facebook, LinkedIn, Slack og iMessage leser de samme taggene.
- Ikonene (`favicon.ico`, `apple-touch-icon.png`, `bilder/ikon-192.png`, `bilder/ikon-512.png`) er «EH» i `--lys` på `--natt`, rendret fra samme oppsett. `site.webmanifest` peker på de to største.
- `netlify.toml` setter sikkerhetsheadere på alt og en ukes cache på `/bilder/*`. Ingen CSP, fordi siden henter fra Google Fonts, Formspree, Facebook og Google Calendar, og en for stram regel ville brukket skjemaet eller videoene.
- `faq.html` har `FAQPage`-strukturerte data i `head`. Blokken er generert fra `details`-elementene på siden, så legger du til et spørsmål, må JSON-en oppdateres i samme slengen, ellers spriker de.

### Character encoding inconsistency

`tilbud.html` uses HTML entities for Norwegian characters (`&aring;`, `&oslash;`, `&aelig;`). All other pages use direct UTF-8 (`å`, `ø`, `æ`). Files declare `<meta charset="utf-8">` so both work, but if you're editing `tilbud.html` match the surrounding entity style; elsewhere, use UTF-8.

## Known drift

- Faneverktøyet i `script.js` (`[data-faner]`) og `.faner`-stilene i `styles.css` er ikke i bruk lenger. Forsiden og `tjenester.html` viser tjenestene som kort i stedet. Koden er beholdt i tilfelle fanene skal brukes et annet sted, men den kan fjernes uten at noe på siden endrer seg.

# erlendhaddeland.no

Statisk nettside. Ingen byggesteg, ingen rammeverk. Netlify serverer mappen som den er.

## Filer

| Fil | Hva det er |
|---|---|
| `index.html` | Forsiden |
| `tjenester.html` | Oversikt over de fem tjenestene |
| `tjeneste-*.html` | Én side per tjeneste: tekst, video, linkedin, strategi, foredrag |
| `artikkel-*.html` | Artikler. Listes opp på `tjeneste-linkedin.html` |
| `tilbud.html` | Tilbudssystemet for byggebransjen |
| `prosjekter.html` | Prosjekter med tall |
| `om.html` | Om meg |
| `kontakt.html` | Kontakt og skjema |
| `styles.css` | All stil |
| `script.js` | Mobilmeny, faner, skjema, videoinnbygging, innglidning ved scroll |
| `bilder/` | Bildefiler |
| `demo/` | Demoen av tilbudssystemet |

## Endre noe

Menyen og bunnen ligger i hver enkelt HTML-fil. Endrer du kontaktinfo, må du gjøre det på alle sidene i rota.

Tjenestekortene finnes to steder, på forsiden og på `tjenester.html`. Endrer du en tekst der, må begge oppdateres.

Ny artikkel: kopier en `artikkel-*.html`, bytt tekst og dato, legg inn et kort i `.artikkelliste` på `tjeneste-linkedin.html`, og en linje i `sitemap.xml`.

## Publisering

Netlify er koblet til dette repoet. Push til `main` publiserer.

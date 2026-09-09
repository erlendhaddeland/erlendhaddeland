# erlendhaddeland.no

Statisk nettside. Ingen rammeverk. Netlify serverer mappen som den er.

## Filer

| Fil | Hva det er |
|---|---|
| `index.html` | Forsiden |
| `tjenester.html` | Oversikt over de fem tjenestene |
| `tjeneste-*.html` | Én side per tjeneste: tekst, video, linkedin, strategi, foredrag |
| `artikkel-*.html` | Artikler. Listes opp på `tjeneste-linkedin.html` |
| `innhold/` | All tekst på tjenestesidene og artiklene, som markdown |
| `bygg.py` | Lager tjenestesidene og artiklene ut fra `innhold/` |
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

Teksten på tjenestesidene ligger i `innhold/`, ikke i HTML-filene. Rediger `innhold/tjenester.md`, `innhold/referanser.md` eller `innhold/sider.md`, og kjør:

```
python3 bygg.py
```

Da skrives `tjeneste-*.html`, kortene på forsiden og på `tjenester.html`, og `sitemap.xml` på nytt. `tjeneste-*.html` og `artikkel-*.html` skal ikke redigeres for hånd, de overskrives.

Ny artikkel: kopier `innhold/artikler/_mal.md` til for eksempel `innhold/artikler/min-artikkel.md`, skriv teksten, og kjør `python3 bygg.py`. Da lages `artikkel-min-artikkel.html`, den legger seg i listen på `tjeneste-linkedin.html`, og i `sitemap.xml`. Sletter du md-filen, forsvinner siden igjen.

## Publisering

Netlify er koblet til dette repoet. Push til `main` publiserer.

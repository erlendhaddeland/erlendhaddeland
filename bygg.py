# -*- coding: utf-8 -*-
"""Bygger tjenestesidene og artiklene ut fra tekstfilene i innhold/.

    python3 bygg.py

Meny og bunn hentes ordrett fra kontakt.html, slik at de fem tjenestesidene
og artiklene aldri kommer ut av takt med resten av nettstedet. Kortene skrives
inn mellom merkene <!-- kort:start --> og <!-- kort:slutt --> i index.html og
tjenester.html, så korttekstene bare finnes ett sted.

Skriptet kjores for hand nar innhold/ er endret. Netlify kjorer det ikke,
og nettsiden trenger det ikke. Resultatet er vanlige HTML-filer.
"""

import io
import os
import re
import glob

ROT = os.path.dirname(os.path.abspath(__file__))
BASE = 'https://erlendhaddeland.no/'
MAL = 'kontakt.html'


# ---------------------------------------------------------------- lesing

def les(sti):
    with io.open(os.path.join(ROT, sti), encoding='utf-8') as f:
        return f.read()


def skriv(sti, tekst):
    with io.open(os.path.join(ROT, sti), 'w', encoding='utf-8') as f:
        f.write(tekst)


def bolker(tekst):
    """Deler en innholdsfil i {slug: {felt: verdi, '#seksjon': [linjer]}}.

    Alt for den forste '## ' er innledning til Erlend, og hoppes over."""
    ut = {}
    slug = None
    seksjon = None
    for linje in tekst.split('\n'):
        if linje.startswith('## '):
            slug = linje[3:].strip()
            ut[slug] = {'_rekke': len(ut)}
            seksjon = None
            continue
        if slug is None:
            continue
        if linje.startswith('### '):
            seksjon = linje[4:].strip().lower()
            ut[slug]['#' + seksjon] = []
            continue
        if seksjon is not None:
            if linje.strip() != '---':   # skillelinjen mellom bolker er ikke innhold
                ut[slug]['#' + seksjon].append(linje)
            continue
        m = re.match(r'^([A-Za-zÆØÅæøå][A-Za-zÆØÅæøå \-]*):\s*(.*)$', linje)
        if m:
            ut[slug][m.group(1).strip().lower()] = lenker(m.group(2).strip())
    return ut


def avsnitt(linjer):
    """Grupperer linjer i avsnitt, punktlister, mellomtitler og sitater."""
    blokker = []
    buffer = []

    def tom():
        if buffer:
            blokker.append(('p', lenker(' '.join(buffer))))
            del buffer[:]

    for linje in linjer:
        s = linje.strip()
        if s in ('', '---'):
            tom()
        elif s.startswith('## '):
            tom()
            blokker.append(('h2', s[3:].strip()))
        elif s.startswith('> '):
            tom()
            blokker.append(('sitat', s[2:].strip()))
        elif s.startswith('- '):
            if blokker and blokker[-1][0] == 'ul' and not buffer:
                blokker[-1][1].append(s[2:].strip())
            else:
                tom()
                blokker.append(('ul', [s[2:].strip()]))
        else:
            buffer.append(s)
    tom()
    return blokker


def lenker(tekst):
    """[tekst](adresse) blir en lenke. Peker den ut av huset, apnes den i ny fane."""
    def bytt(m):
        ord_, adr = m.group(1), m.group(2)
        ut = u' target="_blank" rel="noopener"' if adr.startswith('http') else u''
        return u'<a href="%s"%s>%s</a>' % (adr, ut, ord_)
    return re.sub(r'\[([^\]]+)\]\(([^)\s]+)\)', bytt, tekst)


def punktliste(linjer):
    return [l.strip()[2:].strip() for l in linjer if l.strip().startswith('- ')]


# ------------------------------------------------------------- byggeklosser

def kappe():
    """Meny og bunn, hentet ordrett fra malsiden."""
    s = les(MAL)
    topp = s[s.index('<div class="topp">'):s.index('<header class="ramme sidetopp">')]
    topp = topp.replace(' aria-current="page"', '')
    topp = topp.replace('<a href="tjenester.html">', '<a href="tjenester.html" aria-current="page">')
    bunn = s[s.index('<footer class="bunn">'):s.index('</html>') + len('</html>')]
    return topp, bunn


def hode(fil, tittel, beskrivelse, json_blokker):
    return u'''<!DOCTYPE html>
<html lang="nb">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>%(tittel)s | Erlend Haddeland</title>
<meta name="description" content="%(besk)s">
<meta name="author" content="Erlend Haddeland">
<link rel="canonical" href="%(base)s%(fil)s">
<meta property="og:site_name" content="Erlend Haddeland">
<meta property="og:type" content="website">
<meta property="og:title" content="%(tittel)s | Erlend Haddeland">
<meta property="og:description" content="%(besk)s">
<meta property="og:url" content="%(base)s%(fil)s">
<meta property="og:image" content="%(base)sbilder/deling.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Erlend Haddeland, med teksten Menneskelig markedsføring">
<meta property="og:locale" content="nb_NO">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#14163a">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200;12..96,400;12..96,500;12..96,600;12..96,800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
%(json)s
</head>
<body>
<a class="hopp" href="#innhold">Hopp til innhold</a>
''' % dict(tittel=tittel, besk=beskrivelse, fil=fil, base=BASE, json=json_blokker)


def brodsmuler(ledd):
    rader = []
    for i, (navn, adr) in enumerate(ledd, 1):
        rader.append(u'    {"@type": "ListItem", "position": %d, "name": "%s", "item": "%s%s"}'
                     % (i, navn, BASE, adr))
    return (u'<script type="application/ld+json">\n{\n'
            u'  "@context": "https://schema.org",\n'
            u'  "@type": "BreadcrumbList",\n'
            u'  "itemListElement": [\n%s\n  ]\n}\n</script>' % u',\n'.join(rader))


def maal(bilder):
    """Bredde og hoyde slik filene faktisk er, sa layouten ikke hopper."""
    import struct
    b = os.path.join(ROT, bilder)
    with open(b, 'rb') as f:
        data = f.read()
    if data[:2] == b'\xff\xd8':
        i = 2
        while i < len(data):
            if data[i] != 0xFF:
                i += 1
                continue
            m = data[i + 1]
            if m in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
                h, w = struct.unpack('>HH', data[i + 5:i + 9])
                return w, h
            if m in (0xD8, 0x01) or 0xD0 <= m <= 0xD7:
                i += 2
                continue
            i += 2 + struct.unpack('>H', data[i + 2:i + 4])[0]
    if data[:8] == b'\x89PNG\r\n\x1a\n':
        w, h = struct.unpack('>II', data[16:24])
        return w, h
    raise ValueError('fant ikke malene i ' + bilder)


PIL = (u'<span class="kortpil" aria-hidden="true">'
       u'<svg viewBox="0 0 24 24" focusable="false"><path d="M7 17 17 7M8.5 7H17v8.5"/></svg></span>')


def kort(tjenester, rutenettklasse):
    ut = [u'      <div class="rutenett %s">' % rutenettklasse]
    for t in tjenester:
        w, h = maal(t['bilde'])
        ut.append(u'        <a class="kort tjenestekort" href="%s">' % t['fil'])
        ut.append(u'          <div class="tjenestebilde">')
        ut.append(u'            <img%s src="%s" alt="%s" width="%d" height="%d" loading="lazy" decoding="async">'
                  % (u' class="staaende"' if t.get('staaende') == 'ja' else u'',
                     t['bilde'], t['bildetekst'], w, h))
        ut.append(u'            ' + PIL)
        ut.append(u'          </div>')
        ut.append(u'          <div class="kort-tekst">')
        ut.append(u'            <h3>%s</h3>' % t['navn'])
        ut.append(u'            <p>%s</p>' % t['korttekst'])
        ut.append(u'          </div>')
        ut.append(u'        </a>')
    ut.append(u'      </div>')
    return u'\n'.join(ut) + u'\n'


def referanseseksjon(slugger, ref):
    if not slugger:
        return u''
    valgt = [ref[s] for s in slugger if s in ref]
    if not valgt:
        return u''

    if len(valgt) == 1 and valgt[0].get('type') == 'sitat':
        r = valgt[0]
        tekst = u' '.join(l.strip() for l in r['#tekst'] if l.strip())
        return u'''  <section>
    <div class="ramme">
      <h2 class="skjult">Referanse</h2>
      <figure class="sitat-blokk">
        <blockquote class="sitat">%s</blockquote>
        <figcaption class="kilde">%s, %s</figcaption>
      </figure>
    </div>
  </section>
''' % (tekst, r['navn'], r['rolle'])

    kortene = []
    for r in valgt:
        w, h = maal(r['bilde'])
        kropp = []
        for slag, verdi in avsnitt(r['#tekst']):
            if slag == 'ul':
                kropp.append(u'            <ul>\n%s            </ul>'
                             % u''.join(u'              <li>%s</li>\n' % p for p in verdi))
            else:
                kropp.append(u'            <p>%s</p>' % verdi)
        kortene.append(u'''        <figure class="kort referanse">
          <img src="%s" alt="%s" loading="lazy" width="%d" height="%d">
          <blockquote>
%s
          </blockquote>
          <figcaption class="kilde">%s, %s</figcaption>
        </figure>
''' % (r['bilde'], r['navn'], w, h, u'\n'.join(kropp), r['navn'], r['rolle']))

    return u'''  <section>
    <div class="ramme">
      <h2 class="stor">Det folk sier etterpå.</h2>
      <div class="rutenett rutenett-to">
%s      </div>
    </div>
  </section>
''' % u''.join(kortene)


def forsideintro(sider):
    d = sider['forside']
    ut = [u'      <div class="tjeneste-intro">', u'        <div class="tjeneste-fast">']
    if d.get('merkelapp'):
        ut.append(u'          <p class="merkelapp">%s</p>' % d['merkelapp'])
    if d.get('overskrift'):
        ut.append(u'          <h2 class="stor">%s</h2>' % d['overskrift'])
    if d.get('ingress'):
        ut.append(u'          <p class="tjeneste-ingress">%s</p>' % d['ingress'])
    if d.get('knapp'):
        ut.append(u'          <div class="knapper"><a class="knapp" href="%s">%s</a></div>'
                  % (d.get('knapplenke', 'kontakt.html'), d['knapp']))
    if d.get('videre'):
        ut.append(u'          <a class="videre" href="%s">%s</a>'
                  % (d.get('viderelenke', 'prosjekter.html'), d['videre']))
    ut += [u'        </div>', u'      </div>']
    return u'\n'.join(ut) + u'\n'


def andre_tjenester(alle, denne, sider):
    rader = []
    for t in alle:
        if t['fil'] == denne:
            continue
        rader.append(u'''        <a class="kontakt-linje" href="%s">
          <span class="kontakt-merk">%s</span>
          <span class="kontakt-verdi">%s</span>
          <span class="kontakt-pil" aria-hidden="true">&#8594;</span>
        </a>''' % (t['fil'], t['merkelapp'], t['navn']))
    return u'''  <section>
    <div class="ramme">
      <h2 class="stor">%s</h2>
      <div class="kontakt-linjer">
%s
      </div>
    </div>
  </section>
''' % (sider['andre'].get('overskrift', u'De andre tjenestene.'), u'\n'.join(rader))


AVSLUTNING = u'''  <section class="med-pil">
    <div class="ramme brod">
      <p class="stor">Usikker på hvor du skal begynne? Det er som regel der jeg begynner også.</p>
      <p>Ring, eller send en e-post med to setninger om hva dere driver med. Så sier jeg ærlig hva jeg tror er verdt pengene, og hva som ikke er det.</p>
      <div class="knapper"><a class="knapp" href="kontakt.html">Ta en prat</a></div>
      <span class="pil pil-tjenester" aria-hidden="true"></span>
    </div>
  </section>
'''


def artikkelliste(artikler, sider):
    if not artikler:
        return u''
    rader = []
    for a in artikler:
        rader.append(u'''        <a class="artikkelkort" href="%s">
          <span class="artikkeldato">%s</span>
          <h3>%s</h3>
          <p>%s</p>
        </a>''' % (a['fil'], a['datotekst'], a['tittel'], a['ingress']))
    d = sider['artikler']
    topptekst = u''
    if d.get('merkelapp'):
        topptekst += u'      <p class="merkelapp">%s</p>\n' % d['merkelapp']
    if d.get('overskrift'):
        topptekst += u'      <h2 class="stor">%s</h2>\n' % d['overskrift']
    if d.get('ingress'):
        topptekst += u'      <p class="tjeneste-ingress">%s</p>\n' % d['ingress']
    return u'''  <section id="artikler">
    <div class="ramme">
%s      <div class="artikkelliste">
%s
      </div>
    </div>
  </section>
''' % (topptekst, u'\n'.join(rader))


# ------------------------------------------------------------------ sider

def bannerklasse(t):
    k = []
    if t.get('staaende') == 'ja':
        k.append('staaende')
    if t.get('bannerutsnitt') == 'helt':
        k.append('helt')
    return u' class="%s"' % u' '.join(k) if k else u''


def bygg_tjeneste(t, alle, ref, artikler, sider, topp, bunn):
    js = brodsmuler([(u'Forsiden', u''), (u'Tjenester', u'tjenester.html'),
                     (t['navn'], t['fil'])])
    js += u'''
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "%(n)s",
  "description": "%(d)s",
  "url": "%(b)s%(f)s",
  "serviceType": "%(n)s",
  "areaServed": [{"@type": "AdministrativeArea", "name": "Agder"}, {"@type": "Country", "name": "Norge"}],
  "provider": {"@type": "ProfessionalService", "@id": "%(b)s#virksomhet", "name": "Erlend Haddeland"}
}
</script>''' % dict(n=t['navn'], d=t['ingress'], b=BASE, f=t['fil'])

    w, h = maal(t['bilde'])
    ut = hode(t['fil'], t['navn'], t['ingress'], js) + topp
    ut += u'''<header class="ramme sidetopp">
  <p class="merkelapp">Tjeneste</p>
  <h1>%(navn)s</h1>
  <p class="tagline">%(ingress)s</p>
</header>
<main id="innhold">
  <section class="uten-strek">
    <div class="ramme">
      <figure class="tjenestebanner">
        <img%(kl)s src="%(bilde)s" alt="%(alt)s" width="%(w)d" height="%(h)d" fetchpriority="high" decoding="async">
%(kreditt)s      </figure>
    </div>
  </section>
''' % dict(navn=t['navn'], ingress=t['ingress'], bilde=t['bilde'], alt=t['bildetekst'],
           w=w, h=h, kl=bannerklasse(t),
           kreditt=(u'        <figcaption>%s</figcaption>\n' % t['bildekreditt']
                    if t.get('bildekreditt') else u''))

    brod = [v for slag, v in avsnitt(t.get('#brødtekst', t.get('#brodtekst', []))) if slag == 'p']
    if brod:
        ut += u'''  <section>
    <div class="ramme brod">
%s    </div>
  </section>
''' % u''.join(u'      <p>%s</p>\n' % p for p in brod)

    pkt = punktliste(t.get('#punkter', []))
    if pkt:
        ut += u'''  <section>
    <div class="ramme">
      <h2 class="skjult">Det kan være</h2>
      <ul class="punkter">
%s      </ul>
    </div>
  </section>
''' % u''.join(u'        <li>%s</li>\n' % p for p in pkt)

    ut += referanseseksjon(punktliste(t.get('#referanser', [])), ref)
    if t.get('artikler') == 'ja':
        ut += artikkelliste(artikler, sider)
    ut += andre_tjenester(alle, t['fil'], sider)
    ut += AVSLUTNING
    ut += u'</main>\n' + bunn + u'\n'
    skriv(t['fil'], ut)
    return t['fil']


def artikkelbunn(sider):
    d = sider['artikkelbunn']
    if not d.get('overskrift'):
        return u''
    linjer = [u'  <section class="med-pil">', u'    <div class="ramme brod">',
              u'      <p class="stor">%s</p>' % d['overskrift']]
    if d.get('tekst'):
        linjer.append(u'      <p><a href="tjeneste-linkedin.html">%s</a></p>' % d['tekst'])
    if d.get('knapp'):
        linjer.append(u'      <div class="knapper"><a class="knapp" href="%s">%s</a></div>'
                      % (d.get('knapplenke', 'kontakt.html'), d['knapp']))
    linjer += [u'      <span class="pil pil-tjenester" aria-hidden="true"></span>',
               u'    </div>', u'  </section>']
    return u'\n'.join(linjer) + u'\n'


def bygg_artikkel(a, sider, topp, bunn):
    js = u'''<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "%(t)s",
  "description": "%(d)s",
  "datePublished": "%(iso)s",
  "dateModified": "%(iso)s",
  "mainEntityOfPage": {"@type": "WebPage", "@id": "%(b)s%(f)s"},
  "image": "%(b)sbilder/deling.jpg",
  "author": {"@type": "Person", "@id": "%(b)som.html#erlend", "name": "Erlend Haddeland"},
  "publisher": {"@type": "ProfessionalService", "@id": "%(b)s#virksomhet", "name": "Erlend Haddeland"}
}
</script>
''' % dict(t=a['tittel'], d=a['beskrivelse'], iso=a['dato'], b=BASE, f=a['fil'])
    js += brodsmuler([(u'Forsiden', u''),
                      (u'LinkedIn for ledere og ansatte', u'tjeneste-linkedin.html'),
                      (a['tittel'], a['fil'])])

    kropp = []
    for slag, verdi in avsnitt(a['#brødtekst']):
        if slag == 'h2':
            kropp.append(u'      <h2>%s</h2>' % verdi)
        elif slag == 'ul':
            kropp.append(u'      <ul>\n%s      </ul>'
                         % u''.join(u'        <li>%s</li>\n' % p for p in verdi))
        elif slag == 'sitat':
            kropp.append(u'      <blockquote>\n        <p>%s</p>\n      </blockquote>' % verdi)
        else:
            kropp.append(u'      <p>%s</p>' % verdi)

    ut = hode(a['fil'], a['tittel'], a['beskrivelse'], js) + topp
    ut += u'''<header class="ramme artikkeltopp">
  <p class="merkelapp">Artikkel</p>
  <h1>%(t)s</h1>
  <p class="tagline">%(i)s</p>
  <p class="artikkelmeta">%(dt)s &middot; Erlend Haddeland</p>
</header>
<main id="innhold">
  <section class="uten-strek">
    <div class="ramme brod artikkel">
%(k)s
    </div>
  </section>
%(bunntekst)s</main>
''' % dict(t=a['tittel'], i=a['ingress'], dt=a['datotekst'], k=u'\n'.join(kropp),
           bunntekst=artikkelbunn(sider))
    ut += bunn + u'\n'
    skriv(a['fil'], ut)
    return a['fil']


def sett_inn(fil, merke, blokk):
    """Bytter ut alt mellom <!-- merke:start --> og <!-- merke:slutt -->."""
    s = les(fil)
    start = '<!-- %s:start -->' % merke
    slutt = '<!-- %s:slutt -->' % merke
    i = s.index(start) + len(start)
    j = s.index(slutt)
    skriv(fil, s[:i] + '\n' + blokk + '      ' + s[j:])


def sitemap(tjenester, artikler):
    s = les('sitemap.xml')
    linjer = [l for l in s.split('\n')
              if 'tjeneste-' not in l and 'artikkel-' not in l]
    nye = []
    for t in tjenester:
        nye.append('  <url><loc>%s%s</loc><lastmod>2026-09-09</lastmod><priority>0.8</priority></url>'
                   % (BASE, t['fil']))
    for a in artikler:
        nye.append('  <url><loc>%s%s</loc><lastmod>%s</lastmod><priority>0.6</priority></url>'
                   % (BASE, a['fil'], a['dato']))
    for n, l in enumerate(linjer):
        if 'prosjekter.html' in l:
            linjer[n:n] = nye
            break
    skriv('sitemap.xml', '\n'.join(linjer))


# ------------------------------------------------------------------- kjor

def main():
    topp, bunn = kappe()

    raa = bolker(les('innhold/tjenester.md'))
    tjenester = sorted(raa.values(), key=lambda t: t['_rekke'])
    ref = bolker(les('innhold/referanser.md'))
    sider = bolker(les('innhold/sider.md'))

    artikler = []
    for sti in sorted(glob.glob(os.path.join(ROT, 'innhold', 'artikler', '*.md'))):
        navn = os.path.basename(sti)[:-3]
        if navn.startswith('_'):
            continue
        a = bolker('## ' + navn + '\n' + les(os.path.join('innhold', 'artikler', navn + '.md')))[navn]
        a['fil'] = 'artikkel-%s.html' % navn
        artikler.append(a)
    artikler.sort(key=lambda a: a['dato'], reverse=True)

    # Gamle sider som ikke lenger har en tekstfil, skal bort.
    beholdes = set(t['fil'] for t in tjenester) | set(a['fil'] for a in artikler)
    for gammel in glob.glob(os.path.join(ROT, 'tjeneste-*.html')) + \
            glob.glob(os.path.join(ROT, 'artikkel-*.html')):
        if os.path.basename(gammel) not in beholdes:
            os.remove(gammel)
            print('slettet ' + os.path.basename(gammel))

    for t in tjenester:
        print('skrev ' + bygg_tjeneste(t, tjenester, ref, artikler, sider, topp, bunn))
    for a in artikler:
        print('skrev ' + bygg_artikkel(a, sider, topp, bunn))

    sett_inn('index.html', 'intro', forsideintro(sider))
    sett_inn('index.html', 'kort', kort(tjenester, 'tjenestespalte'))
    ing = sider['oversikt'].get('ingress')
    sett_inn('tjenester.html', 'ingress',
             u'      <p class="tjeneste-ingress">%s</p>\n' % ing if ing else u'')
    sett_inn('tjenester.html', 'kort', kort(tjenester, 'tjenesterutenett'))
    print('oppdaterte forsiden og tjenester.html')

    sitemap(tjenester, artikler)
    print('oppdaterte sitemap.xml')


if __name__ == '__main__':
    main()

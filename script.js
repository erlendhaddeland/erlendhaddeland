(function(){

  var testSpm = [
    {
      sp: "Hvor ofte poster dere på Facebook eller Instagram?",
      valg: [
        {t:"Ukentlig", p:0},
        {t:"Én gang i måneden", p:1},
        {t:"Lenger siden enn det", p:2},
        {t:"Jeg måtte sjekket", p:3}
      ]
    },
    {
      sp: "Hvem jobber med markedsføring hos dere?",
      valg: [
        {t:"Vi har en egen markedsfører", p:0},
        {t:"En ansatt gjør det ved siden av alt annet", p:1},
        {t:"Daglig leder, når han rekker det", p:2},
        {t:"Ingen", p:3}
      ]
    },
    {
      sp: "En kunde som ikke kjenner dere googler bedriften. Hva finner han?",
      valg: [
        {t:"Oppdatert nettside, Google Min Bedrift med korrekt info, og nye bilder", p:0},
        {t:"En nettside som ikke er oppdatert", p:1},
        {t:"Litt gammelt, litt tilfeldig", p:2},
        {t:"Vet ikke", p:3}
      ]
    },
    {
      sp: "Hva er det som stopper dere fra å være synlige?",
      valg: [
        {t:"Tiden. Ikke nok timer i døgnet.", n:"tid"},
        {t:"Vi vet ikke hva vi skal si", n:"tema"},
        {t:"Vi har prøvd, og fikk lite igjen", n:"effekt"},
        {t:"Folkene våre vil ikke stå frem.", n:"folk"}
      ]
    },
    {
      sp: "Hva ville vært verdt mest om ett år?",
      valg: [
        {t:"At flere kjenner oss når vi tar kontakt", m:"at folk kjenner dere før dere ringer"},
        {t:"At det er lettere å få tak i folk å ansette", m:"at flinke folk vet hvem dere er"},
        {t:"At vi slipper å konkurrere bare på pris", m:"at dere slipper å bli målt bare på pris"},
        {t:"At kundene skjønner hva vi faktisk gjør", m:"at kundene skjønner hva dere faktisk gjør"}
      ]
    }
  ];

  var testRaad = {
    tid: [
      "Da er det ikke motivasjon dere mangler, det er en som gjør jobben. Jeg ville begynt med film og innhold som jeg produserer for dere, ikke med en plan dere skal utføre selv."
    ],
    tema: [
      "Det er den vanligste grunnen til at bunnsolide bedrifter er stille. Historiene finnes, de ligger bare i hodet på noen som ikke tenker på dem som historier.",
      "Her henter jeg frem triks fra min erfaring som journalist og redaktør. Jeg ville begynt med en halvdag der vi henter ut historier, setter dem i system, og forteller dem til riktig publikum."
    ],
    effekt: [
      "Da har dere som regel produsert innhold uten en tydelig mottaker. Det koster like mye som å gjøre det riktig. Hvert innlegg bør løse ett konkret problem: flere følgere, nye kunder, mer engasjement.",
      "Jeg ville begynt med strategi, og deretter testet det på ekte publikum før vi bygger mer."
    ],
    folk: [
      "Gjett om jeg kjenner til denne problemstillingen. Etter å ha jobbet med rørleggere, snekkere og betongarbeidere har jeg vært gjennom det aller meste, men som regel løser det seg.",
      "Min erfaring er at de riktige menneskene finnes i bedriften din, de trenger bare et vennlig lite dytt. Det har jeg gjort i mer enn ti år, og jeg føler meg trygg på at jeg får det til hos dere også."
    ]
  };

  var testNivaa = [
    {
      grense: 2,
      fig: '<svg class="test-fig" viewBox="0 0 120 120" aria-hidden="true"><circle class="p" cx="26" cy="94" r="9"/><path class="b" d="M26 62a32 32 0 0 1 32 32"/><path class="b" d="M26 34a60 60 0 0 1 60 60"/><path class="b" d="M26 8a86 86 0 0 1 86 86"/></svg>',
      tittel: "Smooth! Dere er godt i gang.",
      tekst: ["Bra jobba. Dere gjør allerede mer enn de fleste i bransjen deres. Da handler det ikke om å produsere mer, men om å bli tydeligere på hva dere skal være kjent for. Posisjonering der, altså."]
    },
    {
      grense: 5,
      fig: '<svg class="test-fig" viewBox="0 0 120 120" aria-hidden="true"><circle class="p" cx="26" cy="94" r="9"/><path class="b" d="M26 62a32 32 0 0 1 32 32"/><path class="b" d="M26 34a60 60 0 0 1 60 60" stroke-dasharray="9 12"/><path class="s" d="M26 8a86 86 0 0 1 86 86" stroke-dasharray="5 15"/></svg>',
      tittel: "Dere gjør litt, men mer å gå på.",
      tekst: [
        "Det legges ut noe innimellom, og så går det tre uker. Kjent problem for 87 % av alle norske bedrifter (det tallet fant jeg nettopp på, men du skjønner poenget).",
        "Effekten av innhold kommer av at det henger sammen over tid, ikke av at hvert enkelt innlegg er bra."
      ]
    },
    {
      grense: 9,
      fig: '<svg class="test-fig" viewBox="0 0 120 120" aria-hidden="true"><circle class="p" cx="26" cy="94" r="9"/><path class="s" d="M26 62a32 32 0 0 1 32 32"/><path class="s" d="M26 34a60 60 0 0 1 60 60" stroke-dasharray="6 13"/><path class="s" d="M26 8a86 86 0 0 1 86 86" stroke-dasharray="4 16"/></svg>',
      tittel: "Kjempepotensial.",
      tekst: ["Det trenger ikke bety at det går dårlig med sjappa di. Det betyr at dere lever på gamle relasjoner og på at noen anbefaler dere videre. Målrettet innsats på markedsføring kan legge seg rett på bunnlinja."]
    }
  ];

  document.querySelectorAll("[data-test]").forEach(function(boks){
    var steg = 0, svar = [], valgt = null;

    function tegnSpm(){
      var q = testSpm[steg];
      var h = '<div class="test-venstre">'
            + '<p class="test-teller">Spørsmål ' + (steg+1) + ' av ' + testSpm.length + '</p>'
            + '<p class="test-sp">' + q.sp + '</p>'
            + '<p class="test-hjelp">Velg ett svar</p>'
            + '<div class="test-strek"><span style="width:' + (steg/testSpm.length*100) + '%"></span></div>'
            + '</div><div class="test-hoyre"><div class="test-valg" role="radiogroup">';
      q.valg.forEach(function(v, i){
        var av = valgt === i;
        h += '<button type="button" role="radio" aria-checked="' + (av ? "true" : "false") + '" data-i="' + i + '">'
           + '<span class="prikk" aria-hidden="true"></span><span>' + v.t + '</span></button>';
      });
      h += '</div><div class="test-nav">';
      if(steg > 0){ h += '<button type="button" class="test-tilbake">Tilbake</button>'; }
      h += '<button type="button" class="knapp" data-neste' + (valgt === null ? " disabled" : "") + '>'
         + (steg === testSpm.length - 1 ? "Se svaret" : "Neste") + '</button>';
      h += '</div></div>';
      boks.innerHTML = h;

      boks.querySelectorAll(".test-valg button").forEach(function(b){
        b.addEventListener("click", function(){
          valgt = +b.dataset.i;
          boks.querySelectorAll(".test-valg button").forEach(function(x){
            x.setAttribute("aria-checked", x === b ? "true" : "false");
          });
          boks.querySelector("[data-neste]").disabled = false;
        });
      });
      boks.querySelector("[data-neste]").addEventListener("click", function(){
        if(valgt === null){ return; }
        svar[steg] = testSpm[steg].valg[valgt];
        steg++;
        valgt = null;
        if(steg < testSpm.length){ tegnSpm(); } else { tegnSvar(); }
      });
      var tb = boks.querySelector(".test-tilbake");
      if(tb){
        tb.addEventListener("click", function(){
          steg--;
          valgt = testSpm[steg].valg.indexOf(svar[steg]);
          if(valgt < 0){ valgt = null; }
          tegnSpm();
        });
      }
    }

    function tegnSvar(){
      var sum = 0;
      for(var i = 0; i < 3; i++){ sum += svar[i].p; }
      var niv = testNivaa.filter(function(n){ return sum <= n.grense; })[0];
      var raad = testRaad[svar[3].n];
      var maal = svar[4].m;

      var h = '<div class="test-venstre">'
            + niv.fig
            + '<p class="test-teller">Svaret ditt</p>'
            + '<h3>' + niv.tittel + '</h3>'
            + '<div class="test-strek"><span style="width:100%"></span></div>'
            + '</div><div class="test-hoyre"><div class="test-svar">';
      niv.tekst.forEach(function(t){ h += '<p>' + t + '</p>'; });
      raad.forEach(function(t){ h += '<p>' + t + '</p>'; });
      h += '<p>Målet ditt er ' + maal + '. Det er fullt mulig, men det tar noen måneder, ikke noen uker. Det er verdt å vite før du begynner.</p>';
      h += '<div class="knapper">'
         + '<a class="knapp" href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2YlznxLxGU88lcqM8ZNJxIzTR6oarp0zbkhuU9-3zpkX-PXkqmhsXHzGKK3c_k55dAG1F68yGd" target="_blank" rel="noopener">Book 42 minutter med meg</a>'
         + '<a class="knapp-tom" href="#tjenesteliste">Se hva jeg kan gjøre</a>'
         + '</div>'
         + '<div class="test-nav" style="justify-content:flex-start"><button type="button" class="test-tilbake">Ta testen på nytt</button></div>'
         + '</div></div>';
      boks.innerHTML = h;
      boks.querySelector(".test-tilbake").addEventListener("click", function(){
        steg = 0; svar = []; valgt = null; tegnSpm();
      });
    }

    tegnSpm();
  });

document.querySelectorAll("[data-faner]").forEach(function(boks){
    var faner = Array.prototype.slice.call(boks.querySelectorAll(".fane"));
    function velg(i, flyttFokus){
      faner.forEach(function(f, j){
        var valgt = i === j;
        f.setAttribute("aria-selected", valgt ? "true" : "false");
        f.tabIndex = valgt ? 0 : -1;
        boks.querySelector("#" + f.getAttribute("aria-controls")).hidden = !valgt;
      });
      if(flyttFokus){ faner[i].focus(); }
    }
    faner.forEach(function(f, i){
      f.addEventListener("click", function(){ velg(i); });
      f.addEventListener("keydown", function(e){
        if(e.key === "ArrowDown" || e.key === "ArrowRight"){ e.preventDefault(); velg((i+1) % faner.length, true); }
        if(e.key === "ArrowUp" || e.key === "ArrowLeft"){ e.preventDefault(); velg((i-1+faner.length) % faner.length, true); }
      });
    });
  });

  var SKJEMA_URL = "https://formspree.io/f/xyeynkjn";
  var takkBoks = null;
  var takkForrige = null;
  function lukkTakk(){
    if(!takkBoks) return;
    takkBoks.hidden = true;
    document.removeEventListener("keydown", takkTast);
    if(takkForrige && takkForrige.focus) takkForrige.focus();
  }
  function takkTast(e){
    if(e.key === "Escape") lukkTakk();
  }
  function visTakk(){
    if(!takkBoks){
      takkBoks = document.createElement("div");
      takkBoks.className = "takk";
      takkBoks.setAttribute("role", "dialog");
      takkBoks.setAttribute("aria-modal", "true");
      takkBoks.setAttribute("aria-labelledby", "takk-tekst");
      takkBoks.innerHTML = '<div class="takk-kort">'
        + '<p id="takk-tekst">Takk, nå pinget det i innboksen min. Jeg kommer tilbake til deg ASAP.</p>'
        + '<button class="knapp" type="button" data-lukk>Lukk</button>'
        + '</div>';
      takkBoks.hidden = true;
      takkBoks.addEventListener("click", function(e){
        if(e.target === takkBoks || e.target.hasAttribute("data-lukk")) lukkTakk();
      });
      document.body.appendChild(takkBoks);
    }
    takkForrige = document.activeElement;
    takkBoks.hidden = false;
    takkBoks.querySelector("[data-lukk]").focus();
    document.addEventListener("keydown", takkTast);
  }
  document.querySelectorAll("[data-skjema]").forEach(function(skjema){
    var knapp = skjema.querySelector("button[type=submit]");
    var kvitt = skjema.querySelector("[data-kvittering]");
    var v = function(n){
      var felt = skjema.querySelector("[name=" + n + "]");
      return felt ? (felt.value || "").trim() : "";
    };
    function melding(tekst, feil){
      kvitt.textContent = tekst;
      kvitt.hidden = false;
      kvitt.classList.toggle("feil", !!feil);
    }
    function reserve(){
      var tekst = "Hei, Erlend!\n\nJeg heter " + v("name") + ".\n" +
                  (v("bedrift") ? "Jobber i " + v("bedrift") + ".\n" : "") +
                  "E-posten min er " + v("email") + ".\n\n" + v("message") + "\n";
      window.location.href = "mailto:erlend@fetterantonflaks.no"
        + "?subject=" + encodeURIComponent("Forespørsel fra " + v("name"))
        + "&body=" + encodeURIComponent(tekst);
    }
    skjema.addEventListener("submit", function(e){
      e.preventDefault();
      if(!v("name") || !v("email") || !v("message")){
        melding("Fyll inn navn, e-post og hva det gjelder, så går den.", true);
        return;
      }
      var data = new FormData(skjema);
      data.append("_subject", "Forespørsel fra " + v("name") + " på erlendhaddeland.no");
      knapp.disabled = true;
      var opprinnelig = knapp.textContent;
      knapp.textContent = "Sender ...";
      melding("", false);
      kvitt.hidden = true;
      fetch(SKJEMA_URL, { method: "POST", body: data, headers: { Accept: "application/json" } })
        .then(function(svar){
          if(svar.ok){
            skjema.reset();
            visTakk();
          } else {
            melding("Noe stoppet opp her. Jeg åpner e-postprogrammet ditt i stedet.", true);
            reserve();
          }
        })
        .catch(function(){
          melding("Fikk ikke kontakt. Jeg åpner e-postprogrammet ditt i stedet.", true);
          reserve();
        })
        .then(function(){
          knapp.disabled = false;
          knapp.textContent = opprinnelig;
        });
    });
  });

  document.querySelectorAll(".kort .flate").forEach(function(k){
    k.addEventListener("click", function(){
      var i = document.createElement("iframe");
      i.src = k.dataset.embed;
      i.title = k.getAttribute("aria-label");
      i.allow = "autoplay; clipboard-write; encrypted-media; picture-in-picture";
      i.allowFullscreen = true;
      i.loading = "lazy";
      k.replaceWith(i);
    });
  });

  /* Kopier e-postadressen på filsiden */
  document.querySelectorAll("[data-kopier]").forEach(function(knapp){
    var opprinnelig = knapp.textContent;
    var teller;
    function kvittering(tekst){
      knapp.textContent = tekst;
      knapp.disabled = true;
      clearTimeout(teller);
      teller = setTimeout(function(){
        knapp.textContent = opprinnelig;
        knapp.disabled = false;
      }, 2400);
    }
    function reserve(tekst){
      var ok = false;
      var felt = document.createElement("textarea");
      felt.value = tekst;
      felt.setAttribute("readonly", "");
      felt.style.cssText = "position:absolute;left:-9999px;top:0";
      document.body.appendChild(felt);
      felt.select();
      try { ok = document.execCommand("copy"); } catch(e){}
      document.body.removeChild(felt);
      kvittering(ok ? "Kopiert" : "Merk adressen over og kopier selv");
    }
    knapp.addEventListener("click", function(){
      var tekst = knapp.dataset.kopier;
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(tekst).then(function(){ kvittering("Kopiert"); }, function(){ reserve(tekst); });
      } else {
        reserve(tekst);
      }
    });
  });

  /* Seksjoner som glir inn når de kommer i syne. CSS skjuler dem bare
     når JavaScript er på, se @media (scripting:enabled) i styles.css. */
  var maal = [];
  document.querySelectorAll("main section > .ramme").forEach(function(ramme){
    /* Ren brødtekst glir inn som én blokk. Kort, faner og rader
       glir inn hver for seg, med litt forskyvning mellom dem. */
    if (ramme.classList.contains("brod")) { maal.push(ramme); return; }
    Array.prototype.forEach.call(ramme.children, function(barn){
      if (barn.classList.contains("rutenett")) {
        Array.prototype.forEach.call(barn.children, function(kort){ maal.push(kort); });
      } else {
        maal.push(barn);
      }
    });
  });

  function vis(el, nr){
    el.style.transitionDelay = Math.min(nr * 80, 320) + "ms";
    el.classList.add("synlig");
  }

  if (!("IntersectionObserver" in window)) {
    maal.forEach(function(el){ el.classList.add("synlig"); });
  } else {
    var speider = new IntersectionObserver(function(hendelser, obs){
      hendelser.forEach(function(h){
        if (!h.isIntersecting) return;
        var el = h.target;
        var sosken = Array.prototype.slice.call(el.parentNode.children);
        vis(el, sosken.indexOf(el));
        obs.unobserve(el);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: .08 });
    maal.forEach(function(el){ speider.observe(el); });
  }

  /* Mobilmeny */
  var topp = document.querySelector(".topp");
  var menyKnapp = topp && topp.querySelector(".meny-knapp");
  if (menyKnapp) {
    var lukk = function(){
      topp.classList.remove("apen");
      menyKnapp.setAttribute("aria-expanded", "false");
    };
    menyKnapp.addEventListener("click", function(){
      var apen = topp.classList.toggle("apen");
      menyKnapp.setAttribute("aria-expanded", apen ? "true" : "false");
    });
    Array.prototype.forEach.call(topp.querySelectorAll("nav a"), function(lenke){
      lenke.addEventListener("click", lukk);
    });
    document.addEventListener("keydown", function(h){
      if (h.key === "Escape" && topp.classList.contains("apen")) {
        lukk();
        menyKnapp.focus();
      }
    });
  }

})();

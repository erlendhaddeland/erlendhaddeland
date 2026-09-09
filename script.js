(function(){

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
    /* Flater uten data-embed er vanlige lenker ut, ikke avspillere. */
    if (!k.dataset.embed) return;
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
    /* Kvitteringen skrives i statusfeltet hvis knappen har et,
       ellers i knappen selv. */
    var felt = knapp.querySelector("[data-kopistatus]") || knapp;
    var opprinnelig = felt.textContent;
    var teller;
    function kvittering(tekst){
      felt.textContent = tekst;
      knapp.disabled = true;
      clearTimeout(teller);
      teller = setTimeout(function(){
        felt.textContent = opprinnelig;
        knapp.disabled = false;
      }, 2400);
    }
    function reserve(tekst){
      var ok = false;
      var hjelper = document.createElement("textarea");
      hjelper.value = tekst;
      hjelper.setAttribute("readonly", "");
      hjelper.style.cssText = "position:absolute;left:-9999px;top:0";
      document.body.appendChild(hjelper);
      hjelper.select();
      try { ok = document.execCommand("copy"); } catch(e){}
      document.body.removeChild(hjelper);
      kvittering(ok ? "Kopiert" : "Gikk ikke");
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

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
            melding("Takk, " + v("name").split(" ")[0] + ". Meldingen er sendt, og jeg svarer som regel samme dag.", false);
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
})();

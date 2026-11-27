// Version chooser: the first page of the site lets the player pick Version 1 or Version 2,
// then shows the normal home page of that version. Links that open a game (?room=, ?local) skip it.
(function () {
  const params = new URLSearchParams(location.search);
  if (params.has("room") || params.has("local") || params.has("v1")) return;
  const lang = (localStorage.getItem("ouat-lang") || navigator.language || "en").slice(0, 2);
  const T = {
    en: { title: "Choose your version", v1: "Version 1", v1d: "One character per turn, 12 rounds, 15 Chapter cards, rich cards with many combos.", v2: "Version 2", v2d: "Groups of cards, families to collect, Legendary characters with a signature. 8 rounds.", test: "test", play: "Play" },
    fr: { title: "Choisissez votre version", v1: "Version 1", v1d: "Un personnage par tour, 12 manches, 15 cartes Chapitre, des cartes riches et beaucoup de combos.", v2: "Version 2", v2d: "Des lots de cartes, des familles à collectionner, des Légendaires à signature. 8 manches.", test: "test", play: "Jouer" },
    it: { title: "Scegli la tua versione", v1: "Versione 1", v1d: "Un personaggio per turno, 12 round, 15 carte Capitolo, carte ricche e tante combo.", v2: "Versione 2", v2d: "Gruppi di carte, famiglie da collezionare, Leggendari con una firma. 8 round.", test: "test", play: "Gioca" },
  }[lang] || null;
  const L = T || {
    title: "Choose your version", v1: "Version 1", v1d: "One character per turn, 12 rounds, 15 Chapter cards, rich cards with many combos.", v2: "Version 2", v2d: "Groups of cards, families to collect, Legendary characters with a signature. 8 rounds.", test: "test", play: "Play",
  };
  const box = document.createElement("div");
  box.className = "version-pick";
  box.innerHTML = `<div class="vp-inner">
      <h1 class="biglogo">Once Upon a Time</h1>
      <p class="authors">Simone Luciani &amp; Matthieu Verdier</p>
      <h2>${L.title}</h2>
      <div class="vp-cards">
        <button type="button" class="vp-card" data-v="1"><b>${L.v1}</b><span>${L.v1d}</span><i>${L.play} →</i></button>
        <button type="button" class="vp-card vp-2" data-v="2"><b>${L.v2} <small>${L.test}</small></b><span>${L.v2d}</span><i>${L.play} →</i></button>
      </div>
    </div>`;
  document.body.appendChild(box);
  document.body.classList.add("picking-version");
  box.addEventListener("click", (e) => {
    const card = e.target.closest("[data-v]");
    if (!card) return;
    if (card.dataset.v === "2") location.href = "v2/index.html";
    else {
      box.remove();
      document.body.classList.remove("picking-version");
    }
  });
  // "Change version" link on the home page of Version 1.
  window.showVersionPick = () => location.href = "index.html";
})();

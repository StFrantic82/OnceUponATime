// Once Upon a Time — card faces.
// Uses formatGameText / resourceIcon / iconAmount from app.js and t / tc from i18n.js (resolved at render time).
(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const ICONS = ["Charm", "Strength", "Dexterity", "Intelligence", "Sorcery"];
  const TAG = 26; // px, size of a square skill tag

  // "Tag token" in card texts becomes a small square token icon with the four skill colours.
  const TAG_ICON = `<span class="tagtok-ico" role="img" aria-label="Tag"><i></i><i></i><i></i><i></i><i></i></span>`;
  // A tiny Quest tile (landscape card: picture on the left, purple title band and text on the right).
  const QUEST_ICON = `<svg class="quest-ico" viewBox="0 0 30 20" role="img" aria-label="Q"><rect x="0.8" y="0.8" width="28.4" height="18.4" rx="2.6" fill="#f6ead0" stroke="#6b4a8a" stroke-width="1.6"/><rect x="1.6" y="1.6" width="11" height="16.8" rx="1.6" fill="#2e3f6e"/><path d="M2.4 18 L2.4 13 Q7 9.8 12.2 13 L12.2 18Z" fill="#4f7a3a"/><circle cx="9.4" cy="5.2" r="1.6" fill="#f6d98a"/><rect x="13.4" y="1.6" width="15" height="4.4" fill="#8a64ad"/><rect x="15" y="8.6" width="11.5" height="1.4" rx=".7" fill="#b39b72"/><rect x="15" y="11.6" width="9" height="1.4" rx=".7" fill="#b39b72"/><rect x="15" y="14.6" width="10.5" height="1.4" rx=".7" fill="#b39b72"/></svg>`;
  window.QUEST_ICON = QUEST_ICON;
  // Free upgrade: the dashed XP space with its star, ticked.
  const FREEUP_ICON = `<svg class="freeup-ico" viewBox="0 0 24 24" role="img" aria-label="free upgrade"><title>free upgrade</title><rect x="1.5" y="1.5" width="21" height="21" rx="4" fill="#fff8e6" stroke="#b8862e" stroke-width="1.8" stroke-dasharray="3.2 2.2"/><path d="M12 4.6l2.2 4.6 5 .6-3.7 3.4 1 5-4.5-2.5-4.5 2.5 1-5-3.7-3.4 5-.6z" fill="#f3c64a" stroke="#c9922a" stroke-width=".8" opacity=".85"/><circle cx="17.6" cy="17.6" r="5.4" fill="#3f8f4c" stroke="#fff" stroke-width="1.2"/><path d="M15 17.7l1.8 1.8 3.4-3.6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  window.FREEUP_ICON = FREEUP_ICON;

  // "set of four icons" becomes the four square tags in a row (a placeholder, drawn at the end of formatGameText).
  const SET4 = "\u0001SET4\u0001";
  function tagTokens(text) {
    return String(text || "")
      // Caps ("max 14 VP") go on their own line, in brackets (drawn at the end of formatGameText).
      .replace(/[,.;]?\s*\b(max(?:imum)?|massimo)\s+(\d+)(\s*(?:VP|PV|XP|coins?))?\s*\.?/gi, (_, word, n, unit) => `.\u0002(${word.toLowerCase()} ${n}${unit || ""})\u0003 `)
      // Good / Bad in the text: the word in bold blue / red, like the bands at the bottom of the cards.
      .replace(/\b(Good|Gentil(?:le)?s?|Buon[oaei])\b/g, '<b class="w-good">$1</b>')
      .replace(/\b(Bad|Méchant(?:e)?s?|Cattiv[oaei])\b(?!\s+(?:Reine|Sorcière))/g, '<b class="w-bad">$1</b>')
      .replace(/\bplace XP on a Character so that it levels up\b/gi, FREEUP_ICON)
      .replace(/\bplac(?:ez|er) de l[’']XP sur un Personnage de manière à l[’']améliorer\b/gi, FREEUP_ICON)
      .replace(/\bpiazza(?:re)? XP su un Personaggio in modo da potenziarlo\b/gi, FREEUP_ICON)
      .replace(/\b(?:all )?(?:four|five|4|5)(?: different)? icons\b/gi, SET4)
      .replace(/\b(take|takes|prenez|prend|prendre|prendi|prende)\s+(1|an?|une|una|un’)\s*(?:Quest|Quête|Missione|Adventure|Aventure|Avventura)\b/gi, (_, verb, n) => `${verb} ${/^\d$/.test(n) ? n : "1"} ${QUEST_ICON}`)
      .replace(/\b(?:des (?:quatre|cinq) icônes|de [45] icônes différentes)/gi, `de ${SET4}`)
      .replace(/\b(?:delle (?:quattro|cinque) icone|di [45] icone diverse)/gi, `di ${SET4}`)
      .replace(/\b(\d+|a|one|two)\s+Tag tokens?/gi, (_, n) => `${/^\d$/.test(n) ? n : { a: "1", one: "1", two: "2" }[n.toLowerCase()]} ${TAG_ICON}`)
      .replace(/\btwo tokens\b/gi, `2 ${TAG_ICON}`)
      .replace(/\b(\d+|un|deux)\s+jetons?\s+d[’']ic[ôo]ne/gi, (_, n) => `${({ un: "1", deux: "2" })[n.toLowerCase()] || n} ${TAG_ICON}`)
      .replace(/\b(\d+|deux)\s+jetons\b/gi, (_, n) => `${n === "deux" ? "2" : n} ${TAG_ICON}`)
      .replace(/\b(\d+|un|due)\s+segnalin[oi]\s+icona/gi, (_, n) => `${({ un: "1", due: "2" })[n.toLowerCase()] || n} ${TAG_ICON}`)
      .replace(/\b(\d+|due)\s+segnalini\b/gi, (_, n) => `${n === "due" ? "2" : n} ${TAG_ICON}`);
  }
  window.tagTokens = tagTokens;

  function skillList(card) {
    const out = [];
    for (const icon of ICONS) {
      const n = iconAmount(card, icon);
      for (let i = 0; i < n; i += 1) out.push(icon);
    }
    return out;
  }

  function skillTags(list) {
    if (!list.length) return "";
    return `<div class="fc-skills">${list.map((icon) => `<span class="skill-tag sk-${icon.toLowerCase()}">${resourceIcon(icon === "Dexterity" ? "DexteritySq" : icon, icon)}</span>`).join("")}</div>`;
  }

  // Font size for a card name so it fits beside the tags on one or two lines.
  function nameStyle(name, innerWidth, tagCount, max) {
    const avail = innerWidth - (tagCount ? tagCount * (TAG + 3) + 6 : 0) - 12;
    const len = Math.max(1, String(name).length);
    const oneLine = avail / (len * 0.52);
    if (oneLine >= max) return `font-size:${max}px`;
    const twoLines = avail / (Math.ceil(len / 2 + 2) * 0.52);
    const size = Math.max(10, Math.min(max, Math.max(oneLine, twoLines)));
    return `font-size:${size.toFixed(1)}px`;
  }

  function alignFoot(alignment) {
    if (!alignment) return "";
    const key = alignment.toLowerCase();
    const icon = alignment === "Good" || alignment === "Bad" ? resourceIcon(alignment, t(key)) : `<span class="fc-neutral-dot">N</span>`;
    return `<footer class="fc-foot fc-foot-${key}">${icon}<span>${esc(t(key))}</span></footer>`;
  }

  // Icons shown as tags at the start of a legendary's base text are removed from the text.
  function stripIconPrefix(text) {
    return String(text || "")
      .replace(/^\s*((Charm|Strength|Dexterity|Intelligence|Sorcery)(\s*\d+)?\s*[,.]?\s*)+/i, "")
      .trim();
  }

  function head(card, innerWidth, max, extra = "") {
    const all = skillList(card);
    // Four tags or more do not fit beside the name: they go in a band of their own (tagBand).
    const skills = all.length >= 4 ? [] : all;
    const name = tc(card.name);
    return `<header class="fc-head">${skillTags(skills)}<div class="fc-name" style="${nameStyle(name, innerWidth, skills.length, max)}">${esc(name)}${extra}</div></header>`;
  }

  function tagBand(card, cls = "") {
    const all = skillList(card);
    return all.length >= 4 ? `<div class="fc-tagband ${cls}">${skillTags(all)}</div>` : "";
  }

  // Round VP mark (not a tag): the card grants VP during the game or at Game End.
  // Round VP badge: only for cards that produce VP tokens during the game (Instant, Activation or
  // Ongoing effects). Cards that only score at Game End do not get it.
  function givesVpInPlay(card) {
    return [card.effect, card.base, String(card.upgrade || "").replace(/^Cost\s+\d+\s+XP\.\s*/i, "")].some((text) =>
      String(text || "")
        .split(/(?=\b(?:Instant|Activation|Ongoing|Game End)\s*:)/i)
        .some((part) => !/^Game End\s*:/i.test(part) && /\bVP\b/i.test(part)));
  }

  function vpMark(card) {
    return givesVpInPlay(card) ? `<span class="fc-vpmark" title="VP">${resourceIcon("vp", "VP")}</span>` : "";
  }

  // Layout helpers: keep "2 [icon]" and "[icon]." together so that an icon is never alone on a line.
  const ICON_HTML = '(?:<img\\b[^>]*>|<span class="(?:skill-tag|set4|tagtok-ico|ac-quest)[^"]*"[^>]*>(?:<span[^>]*>.*?<\\/span>|<img\\b[^>]*>|<i><\\/i>|<svg[\\s\\S]*?<\\/svg>)*<\\/span>|<svg\\b[\\s\\S]*?<\\/svg>)';
  const GLUE_NUM = new RegExp(`(\\d+(?:\\s*\\/\\s*\\d+)*)\\s*(${ICON_HTML})(\\s*[.,;:!?)])?`, "g");
  const GLUE_PUNCT = new RegExp(`(${ICON_HTML})\\s*([.,;:!?)])`, "g");
  function gtext(text) {
    // French punctuation: no line break before ":" ";" "!" "?" nor inside « ».
    return formatGameText(String(text || "").replace(/ ([:;!?»])/g, "\u00a0$1").replace(/« /g, "«\u00a0"))
      .replace(GLUE_NUM, (_, n, icon, p) => `<span class="nb">${n}&nbsp;${icon}${(p || "").trim()}</span>`)
      .replace(GLUE_PUNCT, (m, icon, p) => (m.includes('class="nb"') ? m : `<span class="nb">${icon}${p}</span>`));
  }

  // Tiered Adventures ("3 / 4 / 6 Charm icons: 2 / 4 / 6 VP."): thresholds on one line, rewards on the next.
  function questText(scoring) {
    const m = String(scoring).match(/^(\d+(?:\s*\/\s*\d+)+)\s*([^:]*?)\s*:\s*(\d+(?:\s*\/\s*\d+)+)\s*(VP|PV)\s*\.\s*(.*)$/);
    const hourglass = resourceIcon("endgame", "Game End");
    if (!m) return `<p>${hourglass} ${gtext(scoring)}</p>`;
    const [, tiers, what, gains, , rest] = m;
    const cells = (list) => list.split("/").map((x) => `<b>${x.trim()}</b>`).join("");
    return `<div class="q-tiers"><div class="q-what">${hourglass} ${gtext(what)}</div>
      <div class="q-grid" style="--n:${tiers.split("/").length}"><div class="q-row">${cells(tiers)}</div><div class="q-row q-gain">${cells(gains)}<span class="q-vp">${resourceIcon("vp", "VP")}</span></div></div></div>${rest ? `<p class="q-rest">${gtext(rest)}</p>` : ""}`;
  }

  function common(card, opts = {}) {
    const align = (card.alignment || "neutral").toLowerCase();
    return `<article class="fcard fc-common fc-${align} ${opts.cls || ""}">
      ${head(card, 160, 15)}
      <div class="fc-art">${CardArt.art(card.name)}${vpMark(card)}</div>
      <div class="fc-text">${card.effect ? `<p>${gtext(tc(card.effect))}</p>` : ""}</div>
      ${alignFoot(card.alignment)}
    </article>`;
  }

  // Dashed space to stack XP tokens before levelling up (printed cards and Writer tiles).
  // One dashed star space per XP needed: the number of spaces shows the cost. Filled spaces hold placed XP.
  function xpStep(n = 1, filled = 0) {
    const boxes = Array.from({ length: Math.max(1, n) }, (_, i) => `<span class="xp-box ${i < filled ? "on" : ""}">${resourceIcon("xp", "XP")}</span>`).join("");
    return `<div class="xp-step xp-n${Math.max(1, n)}"><span class="xp-boxes">${boxes}</span></div>`;
  }


  // Small framed portraits for the Writer tiles (a painting in a gilded frame).
  const PORTRAITS = {
    "Charles Perrault": { bg: "#7a3a3a", skin: "#f1c8a4", hair: "#5b3a22", wig: true, coat: "#2f4a7a", collar: "#fff" },
    "Brothers Grimm": { bg: "#3f5a3a", skin: "#efc6a0", hair: "#4a2f1c", coat: "#2b2b3a", collar: "#fff", two: true },
    "Hans Christian Andersen": { bg: "#2f5d8a", skin: "#f0caa6", hair: "#8a6038", side: true, coat: "#3a2c25", collar: "#fff", bow: "#1d1d1d" },
    "Carlo Collodi": { bg: "#8a5a2a", skin: "#eec19a", hair: "#2c2420", mustache: "#2c2420", coat: "#3d3a52", collar: "#fff" },
    "Lewis Carroll": { bg: "#6b4a8a", skin: "#f3d0b0", hair: "#3a2a20", wavy: true, coat: "#22222c", collar: "#fff", bow: "#5a1a2a" },
    "J. M. Barrie": { bg: "#2f6a6a", skin: "#efc8a2", hair: "#3b2d22", mustache: "#3b2d22", coat: "#3a3328", collar: "#fff" },
    "L. Frank Baum": { bg: "#3f7a32", skin: "#efc6a0", hair: "#b0b0b0", mustache: "#9a9a9a", coat: "#2a3a2a", collar: "#fff" },
    "Le Prince de Beaumont": { bg: "#9a3f5a", skin: "#f4d2b6", hair: "#6a4428", woman: true, coat: "#c07a9a", collar: "#fbe9f0" },
  };

  function bust(p, x, scale = 1) {
    const g = (inner) => `<g transform="translate(${x} 0) scale(${scale})">${inner}</g>`;
    const hair = p.woman
      ? `<ellipse cx="0" cy="34" rx="17" ry="18" fill="${p.hair}"/><circle cx="0" cy="15" r="9" fill="${p.hair}"/>`
      : p.wig
        ? `<path d="M-19 40 Q-22 22 0 18 Q22 22 19 40 Q23 56 14 62 L-14 62 Q-23 56 -19 40Z" fill="${p.hair}"/>`
        : p.wavy
          ? `<path d="M-15 38 Q-17 22 0 21 Q17 22 15 38 Q18 46 12 48 L-12 48 Q-18 46 -15 38Z" fill="${p.hair}"/>`
          : `<path d="M-14 36 Q-15 22 0 22 Q15 22 ${p.side ? 16 : 14} 36 Q8 28 -14 36Z" fill="${p.hair}"/>`;
    const face = `<ellipse cx="0" cy="40" rx="12" ry="14" fill="${p.skin}"/>
      <circle cx="-4.5" cy="38" r="1.4" fill="#2a1a12"/><circle cx="4.5" cy="38" r="1.4" fill="#2a1a12"/>
      <path d="M-3.5 46 Q0 48.5 3.5 46" stroke="#8a4a3a" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <circle cx="-7" cy="44" r="2" fill="#e8998a" opacity=".45"/><circle cx="7" cy="44" r="2" fill="#e8998a" opacity=".45"/>`;
    const mustache = p.mustache ? `<path d="M-7 44.5 Q-3 42 0 44 Q3 42 7 44.5 Q3 46 0 45 Q-3 46 -7 44.5Z" fill="${p.mustache}"/>` : "";
    const body = `<path d="M-24 80 Q-24 58 0 56 Q24 58 24 80Z" fill="${p.coat}"/>
      <path d="M-7 57 L0 66 L7 57 Q0 55 -7 57Z" fill="${p.collar}"/>
      ${p.bow ? `<path d="M-5 60 L0 62 L5 60 L5 65 L0 63 L-5 65Z" fill="${p.bow}"/>` : ""}`;
    const front = p.wavy ? `<path d="M-12 32 Q-6 24 0 27 Q6 24 12 32 Q6 28 0 31 Q-6 28 -12 32Z" fill="${p.hair}"/>` : "";
    return g(`${p.woman || p.wig ? hair : ""}${body}${face}${mustache}${p.woman || p.wig ? "" : hair}${front}`);
  }

  function writerPortrait(name) {
    const p = PORTRAITS[name] || PORTRAITS["Charles Perrault"];
    const figures = p.two ? bust(p, 34, 0.82) + bust({ ...p, hair: "#6a4a2c", coat: "#3a2c2c" }, 64, 0.86) : bust(p, 50);
    return `<svg class="portrait" viewBox="0 0 100 100" aria-hidden="true">
      <defs><linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3d488"/><stop offset=".5" stop-color="#b8862e"/><stop offset="1" stop-color="#f0c96a"/></linearGradient></defs>
      <rect x="2" y="2" width="96" height="96" rx="6" fill="url(#gold)" stroke="#7a5414" stroke-width="2"/>
      <rect x="11" y="11" width="78" height="78" rx="3" fill="${p.bg}" stroke="#7a5414" stroke-width="1.5"/>
      <svg x="11" y="11" width="78" height="78" viewBox="0 0 100 80" preserveAspectRatio="xMidYMax slice"><rect width="100" height="80" fill="${p.bg}"/><ellipse cx="50" cy="30" rx="40" ry="30" fill="#fff" opacity=".08"/>${figures}</svg>
      <circle cx="6.5" cy="6.5" r="2" fill="#fff3c8"/><circle cx="93.5" cy="6.5" r="2" fill="#fff3c8"/><circle cx="6.5" cy="93.5" r="2" fill="#fff3c8"/><circle cx="93.5" cy="93.5" r="2" fill="#fff3c8"/>
    </svg>`;
  }

  // Each Writer is also a player colour.
  const WRITER_COLORS = {
    "Charles Perrault": "#b5452a",
    "Brothers Grimm": "#3f7a32",
    "Hans Christian Andersen": "#2f6aa8",
    "Carlo Collodi": "#c8811e",
    "Lewis Carroll": "#6b4a8a",
    "J. M. Barrie": "#1f8a8a",
    "L. Frank Baum": "#8a8a1e",
    "Le Prince de Beaumont": "#b0477a",
  };
  const writerColor = (name) => WRITER_COLORS[name] || "#5a3b6e";

  // Writer tile: name and framed portrait, three levels, star spaces (XP) between them.
  // opts.level: current level (0 = just showing the card), opts.xpPlaced: XP on the next step.
  function writer(card, opts = {}) {
    const level = opts.level || 0;
    const levels = [
      { n: 1, type: "ongoing", text: card.level1 },
      { n: 2, type: "instant", text: card.level2, cost: card.cost2 },
      { n: 3, type: "endgame", text: card.level3, cost: card.cost3 },
    ];
    const filledFor = (n, cost) => (level >= n ? cost : level === n - 1 ? opts.xpPlaced || 0 : 0);
    return `<article class="writer-card wcard ${opts.cls || ""}" style="--wcol:${writerColor(card.name)}">
      ${opts.notch || ""}
      <div class="writer-card-header"><div class="writer-title"><div class="writer-name">${esc(tc(card.name))}</div>${card.coins != null ? `<div class="writer-coins" title="${esc(t("startCoins"))}">${card.coins}${resourceIcon("coins", "coins")}</div>` : ""}${level ? `<div class="writer-level">${esc(t("levelN", { n: level }))}</div>` : ""}</div>${writerPortrait(card.name)}</div>
      <div class="writer-levels">${levels
        .map((l, i) => `${i ? xpStep(l.cost, filledFor(l.n, l.cost)) : ""}<div class="writer-level-box ${level && l.n > level ? "locked" : ""}"><strong>${resourceIcon(l.type, l.type)} ${esc(t("levelN", { n: l.n }))}</strong>${gtext(tc(l.text))}</div>`)
        .join("")}</div>
      ${opts.extra || ""}
    </article>`;
  }

  function legendary(card, opts = {}) {
    const align = (card.alignment || "neutral").toLowerCase();
    const cost = opts.cost ?? Number((String(card.upgrade).match(/Cost (\d+) XP/i) || [])[1] || 4);
    const upgradeText = String(card.upgrade || "").replace(/^Cost\s+\d+\s+XP\.\s*/i, "");
    return `<article class="fcard fc-legendary fc-${align} ${card.upgraded ? "is-upgraded" : ""} ${opts.cls || ""}">
      ${head(card, 204, 16)}
      <div class="fc-art">${CardArt.art(card.name)}${vpMark(card)}${tagBand(card)}</div>
      <div class="fc-side fc-base">${gtext(stripIconPrefix(tc(card.base)))}</div>
      ${xpStep(cost, card.upgraded ? cost : card.xpOn || 0)}
      <div class="fc-side fc-up ${card.upgraded ? "on" : ""}">${gtext(tc(upgradeText))}</div>
      ${alignFoot(card.alignment)}
    </article>`;
  }

  function item(card, opts = {}) {
    const price = opts.price ?? card.cost;
    const bad = /\bBad\b/.test(card.icons || "");
    return `<article class="fcard fc-item ${opts.cls || ""}">
      ${head(card, 188, 14)}
      <div class="fc-art">${CardArt.art(card.name)}${vpMark(card)}
        ${card.stash ? `<span class="fc-stash">${card.stash}${resourceIcon("coins", "coins")}</span>` : ""}
        <span class="fc-price">${opts.original != null && opts.original !== price ? `<s>${opts.original}</s>` : ""}${price}${resourceIcon("coins", "coins")}</span>
      </div>
      <div class="fc-text">${card.effect ? `<p>${gtext(tc(card.effect))}</p>` : tagBand(card, "big")}</div>
      ${card.effect ? tagBand(card) : ""}
      ${bad ? alignFoot("Bad") : ""}
    </article>`;
  }

  function quest(card, opts = {}) {
    const name = tc(card.name);
    return `<article class="fcard fc-quest ${opts.cls || ""}">
      <div class="fc-art">${CardArt.art(card.name)}<span class="fc-qnum">${card.number}</span></div>
      <div class="fc-qbody">
        <header class="fc-name" style="${nameStyle(name, 170, 0, 15)}">${esc(name)}</header>
        <div class="fc-theme">${esc(tc(card.theme))}</div>
        <div class="fc-text">${questText(tc(card.scoring))}</div>
      </div>
    </article>`;
  }

  function character(card, opts) {
    return card.deck === "legendary" ? legendary(card, opts) : common(card, opts);
  }

  // ---------- Chapter cards: a page from the storybook ----------
  function actionLines(effect) {
    const text = String(effect || "").trim();
    if (!text) return [];
    return text.split("+").map((part) => {
      const p = part.trim();
      let m;
      if ((m = p.match(/^(\d+)\s*coins?$/i))) return `<span class="ac-big">${m[1]}</span>${resourceIcon("coins", "coins")}`;
      if ((m = p.match(/^(\d+)\s*XP$/i))) return `<span class="ac-big">${m[1]}</span>${resourceIcon("xp", "XP")}`;
      if (/Draft (a )?Quest/i.test(p)) return `<span class="ac-quest" title="${esc(t("takeAQuest"))}">${QUEST_ICON}</span>`;
      // Convention: 1 gear = activate 1 card, 3 gears = activate all your cards with an Activation effect.
      if (/Activate all/i.test(p)) return `<span class="ac-gears" title="${esc(t("activateAll"))}">${resourceIcon("activation", t("activateAll")).repeat(3)}</span>`;
      if (/Activate a single/i.test(p)) return `<span class="ac-gears" title="${esc(t("activateOne"))}">${resourceIcon("activation", t("activateOne"))}</span>`;
      if ((m = p.match(/Free level up (?:to )?(\d+)/i))) return `<span class="ac-big">${m[1]}</span>${FREEUP_ICON}`;
      if (/Draw 1 Chapter/i.test(p)) return `<span class="ac-draw">${esc(t("drawTuck"))}</span>`;
      if (/free level up/i.test(p)) return FREEUP_ICON;
      return formatGameText(p);
    });
  }

  function action(card, opts = {}) {
    const lines = actionLines(card.effect);
    return `<div class="acard ${lines.length >= 3 ? "ac-long" : ""} ${opts.cls || ""}">
      <div class="ac-page">
        <div class="ac-head"><span class="ac-label">${esc(t("chapter"))}</span><span class="ac-num">${card.number}</span></div>
        <div class="ac-rule"></div>
        <div class="ac-effect">${lines.map((l) => `<div class="ac-line">${l}</div>`).join(`<div class="ac-and">&amp;</div>`)}</div>
        <div class="ac-foot">~ ${card.number} ~</div>
      </div>
    </div>`;
  }

  // Iconography summary (end of the rules, last page of the Print & Play).
  function iconGuide() {
    const gear = resourceIcon("activation", "Activation");
    const rows = [
      [skillTags(["Charm", "Strength", "Dexterity", "Intelligence", "Sorcery"]), "ico_tags"],
      [TAG_ICON, "ico_tagToken"],
      [`<span class="set4 guide-set4">${skillTags(["Charm", "Strength", "Dexterity", "Intelligence", "Sorcery"])}</span>`, "ico_set4"],
      [resourceIcon("coins", "coins"), "ico_coin"],
      [resourceIcon("xp", "XP"), "ico_xp"],
      [`<span class="xp-box">${resourceIcon("xp", "XP")}</span>`, "ico_xpSpace"],
      [FREEUP_ICON, "ico_freeUp"],
      [resourceIcon("vp", "VP"), "ico_vp"],
      [`<span class="fc-vpmark guide-vpmark">${resourceIcon("vp", "VP")}</span>`, "ico_vpMark"],
      [resourceIcon("instant", "Instant"), "ico_instant"],
      [resourceIcon("ongoing", "Ongoing"), "ico_ongoing"],
      [gear, "ico_activation"],
      [gear.repeat(3), "ico_activateAll"],
      [resourceIcon("endgame", "Game End"), "ico_endgame"],
      [QUEST_ICON, "ico_adventure"],
      [`${resourceIcon("Good", "Good")} ${resourceIcon("Bad", "Bad")}`, "ico_goodBad"],
    ];
    return `<div class="icon-guide">${rows.map(([icon, key]) => `<div class="ig-row"><span class="ig-icon">${icon}</span><span class="ig-text">${esc(t(key))}</span></div>`).join("")}</div>`;
  }

  window.CardFace = { common, legendary, item, quest, character, action, xpStep, writer, writerPortrait, writerColor, iconGuide, givesVpInPlay };
})();

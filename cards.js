// Once Upon a Time — card faces.
// Uses formatGameText / resourceIcon / iconAmount from app.js and t / tc from i18n.js (resolved at render time).
(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const ICONS = ["Charm", "Strength", "Dexterity", "Intelligence"];
  const TAG = 26; // px, size of a square skill tag

  // "Tag token" in card texts becomes a small square token icon with the four skill colours.
  const TAG_ICON = `<span class="tagtok-ico" role="img" aria-label="Tag"><i></i><i></i><i></i><i></i></span>`;
  // A tiny Quest tile (landscape card: picture on the left, purple title band and text on the right).
  const QUEST_ICON = `<svg class="quest-ico" viewBox="0 0 30 20" role="img" aria-label="Q"><rect x="0.8" y="0.8" width="28.4" height="18.4" rx="2.6" fill="#f6ead0" stroke="#6b4a8a" stroke-width="1.6"/><rect x="1.6" y="1.6" width="11" height="16.8" rx="1.6" fill="#2e3f6e"/><path d="M2.4 18 L2.4 13 Q7 9.8 12.2 13 L12.2 18Z" fill="#4f7a3a"/><circle cx="9.4" cy="5.2" r="1.6" fill="#f6d98a"/><rect x="13.4" y="1.6" width="15" height="4.4" fill="#8a64ad"/><rect x="15" y="8.6" width="11.5" height="1.4" rx=".7" fill="#b39b72"/><rect x="15" y="11.6" width="9" height="1.4" rx=".7" fill="#b39b72"/><rect x="15" y="14.6" width="10.5" height="1.4" rx=".7" fill="#b39b72"/></svg>`;
  window.QUEST_ICON = QUEST_ICON;

  // "set of four icons" becomes the four square tags in a row (a placeholder, drawn at the end of formatGameText).
  const SET4 = "\u0001SET4\u0001";
  function tagTokens(text) {
    return String(text || "")
      // Caps ("max 14 VP") go on their own line, in brackets (drawn at the end of formatGameText).
      .replace(/[,.;]?\s*\b(max(?:imum)?|massimo)\s+(\d+)(\s*(?:VP|PV|XP|coins?))?\s*\.?/gi, (_, word, n, unit) => `.\u0002(${word.toLowerCase()} ${n}${unit || ""})\u0003 `)
      .replace(/\b(?:all )?(?:four|4)(?: different)? icons\b/gi, SET4)
      .replace(/\b(take|takes|prenez|prend|prendre|prendi|prende)\s+(1|a|une|una)\s+(?:Quest|Quête|Missione)\b/gi, (_, verb, n) => `${verb} ${/^\d$/.test(n) ? n : "1"} ${QUEST_ICON}`)
      .replace(/\b(?:des quatre icônes|de 4 icônes différentes)/gi, `de ${SET4}`)
      .replace(/\b(?:delle quattro icone|di 4 icone diverse)/gi, `di ${SET4}`)
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
      .replace(/^\s*((Charm|Strength|Dexterity|Intelligence)(\s*\d+)?\s*[,.]?\s*)+/i, "")
      .trim();
  }

  function head(card, innerWidth, max, extra = "") {
    const skills = skillList(card);
    const name = tc(card.name);
    return `<header class="fc-head">${skillTags(skills)}<div class="fc-name" style="${nameStyle(name, innerWidth, skills.length, max)}">${esc(name)}${extra}</div></header>`;
  }

  function common(card, opts = {}) {
    const align = (card.alignment || "neutral").toLowerCase();
    return `<article class="fcard fc-common fc-${align} ${opts.cls || ""}">
      ${head(card, 160, 15)}
      <div class="fc-art">${CardArt.art(card.name)}</div>
      <div class="fc-text">${card.effect ? `<p>${formatGameText(tc(card.effect))}</p>` : ""}</div>
      ${alignFoot(card.alignment)}
    </article>`;
  }

  // Dashed space to stack XP tokens before levelling up (printed cards and Writer tiles).
  // One dashed star space per XP needed: the number of spaces shows the cost. Filled spaces hold placed XP.
  function xpStep(n = 1, filled = 0) {
    const boxes = Array.from({ length: Math.max(1, n) }, (_, i) => `<span class="xp-box ${i < filled ? "on" : ""}">${resourceIcon("xp", "XP")}</span>`).join("");
    return `<div class="xp-step"><span class="xp-arrow">▼</span><span class="xp-boxes">${boxes}</span><span class="xp-arrow">▼</span></div>`;
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
      <div class="writer-card-header"><div class="writer-title"><div class="writer-name">${esc(tc(card.name))}</div>${level ? `<div class="writer-level">${esc(t("levelN", { n: level }))}</div>` : ""}</div>${writerPortrait(card.name)}</div>
      <div class="writer-levels">${levels
        .map((l, i) => `${i ? xpStep(l.cost, filledFor(l.n, l.cost)) : ""}<div class="writer-level-box ${level && l.n > level ? "locked" : ""}"><strong>${resourceIcon(l.type, l.type)} ${esc(t("levelN", { n: l.n }))}</strong>${formatGameText(tc(l.text))}</div>`)
        .join("")}</div>
      ${opts.extra || ""}
    </article>`;
  }

  function legendary(card, opts = {}) {
    const align = (card.alignment || "neutral").toLowerCase();
    const cost = opts.cost ?? Number((String(card.upgrade).match(/Cost (\d+) XP/i) || [])[1] || 4);
    const upgradeText = String(card.upgrade || "").replace(/^Cost\s+\d+\s+XP\.\s*/i, "");
    return `<article class="fcard fc-legendary fc-${align} ${card.upgraded ? "is-upgraded" : ""} ${opts.cls || ""}">
      ${head(card, 204, 16, `<small>${esc(t("legendary"))}</small>`)}
      <div class="fc-art">${CardArt.art(card.name)}</div>
      <div class="fc-side fc-base">${formatGameText(stripIconPrefix(tc(card.base)))}</div>
      ${xpStep(cost, card.upgraded ? cost : card.xpOn || 0)}
      <div class="fc-side fc-up ${card.upgraded ? "on" : ""}">${formatGameText(tc(upgradeText))}</div>
      ${alignFoot(card.alignment)}
    </article>`;
  }

  function item(card, opts = {}) {
    const price = opts.price ?? card.cost;
    const bad = /\bBad\b/.test(card.icons || "");
    return `<article class="fcard fc-item ${opts.cls || ""}">
      ${head(card, 188, 14)}
      <div class="fc-art">${CardArt.art(card.name)}
        <span class="fc-price">${opts.original != null && opts.original !== price ? `<s>${opts.original}</s>` : ""}${price}${resourceIcon("coins", "coins")}</span>
      </div>
      <div class="fc-text"><p>${formatGameText(tc(card.effect))}</p></div>
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
        <div class="fc-text"><p>${resourceIcon("endgame", "Game End")} ${formatGameText(tc(card.scoring))}</p></div>
      </div>
    </article>`;
  }

  function character(card, opts) {
    return card.deck === "legendary" ? legendary(card, opts) : common(card, opts);
  }

  // ---------- Action cards: a page from the storybook ----------
  function actionLines(effect) {
    const text = String(effect || "").trim();
    if (!text) return [];
    return text.split("+").map((part) => {
      const p = part.trim();
      let m;
      if ((m = p.match(/^(\d+)\s*coins?$/i))) return `<span class="ac-big">${m[1]}</span>${resourceIcon("coins", "coins")}`;
      if ((m = p.match(/^(\d+)\s*XP$/i))) return `<span class="ac-big">${m[1]}</span>${resourceIcon("xp", "XP")}`;
      if (/Draft (a )?Quest/i.test(p)) return `${QUEST_ICON}${esc(t("takeAQuest"))}`;
      if (/Activate all/i.test(p)) return `${resourceIcon("activation", "Activation")} ${esc(t("activateAll"))}`;
      if (/Activate a single/i.test(p)) return `${resourceIcon("activation", "Activation")} ${esc(t("activateOne"))}`;
      if ((m = p.match(/Free level up to (\d+)/i))) return `<span class="ac-big">${m[1]}</span> ${esc(t("freeUpgrades"))}`;
      if (/free level up/i.test(p)) return `<span class="ac-big">1</span> ${esc(t("freeUpgrade"))}`;
      return formatGameText(p);
    });
  }

  function action(card, opts = {}) {
    const lines = actionLines(card.effect);
    return `<div class="acard ${opts.cls || ""}">
      <div class="ac-page">
        <div class="ac-head"><span class="ac-label">${esc(t("chapter"))}</span><span class="ac-num">${card.number}</span></div>
        <div class="ac-rule"></div>
        <div class="ac-effect">${lines.map((l) => `<div class="ac-line">${l}</div>`).join(`<div class="ac-and">&amp;</div>`)}</div>
        <div class="ac-foot">~ ${card.number} ~</div>
      </div>
    </div>`;
  }

  window.CardFace = { common, legendary, item, quest, character, action, xpStep, writer, writerPortrait, writerColor };
})();

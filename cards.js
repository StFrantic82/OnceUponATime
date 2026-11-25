// Once Upon a Time — card faces.
// Uses formatGameText / resourceIcon / iconAmount from app.js and t / tc from i18n.js (resolved at render time).
(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const ICONS = ["Charm", "Strength", "Dexterity", "Intelligence"];
  const TAG = 26; // px, size of a square skill tag

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

  function legendary(card, opts = {}) {
    const align = (card.alignment || "neutral").toLowerCase();
    const cost = opts.cost ?? Number((String(card.upgrade).match(/Cost (\d+) XP/i) || [])[1] || 4);
    const upgradeText = String(card.upgrade || "").replace(/^Cost\s+\d+\s+XP\.\s*/i, "");
    return `<article class="fcard fc-legendary fc-${align} ${card.upgraded ? "is-upgraded" : ""} ${opts.cls || ""}">
      ${head(card, 204, 16, `<small>${esc(t("legendary"))}</small>`)}
      <div class="fc-art">${CardArt.art(card.name)}</div>
      <div class="fc-side fc-base"><strong>${esc(t("base"))}</strong>${formatGameText(stripIconPrefix(tc(card.base)))}</div>
      <div class="fc-side fc-up ${card.upgraded ? "on" : ""}"><strong><span class="fc-cost">${cost} ${resourceIcon("xp", "XP")}</span>${esc(t("upgradeLabel"))}</strong>${formatGameText(tc(upgradeText))}</div>
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
      if (/Draft (a )?Quest/i.test(p)) return `<span class="ac-scroll"></span>${esc(t("takeAQuest"))}`;
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

  window.CardFace = { common, legendary, item, quest, character, action };
})();

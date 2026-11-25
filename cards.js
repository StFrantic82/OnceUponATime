// Once Upon a Time — card faces.
// Uses formatGameText / resourceIcon / iconAmount from app.js (resolved at render time).
(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const ICONS = ["Charm", "Strength", "Dexterity", "Intelligence"];

  function tagIcons(card) {
    const out = [];
    for (const icon of ICONS) {
      const n = iconAmount(card, icon);
      for (let i = 0; i < n; i += 1) out.push(`<span class="fc-tag">${resourceIcon(icon, icon)}</span>`);
    }
    return out.join("");
  }

  function alignBadge(card) {
    if (card.alignment === "Good" || card.alignment === "Bad") {
      return `<span class="fc-align">${resourceIcon(card.alignment, card.alignment)}</span>`;
    }
    if (card.alignment) return `<span class="fc-align fc-neutral" title="Neutral">N</span>`;
    return "";
  }

  // Icons in the "icons" field or at the start of the base text are shown as badges, so drop them from the text.
  function stripIconPrefix(text) {
    return String(text || "")
      .replace(/^\s*((Charm|Strength|Dexterity|Intelligence)(\s*\d+)?\s*[,.]?\s*)+/i, "")
      .trim();
  }

  function common(card, opts = {}) {
    const align = (card.alignment || "neutral").toLowerCase();
    return `<article class="fcard fc-common fc-${align} ${opts.cls || ""}">
      <header class="fc-name">${esc(card.name)}</header>
      <div class="fc-art">${CardArt.art(card.name)}
        <div class="fc-tags">${tagIcons(card)}</div>${alignBadge(card)}
      </div>
      <div class="fc-text"><p>${formatGameText(card.effect)}</p></div>
    </article>`;
  }

  function legendary(card, opts = {}) {
    const align = (card.alignment || "neutral").toLowerCase();
    const cost = opts.cost ?? Number((String(card.upgrade).match(/Cost (\d+) XP/i) || [])[1] || 4);
    const upgradeText = String(card.upgrade || "").replace(/^Cost\s+\d+\s+XP\.\s*/i, "");
    return `<article class="fcard fc-legendary fc-${align} ${card.upgraded ? "is-upgraded" : ""} ${opts.cls || ""}">
      <header class="fc-name"><span>${esc(card.name)}</span><small>Legendary</small></header>
      <div class="fc-art">${CardArt.art(card.name)}
        <div class="fc-tags">${tagIcons(card)}</div>${alignBadge(card)}
      </div>
      <div class="fc-side fc-base"><strong>Base</strong>${formatGameText(stripIconPrefix(card.base))}</div>
      <div class="fc-side fc-up ${card.upgraded ? "on" : ""}"><strong><span class="fc-cost">${cost} ${resourceIcon("xp", "XP")}</span>Upgrade</strong>${formatGameText(upgradeText)}</div>
    </article>`;
  }

  function item(card, opts = {}) {
    const price = opts.price ?? card.cost;
    return `<article class="fcard fc-item ${opts.cls || ""}">
      <div class="fc-art">${CardArt.art(card.name)}
        <span class="fc-price">${opts.original != null && opts.original !== price ? `<s>${opts.original}</s>` : ""}${price}${resourceIcon("coins", "coins")}</span>
        <div class="fc-tags">${tagIcons(card)}</div>
      </div>
      <header class="fc-name">${esc(card.name)}</header>
      <div class="fc-text"><p>${formatGameText(card.effect)}</p></div>
    </article>`;
  }

  function quest(card, opts = {}) {
    return `<article class="fcard fc-quest ${opts.cls || ""}">
      <div class="fc-art">${CardArt.art(card.name)}<span class="fc-qnum">${card.number}</span></div>
      <div class="fc-qbody">
        <header class="fc-name">${esc(card.name)}</header>
        <div class="fc-theme">${esc(card.theme)}</div>
        <div class="fc-text"><p>${resourceIcon("endgame", "Game End")} ${formatGameText(card.scoring)}</p></div>
      </div>
    </article>`;
  }

  function character(card, opts) {
    return card.deck === "legendary" ? legendary(card, opts) : common(card, opts);
  }

  // ---------- Action cards: a page from the storybook ----------
  function actionLines(effect) {
    const text = String(effect || "").trim();
    if (!text) return [`<span class="ac-none">No effect.<br>Only the turn order matters.</span>`];
    return text.split("+").map((part) => {
      const p = part.trim();
      let m;
      if ((m = p.match(/^(\d+)\s*coins?$/i))) return `<span class="ac-big">${m[1]}</span>${resourceIcon("coins", "coins")}`;
      if ((m = p.match(/^(\d+)\s*XP$/i))) return `<span class="ac-big">${m[1]}</span>${resourceIcon("xp", "XP")}`;
      if (/Draft (a )?Quest/i.test(p)) return `<span class="ac-scroll"></span>Take a Quest`;
      if (/Activate all/i.test(p)) return `${resourceIcon("activation", "Activation")} Activate all`;
      if (/Activate a single/i.test(p)) return `${resourceIcon("activation", "Activation")} Activate 1 card`;
      if ((m = p.match(/Free level up to (\d+)/i))) return `<span class="ac-big">${m[1]}</span> free upgrades`;
      if (/free level up/i.test(p)) return `<span class="ac-big">1</span> free upgrade`;
      return formatGameText(p);
    });
  }

  function action(card, opts = {}) {
    const lines = actionLines(card.effect);
    return `<div class="acard ${opts.cls || ""}">
      <div class="ac-page">
        <div class="ac-head"><span class="ac-label">Chapter</span><span class="ac-num">${card.number}</span></div>
        <div class="ac-rule"></div>
        <div class="ac-effect">${lines.map((l) => `<div class="ac-line">${l}</div>`).join(`<div class="ac-and">&amp;</div>`)}</div>
        <div class="ac-foot">~ ${card.number} ~</div>
      </div>
    </div>`;
  }

  window.CardFace = { common, legendary, item, quest, character, action };
})();

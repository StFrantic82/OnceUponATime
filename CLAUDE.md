# Once Upon a Time — handoff notes for Claude

Board game by **Simone Luciani & Matthieu Verdier**: vanilla-JS web app + Print & Play.
The owner (Matthieu) writes in French: **always answer in French**.

- Repo: `StFrantic82/OnceUponATime`, cloned at `/home/claude/OnceUponATime`
- Live site: https://stfrantic82.github.io/OnceUponATime/
- Claude artifact: slug `4f6794dc-7dd7-45c5-bee3-28b919e22270` (latest version `1795851865-bbc0`; re-read it with get_artifact before publishing)
- Google Sheets (must stay **entirely in English**):
  - V1: `1-T5ociuEKVqO3t9nZMQV-LYTBJ7Qmrsi1pC6fGH-Mxs`
  - V2: "Once Upon a Time V2 - Game content", `1I0M8sJbO7hwBeb40rQc9wplDB-KVwD55MgUSQRxak4s` (Drive folder `1B9dbphjQRivOuOpu5R_Fvwc5KFg3XXjL`)
  - Tabs: Overview, Assumptions, Commons, Legendaries, Items, Adventures, Writers, Chapter cards, Groups per round, Iconography.
  - V2 Legendaries tab: names in A (row 2 = L1 Snow White … row 38 = L37 The Hunter, same order as `gen.py`), tags D–I, base type/text J–K, upgrade cost L, upgrade type/text M–N, sim edge AI, sim VP AJ, upgrade type AL, branch alternative AM, second upgrade cost AN, second upgrade text AO.

## Two versions

- **V1** (repo root): single-card offer, 12 rounds, 15 Chapter cards (1–15).
- **V2** (`v2/`, the version under development): lots of 1–2 cards, 8 rounds, 12 chapters, families of Commons, Legendaries with signature effects.
- The site's first page is a version chooser (`version-pick.js`); skipped with `?room`, `?local` or `?v1`.

## Standing instructions (always apply)

- After any change: **commit + push to GitHub AND publish the artifact**.
- On card changes regenerate everything: Print & Play FR/EN/IT, box PNGs (V1 and V2), and the Google Sheet.
- Change things everywhere in FR/EN/IT: cards, rules, tutorial, presentation.
- Legendaries must have an upgrade; an upgraded effect is **added** to the base effect.
- Only Bad cards have mean effects. Villains are weird/mean but give fewer VP.
- No "max X" caps (use rates, pairs, tiers). No memory effects, nothing untrackable.
- Card texts = gameplay only, no lore. No repeatable Tag-token sources.
- The Beast keeps the Belle allusion. Ages 14+, 40 min, 2–4 players.
- Card layout: effect-type icon at the LEFT, text at the right, one row per effect. Good/Bad/Neutral = round icon top-right of the name band. Multi-copy cards show "(×N)". Tags 29 px.
- The words Good/Bad/Neutral in texts are replaced by the icon, and the word card/carte/carta next to them is dropped.
- Don't sanitize Legendaries: their personality makes the gameplay.
- **Effects that depend on player count must scale** ("1 coin per player", "1 VP per opponent").
- **Don't add effects that change how Chapter cards are played / turn order** (only the Queen of Hearts does). Effects *triggered* by the value of the Chapter played are welcome (combo, no rule change).
- **Branching upgrades must oppose different kinds** of effect (one scoring vs one Instant vs one Ongoing/Activation), never two scorings. Avoid cards with several scorings on different things.
- **Tag ⇒ gameplay style** (V2): Charm = families & Good/Bad cards, Strength = direct VP, Cunning (Dexterity) = coins, Intelligence = Items, Adventures & Chapter cards, Magic (Sorcery) = XP.
- Commit messages end with:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01SHozX5dmscNspSziz6ubYi
  ```
  (use the attribution lines given by the current session if they differ)

## Workflow

```bash
cd /home/claude/OnceUponATime
(nohup python3 -m http.server 8765 >/dev/null 2>&1 &)        # local server for checks

# V2 data: tools/v2/gen.py is the SOURCE OF TRUTH for V2 cards (writes v2/game-data.js + FR/IT rows)
cd v2 && cp ../i18n-cards.js i18n-cards.js && python3 ../tools/v2/gen.py && cd ..

# V2 balance: simulations then report (bal.py reads /tmp/v*_a.json)
for n in 2 3 4; do python3 tools/v2/sim.py $n 400 /tmp/v${n}_a.json & done; wait
(cd /home/claude && python3 OnceUponATime/tools/v2/bal.py > /tmp/v2bal.txt)     # bal.py must run from /home/claude; "edge" = win-rate edge in points; aim within about ±6

# Checks
python3 tools/checks/fxcheck.py               # card text overflow, V1 + V2 app
python3 tools/checks/fx2.py fr                # screenshots of upgrade2/branch Legendaries
python3 tools/checks/pchk.py                  # overflow on V2 print page FR/EN/IT
python3 tools/v2/test4.py; python3 tools/v2/test6.py   # full UI games (expect "errors []")
python3 tools/v2/test_tuto.py fr              # tutorial game: lists the coach steps shown

# Print & Play (then compress)
python3 tools/v2/make_pdf.py fr en it         # V2 -> v2/pnp/
python3 tools/v1/make_pdf.py fr en it         # V1 -> pnp/
for f in v2/pnp/*.pdf pnp/*.pdf; do qpdf --compress-streams=y --object-streams=generate --recompress-flate "$f" /tmp/q.pdf && mv /tmp/q.pdf "$f"; done
# Box PNGs: V1 tools/checks/bx.py LANG (-> /tmp, copy to box/), V2 tools/checks/bx2.py LANG (-> v2/box/)

# Cache busting: bump ?v=N in html (root currently v=217, v2 currently v=324)
sed -i 's/?v=324/?v=325/g' v2/*.html

# Git
git add -A && git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -q -m "..." && git -c push.negotiate=true push -q origin main
```

Artifact: `mcp__claude-artifacts__publish_files`, mode `patch`, `base_version` = latest version; send the changed js/css plus all html files of the version touched (root and/or v2) and box PNGs if changed. Served paths mirror the repo (`v2/app.js`, `app.js`, …).

Scripts in `tools/` have absolute paths `/home/claude/OnceUponATime/...` — clone the repo there.

## V2 engine key points (v2/app.js)

- `const V2 = Boolean(DATA.v2)`; generic effect vocabulary parsed from card text: `clausesOf`, `v2Count`, `v2Do`, `v2EndValue`, `v2ScoreCards`, `familyScore`, `activeCardText`.
- Upgrades: `isMaxed`, `chosenUpgrade`, `upgradesText`, `stepCost`, `upgradeCost`, `completeUpgrade`, `chooseBranch` (human: choice `branch <id> a|b`; bot: compares scoring vs rough worth), `upgradeInstant` (an Instant printed on an upgrade fires when chosen).
- Card fields: `upgrade`, optional `upgrade2` (second step, 3 rows) or `upgradeAlt` (branch); state `upgraded`, `upgraded2`, `branch`.
- Chapter-value triggers in the "Pinocchio set" block (~line 1576): Briar Rose ≤4 → 2 XP, Pinocchio ≥10 → 1 VP, Cheshire even → 1 XP, Wizard of Oz 5–8 → 2 coins; Mad Hatter (lowest chapter → 1 VP per opponent) near line 484.
- `v2AfterGroup`: Prince Charming, Peter Pan (2 coins per Lost Boy taken), Wendy.
- V1 name literals inside v2 code are disabled with a "§" prefix.

## Current V2 Legendaries with special upgrades

- Double upgrade: Mad Hatter, Tinker Bell, Wendy (2nd step 5 XP), Puss in Boots, Pinocchio (2nd 4 XP), The Hunter.
- Branch: Snow White (pairs of Good / take 1 Dwarf from the Common deck), Alice (2 VP per Adventure / take 1 Adventure), Robin Hood (2 VP per Merry Man / Activation 1 coin), Belle (1 VP per Intelligence / Items cost 1 less), Dorothy (1 coin per different family / Activation 1 XP).

## Open points / last balance notes (1 500 sims)

- Strong outliers to watch: Undersea Throne item (+14.5, now Intelligence), Geppetto (+9), Pumpkin Carriage, Mad Hatter's Hat (+9), Rumpelstiltskin (+8.7), Poisoned Apple (+8.7), Grandmother (+7.6), Evil Sorcerer (+6.6, upgrade 3 VP per set of 5 icons, cost 4).
- Weak: Peter Pan (−5.8, upgrade lowered to 2 XP, not re-simulated), Rabbit's Clock, The Hunter, Stepmother, Carlo Collodi writer (−7.6 after "1 coin per player").
- Remaining tag-style exceptions kept on purpose: Queen of Hearts (turn order), Briar Rose (Charm, gives XP), Belle (Intelligence, gives XP), Snow White (Charm, XP per pair of Dwarves).
- Done 2026-11-28: V2 box PNGs (`v2/box/`, linked from v2/box.js); V2 tutorial reviewed FR/EN/IT (families, Good/Bad, second star row, unplaced XP order, end of round) with new coach steps `freeUp`, `branch`, `choice` (home.js + i18n.js).
- Balance 2026-11-28 (1 200 sims): Peter Pan −0.3 and Geppetto −0.8 now fine. Outliers: Rumpelstiltskin +10.6, Grandmother +10.2, Undersea Throne +9.3, Poisoned Apple +9.1, Genie/Pinocchio/Evil Fairy ≈ +8.3; weak: Stepmother −7.9, Snow White/Sheriff −5.3, Briar Rose −5.0. Adventures: The Final Wish +12.6, The Apple's Bite +9.1, The House of Seven +8.2, The Marquis of Carabas −6.9. Writers: Andersen −4.5.
- Not done yet: rebalancing the outliers above, some app UI labels still show Good/Bad words, `test_rules_app` blocked by the version chooser.

import sys
from playwright.sync_api import sync_playwright
# Plays a full tutorial game and lists the coach steps shown (V2). Usage: test_tuto.py [fr|en|it]
url = "file:///home/claude/OnceUponATime/v2/index.html"
lang = sys.argv[1] if len(sys.argv) > 1 else "fr"
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1440, "height": 900})
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: m.type == "error" and errs.append(m.text))
    pg.goto(url); pg.evaluate(f"localStorage.setItem('ouat-lang','{lang}')"); pg.reload(); pg.wait_for_timeout(500)
    pg.evaluate("Bot.delay=5")
    pg.click("#tutoBtn"); pg.wait_for_timeout(300)
    seen = []
    for r in range(400):
        if pg.evaluate("Game.G.gameOver"): break
        if pg.locator("#coach:not([hidden])").count():
            seen.append(pg.locator("#coach b").inner_text())
            pg.click("#coach [data-coach=ok]"); pg.wait_for_timeout(40); continue
        if pg.evaluate("Game.state.tuckPending>0"): pg.locator("#actionHand .tucking").first.click(); pg.wait_for_timeout(40); continue
        ph = pg.evaluate("Game.state.phase")
        if pg.locator("[data-choice]").count(): pg.locator("[data-choice]").first.click(); pg.wait_for_timeout(40); continue
        if pg.evaluate("(Game.state.activatePending||0)>0"): pg.locator(".needs-click").first.click(); pg.wait_for_timeout(40); continue
        if pg.locator(".confirm-overlay [data-yes]").count(): pg.click(".confirm-overlay [data-yes]"); continue
        if pg.locator("[data-upgrade]").count(): pg.locator("[data-upgrade]").first.click(); pg.wait_for_timeout(40); continue
        if ph == "chooseWriter": pg.locator("[data-writer]").first.click()
        elif ph == "chooseAction":
            # prefer low chapters to trigger free upgrades and choices
            bt = pg.locator("#actionHand button:not([disabled])"); bt.nth(bt.count() - 1 if r % 2 else 0).click()
        elif ph == "chooseGroup": pg.locator("[data-group]:not([disabled])").first.click()
        elif ph == "buyItem":
            bi = pg.locator("[data-item]:not([disabled])")
            if bi.count(): bi.first.click()
            if pg.locator("#resolveActionBtn:not([disabled])").count(): pg.click("#resolveActionBtn")
        elif ph == "roundDone":
            while pg.locator("[data-quest]").count(): pg.locator("[data-quest]").first.click(); pg.wait_for_timeout(30)
            if pg.locator("#endRoundBtn:not([disabled])").count(): pg.click("#endRoundBtn")
        pg.wait_for_timeout(60)
    print(lang, "over", pg.evaluate("Game.G.gameOver"))
    print("steps", seen)
    print("errors", errs[:5])
    b.close()

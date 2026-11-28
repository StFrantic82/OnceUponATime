from playwright.sync_api import sync_playwright
url="file:///home/claude/OnceUponATime/index.html?v1"
def play(pg, maxr=40):
    for r in range(maxr*4):
        if pg.evaluate("Game.G.gameOver"): return r
        if pg.evaluate("Game.state.tuckPending>0"): pg.locator("#actionHand .tucking").first.click(); pg.wait_for_timeout(40); continue
        ph=pg.evaluate("Game.state.phase")
        if pg.locator("[data-choice]").count(): pg.locator("[data-choice]").first.click(); pg.wait_for_timeout(40); continue
        if pg.evaluate("(Game.state.activatePending||0)>0"): pg.locator(".needs-click").first.click(); pg.wait_for_timeout(40); continue
        if pg.locator(".confirm-overlay [data-yes]").count(): pg.click(".confirm-overlay [data-yes]"); continue
        if ph=="chooseWriter": pg.locator("[data-writer]").first.click()
        elif ph=="chooseAction": pg.locator("#actionHand button:not([disabled])").first.click()
        elif ph=="chooseGroup": pg.locator("[data-group]:not([disabled])").first.click()
        elif ph=="buyItem":
            b=pg.locator("[data-item]:not([disabled])")
            if b.count(): b.first.click()
            if pg.locator("#resolveActionBtn:not([disabled])").count(): pg.click("#resolveActionBtn")
        elif ph=="roundDone":
            while pg.locator("[data-quest]").count(): pg.locator("[data-quest]").first.click(); pg.wait_for_timeout(30)
            if pg.locator("#endRoundBtn:not([disabled])").count(): pg.click("#endRoundBtn")
        pg.wait_for_timeout(60)
    return -1
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={"width":1440,"height":900})
    errs=[]; pg.on("pageerror",lambda e: errs.append(str(e))); pg.on("console", lambda m: m.type=="error" and errs.append(m.text))
    pg.goto(url); pg.wait_for_timeout(400)
    pg.evaluate("Bot.delay=5")
    pg.click("[data-players='4']"); pg.click("[data-level=hard]"); pg.click("#startBtn"); pg.wait_for_timeout(300)
    pg.screenshot(path="/home/claude/m_start.png")
    n=play(pg); print("steps",n,"over",pg.evaluate("Game.G.gameOver"))
    pg.wait_for_timeout(300)
    print(pg.evaluate("Game.G.results.map(r=>r.name+':'+r.total+' (q'+r.questTotal+' c'+r.cardTotal+' w'+r.writerTotal+' b'+r.base+')').join(' | ')"))
    pg.screenshot(path="/home/claude/m_recap.png")
    print("errors",errs[:5])
    b.close()

from playwright.sync_api import sync_playwright
import importlib.util,sys
url="file:///home/claude/OnceUponATime/v2/index.html"
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={"width":1440,"height":900})
    errs=[]; pg.on("pageerror",lambda e: errs.append(str(e)))
    pg.goto(url); pg.evaluate("localStorage.setItem('ouat-lang','fr')"); pg.reload(); pg.wait_for_timeout(400)
    pg.evaluate("Bot.delay=5")
    pg.click("[data-players='2']"); pg.click("#startBtn"); pg.wait_for_timeout(300)
    for i in range(30):
        if pg.evaluate("Game.state.phase")=="chooseWriter": pg.locator("[data-writer]").first.click(); pg.wait_for_timeout(200)
        else: break
    print(pg.evaluate("""()=>{const s=Game.state;const D=window.GAME_DATA;
      const sw={...D.legendary.find(c=>c.name==='Snow White'),id:'TSW'};const pu={...D.legendary.find(c=>c.name==='Puss in Boots'),id:'TPU'};
      s.tableau.push(sw,pu);s.xp=20;return s.phase}"""))
    pg.evaluate("Game.render ? Game.render() : null")
    pg.evaluate("Game.dispatch(Game.view.seat,'placeXp','TSW')")
    for i in range(6): pg.evaluate("Game.dispatch(Game.view.seat,'placeXp','TSW')"); pg.wait_for_timeout(80)
    pg.wait_for_timeout(300)
    print("choices", pg.evaluate("JSON.stringify(Game.state.choices)"), pg.locator("[data-choice]").count())
    pg.screenshot(path="/tmp/br1.png")
    if pg.locator("[data-choice]").count(): pg.locator("[data-choice]").nth(1).click(); pg.wait_for_timeout(200)
    print("branch", pg.evaluate("Game.state.tableau.find(c=>c.id==='TSW').branch"))
    for i in range(6): pg.evaluate("Game.dispatch(Game.view.seat,'placeXp','TPU')"); pg.wait_for_timeout(80)
    print("puss", pg.evaluate("JSON.stringify((({upgraded,upgraded2,xpOn})=>({upgraded,upgraded2,xpOn}))(Game.state.tableau.find(c=>c.id==='TPU')))"), pg.evaluate("Game.state.xp"))
    pg.screenshot(path="/tmp/br2.png", full_page=True)
    b.close(); print(errs)

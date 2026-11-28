from playwright.sync_api import sync_playwright
base="http://localhost:8765/index.html?local"
import subprocess, time
srv=subprocess.Popen(["python3","-m","http.server","8765"],cwd="/home/claude/OnceUponATime",stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(1)
def click(pg, sel): pg.evaluate("s=>document.querySelector(s)?.click()", sel)
def step(pg):
    if pg.locator(".confirm-overlay [data-yes]").count(): click(pg,".confirm-overlay [data-yes]"); return
    if pg.evaluate("Game.state.tuckPending>0"): click(pg,"#actionHand .tucking"); return
    if pg.locator("[data-choice]").count(): click(pg,"[data-choice]"); return
    if pg.evaluate("(Game.state.activatePending||0)>0"): click(pg,".needs-click"); return
    ph=pg.evaluate("Game.state.phase")
    if ph=="chooseWriter": click(pg,"[data-writer]")
    elif ph=="chooseAction": click(pg,"#actionHand button:not([disabled])")
    elif ph=="chooseGroup": click(pg,"[data-group]:not([disabled])")
    elif ph=="buyItem": click(pg,"#resolveActionBtn")
    elif ph=="roundDone":
        if pg.locator("[data-quest]").count(): click(pg,"[data-quest]")
        else: click(pg,"#endRoundBtn")
try:
  with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={"width":1300,"height":850})
    errs=[]
    host=ctx.new_page(); host.on("pageerror",lambda e: errs.append("H "+str(e)))
    host.goto(base); host.wait_for_timeout(400)
    host.evaluate("Bot.delay=10")
    host.click("[data-mode=online]"); host.fill("#pname","Matthieu"); host.click("[data-players='3']")
    host.click("#createBtn"); host.wait_for_timeout(600)
    code=host.locator("#lobbyCode").inner_text(); link=host.locator("#lobbyLink").input_value()
    print("code",code,"link",link)
    guest=ctx.new_page(); guest.on("pageerror",lambda e: errs.append("G "+str(e)))
    guest.goto(link); guest.wait_for_timeout(500)
    print("guest join code prefilled:", guest.locator("#joinCode").input_value())
    guest.fill("#pname","Léa"); guest.click("#joinBtn"); guest.wait_for_timeout(600)
    host.wait_for_timeout(300)
    print("host lobby members:", host.locator("#lobbyMembers").inner_text().replace("\n"," | "))
    host.screenshot(path="/home/claude/o_lobby.png")
    host.click("#lobbyStart"); host.wait_for_timeout(800)
    print("guest role", guest.evaluate("Game.view.role"), "seat", guest.evaluate("Game.view.seat"), "players", guest.evaluate("Game.G.players.map(p=>p.name+':'+p.kind).join(',')"))
    for i in range(1500):
        if host.evaluate("Game.G.gameOver"): break
        step(host); step(guest); host.wait_for_timeout(40)
        if i==40: guest.screenshot(path="/home/claude/o_guest.png")
    host.wait_for_timeout(500)
    print("over host", host.evaluate("Game.G.gameOver"), "guest", guest.evaluate("Game.G.gameOver"), "iters", i)
    print(host.evaluate("Game.G.results.map(r=>r.name+':'+r.total).join(' | ')"))
    guest.screenshot(path="/home/claude/o_guest_end.png")
    print("errors", errs[:5])
    b.close()
finally:
    srv.terminate()

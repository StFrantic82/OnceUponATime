from playwright.sync_api import sync_playwright
import statistics, json
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page()
    pg.goto("file:///home/claude/OnceUponATime/index.html"); pg.wait_for_timeout(300)
    for n,R in [(2,9),(4,9),(4,8),(5,8)]:
        tops=[]; avgs=[]; rounds=[]; legs=[]; cardpts=[]
        for g in range(4):
            pg.evaluate(f"Bot.delay=0; Game.newGame({{players:{n}, level:'hard', writerMode:'random', rounds:{R}}}, Array.from({{length:{n}}},(_,i)=>({{name:'B'+i,kind:'bot'}})))")
            for i in range(400):
                pg.wait_for_timeout(15)
                if pg.evaluate("Game.G.gameOver"): break
            r=pg.evaluate("({res:Game.G.results.map(r=>[r.total,r.cardTotal]), round:Game.G.round, leg:Game.G.players.map(p=>p.tableau.filter(c=>c.deck==='legendary').length)})")
            tops.append(r['res'][0][0]); avgs.append(statistics.mean(x[0] for x in r['res'])); rounds.append(r['round']); legs.append(statistics.mean(r['leg'])); cardpts.append(statistics.mean(x[1] for x in r['res']))
        print(f"{n}p/{R}r rounds={set(rounds)} winner≈{statistics.mean(tops):.0f} avg≈{statistics.mean(avgs):.0f} cardEffects≈{statistics.mean(cardpts):.0f} legendaries/player≈{statistics.mean(legs):.1f}")
    b.close()

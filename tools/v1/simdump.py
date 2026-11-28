import asyncio, json, sys
from playwright.async_api import async_playwright
n_players=int(sys.argv[1]); games=int(sys.argv[2]); out=sys.argv[3]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page()
        await pg.goto("file://"+__import__("os").environ.get("OUAT","/home/claude/OnceUponATime")+"/index.html"); await pg.wait_for_timeout(500)
        res=await pg.evaluate(f"""(async()=>{{const out=[];for(let i=0;i<{games};i++){{const g=await Game.simulateGame({{players:{n_players},level:'hard'}});out.push({{rounds:g.rounds,players:g.players.map(p=>{{const c={{...p}};delete c.curve;return c}})}})}};return out}})()""")
        json.dump(res,open(out,'w'))
        await b.close()
asyncio.run(main())

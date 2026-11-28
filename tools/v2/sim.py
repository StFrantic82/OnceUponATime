import asyncio, json, sys
from playwright.async_api import async_playwright
n=int(sys.argv[1]); games=int(sys.argv[2]); out=sys.argv[3]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(); logs=[]
        pg.on("console", lambda m: logs.append(m.text) if m.type in ("warning","error") else None)
        pg.on("pageerror", lambda e: logs.append("ERR "+str(e)))
        await pg.goto("file:///home/claude/OnceUponATime/v2/index.html"); await pg.wait_for_timeout(500)
        res=await pg.evaluate(f"""(async()=>{{const out=[];for(let i=0;i<{games};i++){{const g=await Game.simulateGame({{players:{n},level:'hard'}});out.push({{rounds:g.rounds,players:g.players.map(p=>{{const c={{...p}};delete c.curve;return c}})}})}};return out}})()""")
        json.dump(res,open(out,'w')); 
        if logs: print(sorted(set(logs))[:8])
        await b.close()
asyncio.run(main())

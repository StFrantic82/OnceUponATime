import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(); errs=[]
        pg.on("pageerror",lambda e: errs.append(str(e)))
        await pg.goto("file:///home/claude/OnceUponATime/index.html?v1"); await pg.wait_for_timeout(800)
        for n in [2,4]:
            r=await pg.evaluate(f"""(async()=>{{const out=[];for(let i=0;i<20;i++){{out.push(await Game.simulateGame({{players:{n},level:'hard',rounds:9}}))}};return out}})()""")
            import json
            tot=[[pl.get('total',pl.get('score')) for pl in g['players']] for g in r]
            ok=[g['rounds'] for g in r]
            print(n,'rounds',set(ok),'winner avg',round(sum(max(t) for t in tot)/len(tot),1),'avg',round(sum(sum(t)/len(t) for t in tot)/len(tot),1), list(r[0]['players'][0].keys()))
        print(errs); await b.close()
asyncio.run(main())

import asyncio, json, statistics as st
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page()
        await pg.goto("file:///home/claude/OnceUponATime/index.html"); await pg.wait_for_timeout(500)
        r=await pg.evaluate("""(async()=>{const out=[];for(let i=0;i<300;i++){out.push(await Game.simulateGame({players:4,level:'hard',rounds:9}))};return out})()""")
        tot=[[pl['total'] for pl in g['players']] for g in r]
        pls=[pl for g in r for pl in g['players']]
        print('winner',round(st.mean(max(t) for t in tot),1),'avg',round(st.mean(st.mean(t) for t in tot),1))
        print('writer lvl3 %',round(100*sum(pl['writerLevel']==3 for pl in pls)/len(pls)),'lvl2+ %',round(100*sum(pl['writerLevel']>=2 for pl in pls)/len(pls)))
        print('upgraded per player',round(st.mean(pl['upgradedCount'] for pl in pls),2),'legendaries',round(st.mean(pl['legendaryCount'] for pl in pls),2),'xp left',round(st.mean(pl['xpLeft'] for pl in pls),2))
        print('writer pts',round(st.mean(pl['writerPts'] for pl in pls),1),'cards',round(st.mean(pl['cards'] for pl in pls),1),'quests',round(st.mean(pl['quests'] for pl in pls),1))
        await b.close()
asyncio.run(main())

from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page()
    pg.goto("file:///home/claude/OnceUponATime/v2/index.html"); pg.wait_for_timeout(600)
    for lang in ["fr","it"]:
        r=pg.evaluate("""(lang)=>{I18N.setLang(lang,false);const D=window.GAME_DATA;const out=[];
          const chk=(n,t)=>{if(t&&tc(t)===t)out.push(n+' | '+t)};
          for(const c of D.legendary){chk(c.name,c.base);chk(c.name,c.upgrade.replace(/^Cost \\d+ XP\\. /,''));chk(c.name,c.name)}
          for(const c of D.items){chk(c.name,c.effect);chk(c.name,c.name)}
          for(const c of D.common){chk(c.name,c.effect)}
          for(const q of D.quests){chk(q.name,q.scoring)}
          return [...new Set(out)]}""",lang)
        print(lang,len(r)); [print("  ",x[:150]) for x in r[:20]]
    b.close()

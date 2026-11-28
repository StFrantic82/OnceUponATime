from playwright.sync_api import sync_playwright
import sys
lang=sys.argv[1] if len(sys.argv)>1 else 'fr'
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={"width":1500,"height":1050}, device_scale_factor=1.5); errs=[]
    pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto("http://localhost:8765/v2/index.html"); pg.evaluate(f"localStorage.setItem('ouat-lang','{lang}')"); pg.reload(); pg.wait_for_timeout(1000)
    r=pg.evaluate("""()=>{const D=window.GAME_DATA;const d=document.createElement('div');d.id='tst';d.style.cssText='position:fixed;left:0;top:0;z-index:9999;background:#fff;padding:10px;display:flex;flex-wrap:wrap;gap:8px;width:1480px';
      const L=D.legendary.filter(c=>c.upgrade2||c.upgradeAlt);L.forEach(c=>d.innerHTML+=CardFace.legendary(c));
      const u={...L.find(c=>c.upgradeAlt),upgraded:true,branch:'b'};d.innerHTML+=CardFace.legendary(u);
      const v={...L.find(c=>c.upgrade2),upgraded:true,xpOn:1};d.innerHTML+=CardFace.legendary(v);
      document.body.appendChild(d);
      return [...d.querySelectorAll('.fcard')].map(c=>{const bad=[...c.querySelectorAll('.fc-side')].filter(t=>t.scrollHeight>t.clientHeight+1).length; const art=c.querySelector('.fc-art').getBoundingClientRect().height; return c.querySelector('.fc-name')?.textContent.trim()+' art='+Math.round(art)+(bad?' OVERFLOW':'')})}""")
    print("\n".join(r))
    pg.wait_for_timeout(400); pg.locator('#tst').screenshot(path=f'/tmp/fx2-{lang}.png')
    print(errs); b.close()

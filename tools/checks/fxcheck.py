from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={"width":1500,"height":1050}, device_scale_factor=1.3); errs=[]
    pg.on("pageerror",lambda e:errs.append(str(e)))
    for ver,path in [('v1','index.html?v1'),('v2','v2/index.html')]:
        pg.goto("http://localhost:8765/"+path); pg.evaluate("localStorage.setItem('ouat-lang','fr')"); pg.reload(); pg.wait_for_timeout(1000)
        pg.evaluate("""()=>{const D=window.GAME_DATA;const d=document.createElement('div');d.id='tst';d.style.cssText='position:fixed;left:0;top:0;z-index:9999;background:#fff;padding:10px;display:flex;flex-wrap:wrap;gap:8px;width:1480px';
          const L=D.legendary;[L[0],L[8],L[21],L[23]].forEach(c=>d.innerHTML+=CardFace.legendary(c));
          [D.common[0],D.common[14],D.common[44]].forEach(c=>d.innerHTML+=CardFace.common(c));
          [D.items[0],D.items[12]].forEach(c=>d.innerHTML+=CardFace.item(c));
          document.body.appendChild(d)}""")
        pg.wait_for_timeout(400); pg.locator('#tst').screenshot(path=f'/tmp/fx-{ver}.png')
        allc=pg.evaluate("""()=>{const D=window.GAME_DATA;const d=document.createElement('div');d.id='all';d.style.cssText='position:absolute;left:0;top:2000px;display:flex;flex-wrap:wrap;width:3000px';
          for(const c of D.legendary) d.innerHTML+=CardFace.legendary(c); for(const c of D.common) d.innerHTML+=CardFace.common(c); for(const c of D.items) d.innerHTML+=CardFace.item(c);
          document.body.appendChild(d); return [...d.querySelectorAll('.fc-text,.fc-side')].filter(t=>t.scrollHeight>t.clientHeight+1).map(t=>t.closest('.fcard').querySelector('.fc-name,.fc-title,h3,header')?.textContent||'?').slice(0,20)}""")
        print(ver,'overflow in app',allc)
    print(errs); b.close()

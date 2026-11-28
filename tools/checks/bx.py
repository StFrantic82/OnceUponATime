import sys
from playwright.sync_api import sync_playwright
lang=sys.argv[1] if len(sys.argv)>1 else "fr"
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={"width":2200,"height":1200},device_scale_factor=2); errs=[]
    pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto(f"file:///home/claude/OnceUponATime/box.html?lang={lang}"); pg.wait_for_timeout(1200)
    pg.add_style_tag(content=".box-face{--box-zoom:1}")
    pg.wait_for_timeout(300)
    pg.locator("#boxCover").screenshot(path=f"/tmp/cover-{lang}.png"); pg.locator("#boxBack").screenshot(path=f"/tmp/back-{lang}.png")
    print(errs, pg.evaluate("()=>{const t=document.querySelector('.scene-table');const b=document.querySelector('#boxBack');return [t.scrollWidth,t.clientWidth,t.scrollHeight,t.clientHeight,b.scrollHeight,b.clientHeight]}"))
    b.close()

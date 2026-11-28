import sys
from playwright.sync_api import sync_playwright
langs=sys.argv[1:] or ["fr"]
with sync_playwright() as p:
    b=p.chromium.launch()
    for lang in langs:
        pg=b.new_page(viewport={"width":900,"height":1200}); errs=[]
        pg.on("pageerror",lambda e: errs.append(str(e)))
        pg.goto(f"file:///home/claude/OnceUponATime/v2/print.html?lang={lang}")
        pg.wait_for_function("document.body.dataset.ready==='1'", timeout=60000)
        pg.wait_for_timeout(800)
        out=f"/home/claude/OnceUponATime/v2/pnp/once-upon-a-time-print-and-play-{lang}.pdf"
        pg.pdf(path=out, format="A4", print_background=True, prefer_css_page_size=True, margin={"top":"0","bottom":"0","left":"0","right":"0"})
        print(lang, "sheets:", pg.evaluate("document.querySelectorAll('.sheet').length"), errs)
        pg.close()
    b.close()

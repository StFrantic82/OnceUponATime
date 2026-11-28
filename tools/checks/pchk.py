from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch()
    for lang in ["fr","en","it"]:
        pg=b.new_page(viewport={"width":900,"height":1200})
        pg.goto(f"file:///home/claude/OnceUponATime/v2/print.html?lang={lang}")
        pg.wait_for_function("document.body.dataset.ready==='1'", timeout=60000); pg.wait_for_timeout(500)
        print(lang, pg.evaluate("""()=>[...document.querySelectorAll('.cell .fc-legendary')].flatMap(c=>{const r=c.getBoundingClientRect();const bad=[...c.querySelectorAll('.fc-side,.fc-branch')].filter(e=>{const q=e.getBoundingClientRect();return q.right>r.right-2||q.bottom>r.bottom-2||e.scrollHeight>e.clientHeight+1||e.scrollWidth>e.clientWidth+1});return bad.length?[c.querySelector('.fc-name').textContent.trim()]:[]})"""))
        if lang=="fr":
            el=pg.locator('.cell .fc-legendary.has-branch').first; el.screenshot(path='/tmp/pb1.png')
            pg.locator('.cell .fc-legendary.has-up2').first.screenshot(path='/tmp/pb2.png')
        pg.close()
    b.close()

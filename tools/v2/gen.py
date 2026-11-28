# Builds v2/game-data.js and the FR/IT rows of v2/i18n-cards.js from a small effect vocabulary.
import json, re, sys
ROOT = "/home/claude/OnceUponATime/v2/"
V1 = json.loads((lambda s: s[s.index('{'):s.rindex('}')+1])(open(ROOT + "../game-data.js").read()))

TAG = {"Charm": ("Charm", "Charm"), "Strength": ("Strength", "Strength"), "Dexterity": ("Dexterity", "Dexterity"), "Intelligence": ("Intelligence", "Intelligence"), "Sorcery": ("Sorcery", "Sorcery")}
# family key: (EN singular, EN plural/label, FR sing, FR plural, IT sing, IT plural)
FAM = {
  "dwarves": ("Dwarf", "Dwarves", "Nain", "Nains", "Nano", "Nani"),
  "soldiers": ("Playing Card Soldier", "Soldiers", "Soldat de cartes", "Soldats", "Soldato di carte", "Soldati"),
  "pirates": ("Pirate", "Pirates", "Pirate", "Pirates", "Pirata", "Pirati"),
  "merry": ("Merry Man", "Merry Men", "Joyeux Compagnon", "Joyeux Compagnons", "Allegro Compagno", "Allegri Compagni"),
  "mice": ("Mouse", "Mice", "Souris", "Souris", "Topolino", "Topolini"),
  "lostboys": ("Lost Boy", "Lost Boys", "Garçon perdu", "Garçons perdus", "Bimbo Sperduto", "Bimbi Sperduti"),
  "oz": ("Friend of Oz", "Friends of Oz", "Ami d’Oz", "Amis d’Oz", "Amico di Oz", "Amici di Oz"),
  "fairies": ("Fairy", "Fairies", "Fée", "Fées", "Fata", "Fate"),
  "stepsisters": ("Stepsister", "Stepsisters", "Demi-sœur", "Demi-sœurs", "Sorellastra", "Sorellastre"),
}

def res(kind, n, lang):
    return {"coins": "coin" if n == 1 else "coins", "xp": "XP", "vp": "VP"}[kind]

# ---- clause builders: each returns (en, fr, it) ----
def gain(*parts):  # parts: (n, kind)
    def j(lang):
        items = [f"{n} {res(k, n, lang)}" for n, k in parts]
        sep = {"en": " and ", "fr": " et ", "it": " e "}[lang]
        return sep.join(items)
    return (f"gain {j('en')}", f"gagnez {j('fr')}", f"ottieni {j('it')}")

THINGS = {  # key: (en, fr, it)  used after "for each"
  "item": ("Item", "Objet", "Oggetto"),
  "adventure": ("Adventure", "Aventure", "Avventura"),
  "good": ("Good card", "carte Gentille", "carta Buona"),
  "bad": ("Bad card", "carte Méchante", "carta Cattiva"),
  "upgraded": ("upgraded Legendary card", "carte Légendaire améliorée", "carta Leggendaria potenziata"),
  "set5": ("set of 5 different icons", "série de 5 icônes différentes", "set di 5 icone diverse"),
  "gbpair": ("Good–Bad pair of cards", "paire de cartes Gentille–Méchante", "coppia di carte Buona–Cattiva"),
  "legendary": ("Legendary card", "carte Légendaire", "carta Leggendaria"),
  "activation": ("card with an Activation effect", "carte à effet Activation", "carta con effetto Activation"),
  "goodpair": ("pair of Good cards", "paire de cartes Gentilles", "coppia di carte Buone"),
  "different": ("different icon", "icône différente", "icona diversa"),
}
def thing(key):
    if key in THINGS: return THINGS[key]
    if key.startswith("tag:"):
        t = key[4:]; return (f"{t} icon", f"icône {t}", f"icona {t}")
    if key.startswith("fam:"):
        f = FAM[key[4:]]; return (f[0], f[2], f[4])
    raise KeyError(key)

def per(n, kind, key):
    en, fr, it = thing(key)
    r = res(kind, n, "en")
    return (f"gain {n} {r} for each {en}", f"gagnez {n} {r} par {fr}", f"ottieni {n} {r} per ogni {it}")

TAKE_ADV = ("take 1 Adventure", "prenez 1 Aventure", "prendi 1 Avventura")
FREEUP = ("place XP on a Character so that it levels up", "placez de l’XP sur un Personnage pour qu’il passe un niveau", "piazza XP su un Personaggio perché salga di livello")
DRAW = ("draw 1 Chapter card, then put 1 Chapter card from your hand under your deck", "piochez 1 carte Chapitre, puis remettez 1 carte Chapitre de votre main sous votre pioche", "pesca 1 carta Capitolo, poi rimetti 1 carta Capitolo dalla tua mano sotto il tuo mazzo")
LOSE = ("each opponent loses 1 coin", "chaque adversaire perd 1 coin", "ogni avversario perde 1 coin")
STEAL_C = ("steal 1 coin from each opponent", "volez 1 coin à chaque adversaire", "ruba 1 coin a ogni avversario")
STEAL_VP = ("steal 1 VP from each opponent", "volez 1 VP à chaque adversaire", "ruba 1 VP a ogni avversario")
WRITER2 = ("place 2 XP on your Writer", "placez 2 XP sur votre Écrivain", "piazza 2 XP sul tuo Scrittore")
def spend(n, m, kind):
    c = "coin" if n == 1 else "coins"
    return (f"spend {n} {c} to gain {m} {res(kind, m, 'en')}", f"dépensez {n} {c} pour gagner {m} {res(kind, m, 'fr')}", f"spendi {n} {c} per ottenere {m} {res(kind, m, 'it')}")
def andc(a, b):
    return (f"{a[0]} and {b[0]}", f"{a[1]} et {b[1]}", f"{a[2]} e {b[2]}")

def eff(kind, body):
    lab = {"Instant": "Instant", "Activation": "Activation", "Ongoing": "Ongoing", "Game End": "Game End"}[kind]
    def cap(s): return s[0].upper() + s[1:] if s and not s[0].isdigit() else s
    return (f"{lab}: {body[0]}.", f"{lab} : {body[1]}.", f"{lab}: {body[2]}.")
def end_per(n, key):
    en, fr, it = thing(key)
    return (f"{n} VP for each {en}", f"{n} VP par {fr}", f"{n} VP per ogni {it}")
def end_flat(n):
    return (f"{n} VP", f"{n} VP", f"{n} VP")
def end_every2coins():
    return ("1 VP for every 2 coins", "1 VP toutes les 2 coins", "1 VP ogni 2 coins")
ONG_ITEMS = ("your Items cost 1 coin less", "vos Objets coûtent 1 coin de moins", "i tuoi Oggetti costano 1 coin in meno")
ONG_BUY = ("whenever you buy an Item, gain 1 VP", "chaque fois que vous achetez un Objet, gagnez 1 VP", "ogni volta che compri un Oggetto, ottieni 1 VP")

def fam_tiers(fam, counts, vps):
    f = FAM[fam]; a = " / ".join(map(str, counts)); b = " / ".join(map(str, vps))
    return (f"Game End: {a} {f[1]}: {b} VP.", f"Game End : {a} {f[3]} : {b} VP.", f"Game End: {a} {f[5]}: {b} VP.")
def fam_each(fam, n):
    f = FAM[fam]
    return (f"Game End: {n} VP for each {f[0]}.", f"Game End : {n} VP par {f[2]}.", f"Game End: {n} VP per ogni {f[4]}.")
def fam_pair(fam, n):
    f = FAM[fam]
    return (f"Game End: {n} VP for each pair of {f[1]}.", f"Game End : {n} VP par paire de {f[3]}.", f"Game End: {n} VP per ogni coppia di {f[5]}.")

def join(*cls):
    return tuple(" ".join(c[i] for c in cls) for i in range(3))

ROWS = []  # translation rows
def row(t):
    if t[0] and t not in ROWS: ROWS.append(t)
    return t[0]

# ---------------- Commons: families ----------------
commons = []
def add_common(name, fam, align, effect, scoring, copies=1):
    text = join(effect, scoring) if effect else scoring
    row(text)
    for _ in range(copies):
        commons.append({"id": f"C{len(commons)+1}", "deck": "common", "name": name, "alignment": align, "icons": "", "effect": text[0], "family": fam, "copy": 1})

add_common("Dwarf", "dwarves", "Good", eff("Activation", gain((1, "coins"))), fam_tiers("dwarves", [1, 3, 5, 7], [2, 6, 12, 20]), 7)
add_common("Playing Card Soldier", "soldiers", "Bad", eff("Instant", DRAW), fam_tiers("soldiers", [1, 2, 3, 4, 5], [1, 3, 6, 10, 15]), 7)
add_common("Pirate", "pirates", "Bad", eff("Instant", STEAL_C), fam_each("pirates", 1), 6)
add_common("The Merry Men", "merry", "Good", eff("Activation", spend(1, 1, "xp")), fam_tiers("merry", [1, 2, 3, 4], [2, 5, 9, 14]), 6)
add_common("Mice", "mice", "Good", eff("Instant", gain((1, "xp"))), fam_pair("mice", 5), 6)
add_common("The Lost Boys", "lostboys", "Good", eff("Instant", gain((2, "coins"))), fam_tiers("lostboys", [1, 2, 3, 4], [1, 4, 8, 12]), 6)
OZ = fam_tiers("oz", [2, 3, 4, 5, 6], [2, 5, 8, 12, 16])
add_common("Scarecrow", "oz", "Good", eff("Instant", gain((1, "xp"))), OZ)
add_common("The Tin Woodman", "oz", "Good", eff("Instant", gain((2, "coins"))), OZ)
add_common("The Cowardly Lion", "oz", "Good", eff("Instant", gain((1, "xp"))), OZ)
add_common("The Munchkins", "oz", "Good", eff("Activation", gain((1, "coins"))), OZ)
add_common("Wicked Witch of the North", "oz", "Good", eff("Instant", WRITER2), OZ)
add_common("Wicked Witch of the South", "oz", "Good", eff("Instant", WRITER2), OZ)
add_common("The Fairies", "fairies", "Good", eff("Activation", gain((1, "xp"))), fam_each("fairies", 2), 5)
add_common("Stepsister", "stepsisters", "Bad", eff("Instant", LOSE), fam_each("stepsisters", 2), 4)

# ---------------- Legendaries ----------------
leg = []
def tagsLead(tags):
    return ", ".join(f"{t} 1" for t in tags)
def add_leg(name, tags, align, base, cost, up, up2=None, alt=None):
    row(base); row(up)
    lead = tagsLead(tags)
    full = (f"{lead}. " if lead else "") + base[0]
    if lead:
        row(((f"{lead}. ") + base[0], (f"{lead}. ") + base[1], (f"{lead}. ") + base[2]))
    uptext = (f"Cost {cost} XP. " + up[0], f"Cost {cost} XP. " + up[1], f"Cost {cost} XP. " + up[2])
    row(uptext)
    card = {"id": f"L{len(leg)+1}", "deck": "legendary", "name": name, "rank": None, "alignment": align, "base": full, "upgrade": uptext[0], "upgraded": False}
    if alt:
        row(alt)
        alttext = tuple(f"Cost {cost} XP. " + alt[i] for i in range(3))
        row(alttext)
        card["upgradeAlt"] = alttext[0]
    if up2:
        c2, t2 = up2
        row(t2)
        t2text = tuple(f"Cost {c2} XP. " + t2[i] for i in range(3))
        row(t2text)
        card["upgrade2"] = t2text[0]
    leg.append(card)

G, B = "Good", "Bad"
I, A, O, E = "Instant", "Activation", "Ongoing", "Game End"
def T(en, fr, it): return (en, fr, it)
def two(a, b): return tuple(a[i] + " " + b[i] for i in range(3))
THINGS["differentfam"] = ("different family", "famille différente", "famiglia diversa")
add_leg("Snow White", ["Charm"], G, eff(A, T("gain 1 XP for each pair of Dwarves", "gagnez 1 XP par paire de Nains", "ottieni 1 XP per ogni coppia di Nani")), 4, eff(E, end_per(1, "goodpair")), alt=eff(I, T("take 1 Dwarf from the Common deck, then shuffle it", "prenez 1 Nain dans la pioche Commune, puis mélangez-la", "prendi 1 Nano dal mazzo Comune, poi mescolalo")))
add_leg("The Evil Queen", ["Charm"], B, eff(I, T("each opponent with more Charm icons than you loses 2 coins", "chaque adversaire qui a plus d’icônes Charm que vous perd 2 coins", "ogni avversario con più icone Charm di te perde 2 coins")), 3, eff(E, end_per(1, "tag:Charm")))
add_leg("Cinderella", ["Charm"], G, eff(E, end_per(2, "fam:mice")), 3, eff(E, T("4 VP if you have the fewest coins (ties included)", "4 VP si vous avez le moins de coins (égalités comprises)", "4 VP se hai meno coins di tutti (pareggi compresi)")))
add_leg("Fairy Godmother", ["Sorcery"], G, eff(I, FREEUP), 2, eff(A, gain((2, "xp"))))
add_leg("Prince Charming", ["Charm"], G, eff(O, T("whenever you take a Good Legendary card, gain 2 VP", "chaque fois que vous prenez une carte Légendaire Gentille, gagnez 2 VP", "ogni volta che prendi una carta Leggendaria Buona, ottieni 2 VP")), 3, eff(E, end_per(1, "tag:Charm")))
add_leg("Stepmother", ["Charm"], B, eff(I, T("each opponent with more Good cards than you loses 2 coins", "chaque adversaire qui a plus de cartes Gentilles que vous perd 2 coins", "ogni avversario con più carte Buone di te perde 2 coins")), 3, eff(E, end_per(2, "fam:stepsisters")))
add_leg("Alice", ["Intelligence"], G, eff(A, per(1, "coins", "adventure")), 3, eff(E, end_per(2, "adventure")), alt=eff(I, TAKE_ADV))
add_leg("Queen of Hearts", ["Strength"], B, eff(O, T("your Chapter cards count as +1 for turn order and you win ties", "vos cartes Chapitre valent +1 pour l’ordre du tour et vous gagnez les égalités", "le tue carte Capitolo valgono +1 per l’ordine di turno e vinci i pareggi")), 3, eff(E, end_per(2, "fam:soldiers")))
add_leg("Cheshire Cat", ["Dexterity", "Sorcery"], B, eff(O, T("whenever you play an even Chapter card, gain 1 XP", "chaque fois que vous jouez une carte Chapitre paire, gagnez 1 XP", "ogni volta che giochi una carta Capitolo pari, ottieni 1 XP")), 2, eff(E, T("counts as Good or Bad, as you prefer", "compte comme Gentil ou Méchant, au choix", "conta come Buono o Cattivo, a tua scelta")))
add_leg("Mad Hatter", ["Intelligence"], G, eff(O, T("whenever you play the lowest Chapter of the round, gain 1 VP per opponent", "chaque fois que vous jouez le plus petit Chapitre de la manche, gagnez 1 VP par adversaire", "ogni volta che giochi il Capitolo più basso del round, ottieni 1 VP per avversario")), 3, eff(E, end_flat(4)), up2=(3, eff(A, gain((1, "xp")))))
add_leg("Peter Pan", ["Dexterity"], G, eff(O, T("whenever you take a Lost Boy, gain 2 coins", "chaque fois que vous prenez un Garçon perdu, gagnez 2 coins", "ogni volta che prendi un Bimbo Sperduto, ottieni 2 coins")), 2, eff(E, end_per(2, "fam:lostboys")))
add_leg("Captain Hook", ["Dexterity"], B, eff(I, T("steal 2 coins from the opponent with the most coins", "volez 2 coins à l’adversaire qui en a le plus", "ruba 2 coins all’avversario che ne ha di più")), 3, eff(E, end_per(2, "fam:pirates")))
add_leg("Tinker Bell", ["Sorcery"], G, eff(E, T("counts as 1 card of the family of your choice", "compte comme 1 carte de la famille de votre choix", "conta come 1 carta della famiglia che scegli")), 2, eff(A, gain((1, "xp"))), up2=(3, eff(E, end_per(1, "fam:fairies"))))
add_leg("Wendy", ["Charm"], G, eff(O, T("the first time each round you take a Common character, gain 1 coin", "la première fois de chaque manche que vous prenez un personnage commun, gagnez 1 coin", "la prima volta in ogni round che prendi un personaggio comune, ottieni 1 coin")), 2, eff(A, gain((1, "vp"))), up2=(5, eff(E, end_per(1, "fam:lostboys"))))
add_leg("Robin Hood", ["Dexterity", "Strength"], G, eff(A, spend(1, 2, "vp")), 3, eff(E, end_per(2, "fam:merry")), alt=eff(A, gain((1, "coins"))))
add_leg("Sheriff of Nottingham", ["Dexterity"], B, eff(I, STEAL_C), 2, eff(A, T("each opponent with 4 coins or more gives you 1 coin", "chaque adversaire qui a 4 coins ou plus vous donne 1 coin", "ogni avversario con 4 coins o più ti dà 1 coin")))
add_leg("Little Red Riding Hood", ["Charm"], G, eff(O, T("the Bad effects of your opponents do not affect you", "les effets Méchants de vos adversaires ne vous touchent pas", "gli effetti Cattivi dei tuoi avversari non ti colpiscono")), 3, eff(E, end_per(1, "gbpair")))
add_leg("The Wolf", ["Strength", "Dexterity"], B, eff(I, T("steal 1 VP from each opponent with more Good cards than you", "volez 1 VP à chaque adversaire qui a plus de cartes Gentilles que vous", "ruba 1 VP a ogni avversario con più carte Buone di te")), 2, eff(E, end_per(1, "bad")))
add_leg("Grandmother", ["Charm"], G, eff(I, per(1, "coins", "bad")), 2, eff(E, end_per(1, "bad")))
add_leg("Little Mermaid", ["Intelligence"], G, eff(A, T("spend 1 XP to gain 2 VP", "dépensez 1 XP pour gagner 2 VP", "spendi 1 XP per ottenere 2 VP")), 3, eff(O, ONG_BUY))
add_leg("King Triton", ["Strength", "Sorcery"], G, eff(A, T("gain 1 VP for each pair of Strength icons", "gagnez 1 VP par paire d’icônes Strength", "ottieni 1 VP per ogni coppia di icone Strength")), 4, eff(E, end_per(1, "item")))
add_leg("The Sea Witch", ["Sorcery"], B, two(eff(I, gain((4, "xp"))), eff(E, T("lose 3 VP", "perdez 3 VP", "perdi 3 VP"))), 4, eff(E, end_per(1, "tag:Sorcery")))
add_leg("Belle", ["Intelligence"], G, eff(I, per(1, "xp", "tag:Intelligence")), 3, eff(E, end_per(1, "tag:Intelligence")), alt=eff(O, ONG_ITEMS))
add_leg("Beast", ["Strength"], B, eff(E, end_per(1, "tag:Strength")), 3, T("Becomes Good. Game End: 3 VP if you have Belle.", "Devient Gentille. Game End : 3 VP si vous avez Belle.", "Diventa Buona. Game End: 3 VP se hai Belle."))
add_leg("Aladin", ["Dexterity"], G, eff(I, TAKE_ADV), 3, eff(A, per(1, "coins", "different")))
add_leg("Genie", ["Sorcery"], G, eff(I, T("make 3 wishes: choose three times among 1 coin, 1 XP and 1 VP", "faites 3 vœux : choisissez trois fois parmi 1 coin, 1 XP et 1 VP", "esprimi 3 desideri: scegli tre volte tra 1 coin, 1 XP e 1 VP")), 3, eff(A, gain((2, "xp"))))
add_leg("Evil Sorcerer", ["Charm", "Strength", "Dexterity", "Intelligence", "Sorcery"], B, eff(I, LOSE), 4, eff(E, end_per(3, "set5")))
add_leg("Princess Jasmine", ["Intelligence"], G, eff(O, ONG_ITEMS), 4, eff(E, end_per(1, "item")))
add_leg("Dorothy Gale", ["Charm"], G, eff(E, end_per(1, "fam:oz")), 2, eff(I, per(1, "coins", "differentfam")), alt=eff(A, gain((1, "xp"))))
add_leg("The Wizard of Oz", ["Intelligence"], G, eff(O, T("whenever you play a Chapter card from 5 to 8, gain 2 coins", "chaque fois que vous jouez une carte Chapitre de 5 à 8, gagnez 2 coins", "ogni volta che giochi una carta Capitolo da 5 a 8, ottieni 2 coins")), 2, eff(E, end_per(2, "fam:oz")))
add_leg("Puss in Boots", ["Dexterity"], G, eff(I, gain((4, "coins"))), 2, eff(E, end_every2coins()), up2=(2, eff(A, gain((2, "coins")))))
add_leg("Rumpelstiltskin", ["Dexterity", "Sorcery"], B, eff(A, T("spend 1 XP to gain 3 coins", "dépensez 1 XP pour gagner 3 coins", "spendi 1 XP per ottenere 3 coins")), 3, eff(E, end_per(1, "bad")))
add_leg("Princess Briar Rose", ["Charm"], G, eff(O, T("whenever you play a Chapter card of 4 or lower, gain 2 XP", "chaque fois que vous jouez une carte Chapitre de 4 ou moins, gagnez 2 XP", "ogni volta che giochi una carta Capitolo di 4 o meno, ottieni 2 XP")), 2, eff(E, end_per(1, "fam:fairies")))
add_leg("The Evil Fairy", ["Sorcery"], B, eff(I, T("each opponent loses 1 coin and you gain 1 XP", "chaque adversaire perd 1 coin et vous gagnez 1 XP", "ogni avversario perde 1 coin e tu ottieni 1 XP")), 4, eff(E, end_per(1, "bad")))
add_leg("Pinocchio", ["Intelligence"], G, eff(O, T("whenever you play a Chapter card of 10 or higher, gain 1 VP", "chaque fois que vous jouez une carte Chapitre de 10 ou plus, gagnez 1 VP", "ogni volta che giochi una carta Capitolo di 10 o più, ottieni 1 VP")), 2, eff(E, end_per(1, "goodpair")), up2=(4, eff(E, end_flat(3))))
add_leg("Geppetto", ["Intelligence"], G, eff(A, T("gain 1 coin for each pair of Items", "gagnez 1 coin par paire d’Objets", "ottieni 1 coin per ogni coppia di Oggetti")), 4, eff(E, end_per(1, "item")))
add_leg("The Hunter", ["Strength"], G, eff(I, T("discard 1 Bad character from your tableau to gain 6 VP", "défaussez 1 personnage Méchant de votre tableau pour gagner 6 VP", "scarta 1 personaggio Cattivo dal tuo tableau per ottenere 6 VP")), 2, eff(E, end_per(1, "tag:Strength")), up2=(3, eff(A, gain((1, "coins")))))

# ---------------- Items ----------------
items = []
def add_item(name, cost, icons, effect, bad=False):
    if effect: row(effect)
    ic = ", ".join(f"{t} 1" for t in icons)
    if bad: ic = "Bad 1" + (", " + ic if ic else "")
    items.append({"id": f"I{len(items)+1}", "deck": "item", "name": name, "cost": cost, "icons": ic, "effect": effect[0] if effect else "", "copy": 1})
add_item("Enchanted Sword", 4, ["Strength"], eff(E, end_per(1, "tag:Strength")))
add_item("Puss’s Boots", 3, ["Dexterity"], eff(A, gain((1, "coins"))))
add_item("Wishing Ring", 5, ["Sorcery"], eff(E, end_per(2, "set5")))
add_item("Spellbook", 4, ["Intelligence"], eff(E, end_per(1, "tag:Intelligence")))
add_item("The Dwarves House", 3, ["Charm"], eff(E, end_per(1, "fam:dwarves")))
add_item("The Magic Mirror", 4, ["Sorcery"], eff(A, gain((1, "xp"))))
add_item("Poisoned Apple", 2, ["Strength"], eff(I, gain((2, "vp"))), bad=True)
add_item("Glass Slipper", 4, ["Charm"], eff(E, end_per(1, "tag:Charm")))
add_item("Mad Hatter's Hat", 6, ["Intelligence"], eff(I, TAKE_ADV))
add_item("Rabbit's Clock", 2, ["Intelligence"], eff(I, DRAW))
add_item("Long Bow", 5, ["Dexterity"], eff(A, gain((2, "coins"))))
add_item("Horn of Sherwood", 2, [], eff(E, end_per(1, "fam:merry")))
add_item("Pumpkin Carriage", 7, [], eff(I, andc(TAKE_ADV, gain((2, "coins")))))
add_item("Magic Wand", 4, ["Sorcery"], eff(I, FREEUP))
add_item("Fairy Dust", 3, ["Sorcery"], eff(I, gain((2, "xp"))))
add_item("Seashell", 2, ["Dexterity"], eff(I, gain((3, "coins"))))
add_item("Magic Lamp", 6, ["Sorcery"], eff(I, gain((4, "xp"))))
add_item("Enchanted Rose", 4, ["Sorcery"], eff(E, end_per(1, "upgraded")))
add_item("Pirate Ship", 3, ["Charm"], eff(E, end_per(1, "fam:pirates")))
add_item("The Book of Tales", 6, ["Charm", "Strength", "Dexterity", "Intelligence", "Sorcery"], None)
add_item("Enchanted Candelabra", 4, ["Sorcery"], eff(E, end_per(1, "tag:Sorcery")))
add_item("Stolen Purse", 2, ["Dexterity"], eff(I, STEAL_C), bad=True)
add_item("Trident", 4, ["Strength"], eff(A, gain((1, "vp"))))
add_item("Undersea Throne", 7, ["Intelligence"], eff(E, end_per(1, "item")))

# ---------------- Adventures ----------------
quests = []
def add_q(name, theme, sc):
    row(sc)
    quests.append({"id": f"Q{len(quests)+1}", "number": len(quests)+1, "name": name, "theme": theme, "scoring": sc[0]})
def tag_tiers(t):
    return (f"2 / 3 / 5 {t} icons: 2 / 4 / 6 VP.", f"2 / 3 / 5 icônes {t} : 2 / 4 / 6 VP.", f"2 / 3 / 5 icone {t}: 2 / 4 / 6 VP.")
add_q("The Midnight Ball", "Cinderella", tag_tiers("Charm"))
add_q("The Duel with Hook", "Peter Pan", tag_tiers("Strength"))
add_q("Down the Rabbit Hole", "Alice", tag_tiers("Dexterity"))
add_q("The Lost Voice", "The Little Mermaid", tag_tiers("Intelligence"))
add_q("The Fairies’ Gift", "Sleeping Beauty", tag_tiers("Sorcery"))
add_q("Neverland", "Peter Pan", ("1 / 2 sets of 5 different icons: 3 / 7 VP.", "1 / 2 séries de 5 icônes différentes : 3 / 7 VP.", "1 / 2 set di 5 icone diverse: 3 / 7 VP."))
add_q("The Apple's Bite", "Snow White", ("1 VP for each Bad card.", "1 VP par carte Méchante.", "1 VP per ogni carta Cattiva."))
add_q("The House of Seven", "Snow White", ("1 VP for each pair of Good cards.", "1 VP par paire de cartes Gentilles.", "1 VP per ogni coppia di carte Buone."))
add_q("The King's Trident", "The Little Mermaid", ("1 VP for each Item.", "1 VP par Objet.", "1 VP per ogni Oggetto."))
add_q("The Pact with the Beast", "Beauty and the Beast", ("1 VP for each upgraded Legendary card.", "1 VP par carte Légendaire améliorée.", "1 VP per ogni carta Leggendaria potenziata."))
add_q("The Final Wish", "Aladdin", ("2 VP for each Adventure.", "2 VP par Aventure.", "2 VP per ogni Avventura."))
add_q("Grandmother's Path", "Little Red Riding Hood", ("3 / 5 / 7 Good–Bad pairs of cards: 2 / 4 / 6 VP.", "3 / 5 / 7 paires de cartes Gentille–Méchante : 2 / 4 / 6 VP.", "3 / 5 / 7 coppie di carte Buona–Cattiva: 2 / 4 / 6 VP."))
add_q("The Marquis of Carabas", "Puss in Boots", ("1 / 3 / 5 coins left at the end: 2 / 4 / 6 VP.", "1 / 3 / 5 coins restantes à la fin : 2 / 4 / 6 VP.", "1 / 3 / 5 coins rimaste alla fine: 2 / 4 / 6 VP."))
add_q("Once Upon a Time", "Ensemble Finale", ("3 / 4 / 5 families with 2 cards or more: 2 / 4 / 7 VP.", "3 / 4 / 5 familles d’au moins 2 cartes : 2 / 4 / 7 VP.", "3 / 4 / 5 famiglie con almeno 2 carte: 2 / 4 / 7 VP."))
add_q("The Hatter's Tea Party", "Alice", ("4 / 6 / 8 cards with an Activation effect: 2 / 4 / 6 VP.", "4 / 6 / 8 cartes à effet Activation : 2 / 4 / 6 VP.", "4 / 6 / 8 carte con effetto Activation: 2 / 4 / 6 VP."))
add_q("The Yellow Brick Road", "The Wizard of Oz", ("1 VP for each Legendary card.", "1 VP par carte Légendaire.", "1 VP per ogni carta Leggendaria."))

# ---------------- Writers (current V1, two adapted) ----------------
writers = json.loads(json.dumps(V1["writers"]))
WR = []
for w in writers:
    if w["name"] == "Hans Christian Andersen":
        w["level1"] = "The first time each round you take a Legendary card, gain 1 XP."
        w["level3"] = "2 VP for each Legendary card."
        WR += [(w["level1"], "La première fois de chaque manche que vous prenez une carte Légendaire, gagnez 1 XP.", "La prima volta in ogni round che prendi una carta Leggendaria, ottieni 1 XP."),
               (w["level3"], "2 VP par carte Légendaire.", "2 VP per ogni carta Leggendaria.")]
    if w["name"] == "L. Frank Baum":
        w["level1"] = "At the start of each round, gain 1 coin."
        w["level2"] = "Gain 1 XP for each different icon."
        w["level3"] = "3 VP for each icon type of which you have 2 or more."
        WR += [(w["level1"], "Au début de chaque manche, gagnez 1 coin.", "All’inizio di ogni round, ottieni 1 coin."),
               (w["level2"], "Gagnez 1 XP par icône différente.", "Ottieni 1 XP per ogni icona diversa."),
               (w["level3"], "3 VP par type d’icône dont vous avez au moins 2 exemplaires.", "3 VP per ogni tipo di icona di cui hai almeno 2 esemplari.")]
    if w["name"] == "J. M. Barrie":
        w["level3"] = "2 VP for each family with 2 cards or more."
        WR += [(w["level3"], "2 VP par famille d’au moins 2 cartes.", "2 VP per ogni famiglia con almeno 2 carte.")]
    if w["name"] == "Carlo Collodi":
        w["level1"] = "When you are the first to choose a group in a round, gain 1 coin per player."
        WR += [(w["level1"], "Quand vous êtes le premier à choisir un groupe dans une manche, gagnez 1 coin par joueur.", "Quando sei il primo a scegliere un gruppo in un round, ottieni 1 coin per giocatore.")]
    if w["name"] == "Lewis Carroll":
        w["level3"] = "2 VP for each card with an Activation effect."
        WR += [(w["level3"], "2 VP par carte à effet Activation.", "2 VP per ogni carta con effetto Activation.")]
    if w["name"] == "J. M. Barrie":
        w["level1"] = "When you play a Chapter card valued 1–7, gain 1 XP."
        WR += [(w["level1"], "Quand vous jouez une carte Chapitre de valeur 1 à 7, gagnez 1 XP.", "Quando giochi una carta Capitolo di valore 1–7, ottieni 1 XP.")]
    if w["name"] == "Charles Perrault":
        w["level3"] = "2 VP for each Item."
        WR += [(w["level3"], "2 VP par Objet.", "2 VP per ogni Oggetto.")]
    if w["name"] == "Carlo Collodi":
        w["level3"] = "1 VP for every 2 XP placed on your cards and on your Writer."
        WR += [(w["level3"], "1 VP toutes les 2 XP placées sur vos cartes et sur votre Écrivain.", "1 VP ogni 2 XP piazzati sulle tue carte e sul tuo Scrittore.")]
    if w["name"] == "Leprince de Beaumont":
        w["level3"] = "5 VP for each upgraded Legendary card."
        WR += [(w["level3"], "5 VP par carte Légendaire améliorée.", "5 VP per ogni carta Leggendaria potenziata.")]
for r in WR: row(r)
for f in FAM.values(): row((f[1], f[3], f[5]))

actions = [{"number": i + 1, "effect": e} for i, e in enumerate(["Draft Quest + Activate all", "Draft Quest + 2 Coins", "Draft Quest + Activate a single card", "Activate all + 2 Coins", "Free level up + 2 Coins", "Activate a single card + 2 Coins + 1 XP", "Free level up", "Activate all", "2 Coins", "2 XP", "Draw 1 Chapter", ""])]

FAMILIES = {k: {"singular": v[0], "label": v[1]} for k, v in FAM.items()}
data = {"v2": True, "common": commons, "items": items, "legendary": leg, "actions": actions, "quests": quests, "writers": writers, "families": FAMILIES}
open(ROOT + "game-data.js", "w").write("window.GAME_DATA = " + json.dumps(data, indent=2, ensure_ascii=False) + ";\n")

# translations: insert rows before the marker (skip rows already present with the same English text)
t = open(ROOT + "i18n-cards.js").read()
mk = "  // ---- Adventure scoring ----"
have = set(re.findall(r'^  \["((?:[^"\\]|\\.)*)"', t, re.M))
new = [r for r in ROWS if json.dumps(r[0], ensure_ascii=False)[1:-1] not in have]
block = "".join("  " + json.dumps(list(r), ensure_ascii=False) + ",\n" for r in new)
t = t.replace(mk, "  // ---- V2 ----\n" + block + mk, 1)
# family names in the glossary of names
open(ROOT + "i18n-cards.js", "w").write(t)
print(len(commons), "commons", len(leg), "legendaries", len(items), "items", len(quests), "quests", len(new), "new rows")
missing = [n for n in set(c["name"] for c in commons + leg + items) if n not in set(c["name"] for k in ("common", "legendary", "items") for c in V1[k])]
print("names without V1 art:", missing)

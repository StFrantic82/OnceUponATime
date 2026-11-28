import json,sys,statistics as st
for f in sys.argv[1:]:
    d=json.load(open(f)); P=[p for g in d for p in g['players']]
    m=lambda k: round(st.mean(p[k] for p in P),1)
    W=[p for p in P if p['rank']==1]
    print(f, 'total',m('total'),'win',round(st.mean(p['total'] for p in W),1),'base',m('base'),'quests',m('quests'),'cards',m('cards'),'writer',m('writerPts'),'| nL',m('legendaryCount'),'nCards',m('cardCount'),'items',m('itemCount'),'nQ',m('questCount'),'upg',m('upgradedCount'), 'seat0 win%', round(100*st.mean(1 if p['rank']==1 else 0 for p in P if p['seatPos']==0),1))

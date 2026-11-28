import json,glob,statistics as st,re,subprocess
from collections import defaultdict
data=json.loads(subprocess.check_output(['node','-e','global.window={};eval(require("fs").readFileSync("OnceUponATime/game-data.js","utf8"));console.log(JSON.stringify(window.GAME_DATA))']))
deck={}
for c in data['legendary']: deck[c['name']]='L'
for c in data['common']: deck[c['name']]='C'
for c in data['items']: deck[c['name']]='I'
E=defaultdict(lambda: defaultdict(list)); PTS=defaultdict(list); Q=defaultdict(list); QW=defaultdict(list); W=defaultdict(list); WP=defaultdict(list)
UP=defaultdict(lambda:[0,0]); totals=defaultdict(list)
for f in glob.glob('/tmp/b*_*.json'):
  n=int(re.search(r'b(\d)_',f).group(1))
  for g in json.load(open(f)):
    for p in g['players']:
      w=(p['rank']==1)-1/n
      totals[n].append(p['total'])
      names=p['legendary']+p['common']+p['items']
      for nm in set(names): E[nm][n].append(w)
      end=defaultdict(int)
      for nm,pts,up in p['endPts']: end[nm]+=pts
      for nm in set(names):
        k=names.count(nm)
        PTS[nm].append((end.get(nm,0)+p['vpBy'].get(nm,0))/k)
      for q,pts in p['questNames']: Q[q].append(pts); QW[q].append(w)
      W[p['writer']].append(w); WP[p['writer']].append(p['writerPts'])
for n in sorted(totals): print(n,'players avg total',round(st.mean(totals[n]),1))
rows=[]
for nm in E:
  allw=[x for v in E[nm].values() for x in v]
  edge=100*st.mean(allw)
  per={n:round(100*st.mean(v),1) for n,v in sorted(E[nm].items()) if len(v)>=20}
  pts=PTS[nm]; m=st.mean(pts); sd=st.pstdev(pts)
  rows.append((edge,nm,deck.get(nm,'?'),per,round(m,1),round(sd/m,2) if m>0.5 else None,len(allw)))
rows.sort(reverse=True)
print('\nEDGE (win% above fair) | name | deck | per n | mean direct VP per copy | CV')
for r in rows: print(f"{r[0]:+5.1f} {r[1]:28s} {r[2]} {r[3]} pts={r[4]} cv={r[5]} n={r[6]}")
print('\nQUESTS mean pts, sd, %max, edge')
for q in sorted(Q,key=lambda q:-st.mean(Q[q])):
  v=Q[q]; mx=max(v)
  print(f"{q:28s} mean={st.mean(v):5.1f} sd={st.pstdev(v):4.1f} atmax={100*sum(x==mx for x in v)/len(v):4.0f}% max={mx} edge={100*st.mean(QW[q]):+5.1f} n={len(v)}")
print('\nWRITERS')
for w in sorted(W,key=lambda w:-st.mean(W[w])): print(f"{w:24s} edge={100*st.mean(W[w]):+5.1f} pts={st.mean(WP[w]):4.1f} sd={st.pstdev(WP[w]):4.1f}")

#!/usr/bin/env python3
"""Inspect the generated site's links, assets, metadata and structured data.
Run after build. --strict-winter fails on broken links/assets or metadata on the
winter cluster, while the JSON report inventories pre-existing issues sitewide.
"""
import argparse
import json
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote

class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links=[]; self.assets=[]; self.ids=set(); self.canonical=[]
        self.descriptions=[]; self.h1=0; self.schema=[]; self.noindex=False
        self.in_schema=False; self.schema_text=''; self.title=''; self.in_title=False
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if a.get('id'): self.ids.add(a['id'])
        if tag=='a' and a.get('href'): self.links.append(a['href'])
        if tag in ('img','script') and a.get('src'): self.assets.append(a['src'])
        if tag=='link' and a.get('rel')=='canonical': self.canonical.append(a.get('href',''))
        if tag=='link' and a.get('rel')=='stylesheet': self.assets.append(a.get('href',''))
        if tag=='meta' and a.get('name')=='description': self.descriptions.append(a.get('content',''))
        if tag=='meta' and a.get('name')=='robots' and 'noindex' in a.get('content',''): self.noindex=True
        if tag=='h1': self.h1+=1
        if tag=='title': self.in_title=True
        if tag=='script' and a.get('type')=='application/ld+json': self.in_schema=True; self.schema_text=''
    def handle_endtag(self,tag):
        if tag=='title': self.in_title=False
        if tag=='script' and self.in_schema:
            try: self.schema.append(json.loads(self.schema_text))
            except ValueError as e: self.schema.append({'_parse_error':str(e)})
            self.in_schema=False
    def handle_data(self,data):
        if self.in_schema: self.schema_text+=data
        if self.in_title: self.title+=data

def route_for(file, root):
    path='/'+file.relative_to(root).as_posix()
    return path[:-10] if path.endswith('index.html') else path

def resolve(path, root):
    target=root/unquote(path).lstrip('/')
    if target.is_file(): return target
    if (target/'index.html').is_file(): return target/'index.html'
    if target.with_suffix('.html').is_file(): return target.with_suffix('.html')
    return None

def winter_route(route):
    return route.startswith(('/winter','/learn-to-ski','/ski-day-planner','/ski-pass-calculator','/skiing','/sunshine-vs','/towns/','/trip-builder','/hotel-directory/','/hotels/','/accommodation/','/photo-spots/','/blog/banff-view/','/weather/','/weather-webcams/','/monthly-weather/','/what-to-do-today/','/packing-list/','/wellness/','/car-free-banff/','/calgary-to-banff/','/family-guide/','/dog-friendly/','/events/','/trail-map/','/quiet-trails/','/alternatives/','/trails/','/blog/banff-avalanche-safety/','/blog/banff-park-bus/','/blog/banff-shoulder-season/','/blog/banff-new-years-eve/','/blog/banff-weather-best-time-to-visit/','/blog/banff-hot-springs-history/','/blog/banff-wellness-retreats/')) or route.startswith('/blog/') and any(x in route for x in ('winter','ski','snowshoe','dog-sled','ice-walk','ice-skating','fat-bik','northern-lights'))

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--directory',default='dist'); ap.add_argument('--report',default='research/built-site-audit-2026-10-28.json'); ap.add_argument('--strict-winter',action='store_true');args=ap.parse_args()
    root=Path(args.directory); pages={}
    for file in sorted(root.rglob('*.html')):
        page=Page();page.feed(file.read_text());pages[file]=page
    findings=[]
    for attribute,kind in [('title','duplicate-title'),('canonical','duplicate-canonical')]:
        groups={}
        for file,page in pages.items():
            if page.noindex or not page.title: continue
            values=page.canonical if attribute=='canonical' else [page.title]
            for value in values: groups.setdefault(value,[]).append(route_for(file,root))
        for value,routes in groups.items():
            if len(routes)>1:
                for route in routes: findings.append({'route':route,'kind':kind,'value':value,'winter':winter_route(route)})
    for file,page in pages.items():
        route=route_for(file,root)
        # Astro redirect stubs have no complete document and are intentionally not indexed.
        if page.noindex or not page.title: continue
        def add(kind,value): findings.append({'route':route,'kind':kind,'value':value,'winter':winter_route(route)})
        if page.h1!=1: add('h1-count',page.h1)
        if len(page.canonical)!=1 or not page.canonical[0].startswith('https://banffbound.com/') or urlparse(page.canonical[0]).query: add('canonical',page.canonical)
        if len(page.descriptions)!=1 or not page.descriptions[0]: add('description',page.descriptions)
        for schema in page.schema:
            if '_parse_error' in schema: add('invalid-json-ld',schema['_parse_error'])
        for link in set(page.links):
            u=urlparse(urljoin('https://banffbound.com'+route,link))
            if u.hostname!='banffbound.com': continue
            target=resolve(u.path,root)
            if not target: add('broken-link',link)
            elif u.fragment and target in pages and unquote(u.fragment) not in pages[target].ids:
                # JS-created UI ids, blog category hashes and dynamic SPA state may be intentional.
                if not u.fragment.startswith(('all','guides','hiking','seasonal','tips','food','accommodation','planning','itineraries')): add('missing-fragment',link)
        for src in set(page.assets):
            u=urlparse(urljoin('https://banffbound.com'+route,src))
            if u.hostname=='banffbound.com' and not resolve(u.path,root): add('missing-asset',src)
    report={'pages':len(pages),'indexable_documents':sum(bool(p.title) and not p.noindex for p in pages.values()),'counts':dict(Counter(f['kind'] for f in findings)),'winter_counts':dict(Counter(f['kind'] for f in findings if f['winter'])),'findings':findings}
    Path(args.report).parent.mkdir(parents=True,exist_ok=True);Path(args.report).write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k!='findings'},indent=2))
    errors=[f for f in findings if f['winter'] and f['kind']!='missing-fragment']
    if args.strict_winter and errors:
        for error in errors[:30]: print(json.dumps(error))
        raise SystemExit(1)
if __name__=='__main__': main()

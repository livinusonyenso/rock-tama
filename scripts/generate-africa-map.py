"""Generate a static public-domain Africa SVG from Natural Earth v5.1.2 GeoJSON.
Usage: python3 scripts/generate-africa-map.py /tmp/rocktama-countries.geojson
No third-party packages. See docs/ASSET_SPECIFICATIONS.md for provenance.
"""
import hashlib
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

source = Path(sys.argv[1]).read_bytes()
assert hashlib.sha256(source).hexdigest() == '6866c877d39cba9c357620878839b336d569f8c662d3cfab4cb1dbe2d39c977f'
features = json.loads(source)['features']
edges = Counter()
for feature in features:
    if feature['properties']['CONTINENT'] != 'Africa':
        continue
    geometry = feature['geometry']
    polygons = [geometry['coordinates']] if geometry['type'] == 'Polygon' else geometry['coordinates']
    for polygon in polygons:
        for ring in polygon:
            points = [tuple(round(v, 6) for v in p) for p in ring]
            for a, b in zip(points, points[1:]):
                if a != b:
                    edges[tuple(sorted((a, b)))] += 1
# Shared country edges cancel; the remaining graph is the coastline (including Madagascar).
adj = defaultdict(set)
for (a, b), count in edges.items():
    if count == 1:
        adj[a].add(b)
        adj[b].add(a)
assert all(len(neighbors) == 2 for neighbors in adj.values()), 'Coastline must form closed rings'
rings = []
while adj:
    start = min(adj)
    ring = [start]
    current = start
    while True:
        neighbor = min(adj[current])
        adj[current].remove(neighbor)
        adj[neighbor].remove(current)
        if not adj[current]:
            del adj[current]
        current = neighbor
        if current == start:
            del adj[current]
            break
        ring.append(current)
    rings.append(ring)
# Equirectangular projection with one uniform scale: x=lon+20, y=40-lat.
# ViewBox 0 0 74 78 contains the coastline; no independent x/y stretching.
path = ' '.join('M' + 'L'.join(f'{lon+20:.3f},{40-lat:.3f}' for lon, lat in ring) + 'Z' for ring in rings)
component = '''import { homeOrigin } from "@/content/home";

/** Natural Earth v5.1.2, 1:110m Admin 0 Countries, public domain.
 * African boundaries dissolved by scripts/generate-africa-map.py; source/licence/checksum:
 * docs/ASSET_SPECIFICATIONS.md. Equirectangular: x=longitude+20, y=40-latitude.
 * Pin tip = approximate Nanka town (GeoNames 2329463), never a surveyed spring site.
 */
const OUTLINE = "''' + path + '''";

export function AfricaMap({ className = "" }: { className?: string }) {
  const { longitude, latitude } = homeOrigin.location;
  return (
    <svg aria-hidden="true" focusable="false" data-africa-map="" viewBox="0 0 74 78" className={className}>
      <path d={OUTLINE} className="fill-sand-300 stroke-ivory-50" strokeWidth="0.6" strokeLinejoin="round" />
      <g data-origin-pin="" transform={`translate(${longitude + 20} ${40 - latitude})`}>
        <path d="M0 0C-1.2-1.8-3.2-3.8-3.2-5.5a3.2 3.2 0 1 1 6.4 0C3.2-3.8 1.2-1.8 0 0Z" className="fill-forest-800" />
        <circle cy="-5.5" r="1.1" className="fill-ivory-50" />
      </g>
    </svg>
  );
}
'''
Path('components/brand/AfricaMap.tsx').write_text(component)
print(f'Generated {len(rings)} dissolved rings, {len(path)} path characters')
# Independent geometry check: town coordinate must fall within Nigeria's source polygon.
nigeria = next(f for f in features if f['properties']['ADMIN'] == 'Nigeria')['geometry']['coordinates'][0]
x, y = 7.08306, 6.06042
inside = False
for a, b in zip(nigeria, nigeria[1:]):
    if (a[1] > y) != (b[1] > y) and x < (b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:
        inside = not inside
assert inside, 'Nanka marker must be in Nigeria'
print('Nanka coordinate lies within Nigeria; projected pin tip: 27.08306, 33.93958')

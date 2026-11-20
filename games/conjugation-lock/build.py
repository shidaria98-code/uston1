"""Rebuild the standalone HTML from the generated data snapshot and game sources.
For CMS edits, run the portal's tools/build_content.py instead.
"""
import base64,json,mimetypes,sys
from pathlib import Path
root=Path(__file__).resolve().parent
output=Path(sys.argv[1])if len(sys.argv)>1 else root/'index.html'
page=(root/'page.html').read_text(encoding='utf-8');data=json.loads((root/'data.json').read_text(encoding='utf-8'))
def picture(value):
 if value.startswith('https://'):return value
 value=value.removeprefix('/uston1/')
 paths=[root/value,root/value.removeprefix('games/conjugation-lock/'),root.parents[1]/value]
 file=next((p for p in paths if p.is_file()),None)
 if not file:raise FileNotFoundError(value)
 return 'data:'+(mimetypes.guess_type(file.name)[0]or'image/png')+';base64,'+base64.b64encode(file.read_bytes()).decode('ascii')
replacements={'STYLES':(root/'style.css').read_text(encoding='utf-8'),'DATA':json.dumps(data,ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e'),'ART':json.dumps({k:picture(v)for k,v in data['media'].items()}),'CORE':(root/'core.js').read_text(encoding='utf-8'),'APP':(root/'app.js').read_text(encoding='utf-8'),'BRIDGE':(root/'bridge.js').read_text(encoding='utf-8')}
for marker,value in replacements.items():page=page.replace('/* '+marker+' */',value)
output.write_text(page,encoding='utf-8')

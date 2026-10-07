"""Static preview with byte-range support for seeking MP3 audio."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re, os
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(Path(__file__).parent/'docs'),**kwargs)
 def send_head(self):
  self.byte_range=None
  path=self.translate_path(self.path)
  if not self.headers.get('Range') or not os.path.isfile(path):return super().send_head()
  size=os.path.getsize(path);match=re.match(r'bytes=(\d+)-(\d*)',self.headers['Range'])
  if not match:return super().send_head()
  start=int(match[1]);end=min(int(match[2]) if match[2] else size-1,size-1)
  if start>end:self.send_error(416);return None
  f=open(path,'rb');f.seek(start);self.byte_range=(start,end)
  self.send_response(206);self.send_header('Content-Type',self.guess_type(path));self.send_header('Accept-Ranges','bytes');self.send_header('Content-Range',f'bytes {start}-{end}/{size}');self.send_header('Content-Length',str(end-start+1));self.end_headers();return f
 def copyfile(self,source,output):
  if self.byte_range:
   remaining=self.byte_range[1]-self.byte_range[0]+1
   while remaining:
    data=source.read(min(65536,remaining))
    if not data:break
    output.write(data);remaining-=len(data)
  else:super().copyfile(source,output)
 def end_headers(self):self.send_header('Cache-Control','no-cache');super().end_headers()
if __name__=='__main__':
 print('Music game preview: http://127.0.0.1:8765/',flush=True)
 ThreadingHTTPServer(('127.0.0.1',8765),Handler).serve_forever()

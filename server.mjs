import http from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';

const root = path.join(import.meta.dirname, 'site');
const host = '127.0.0.1';
const port = Number(process.env.RALLY_PORT || 8787);
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.json':'application/json','.webmanifest':'application/manifest+json','.gltf':'model/gltf+json','.bin':'application/octet-stream','.mp3':'audio/mpeg','.ogg':'audio/ogg'};
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${host}:${port}`);
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Cache-Control','no-cache');
  if (url.pathname === '/offline-health') {
    res.setHeader('Content-Type','application/json');
    return res.end(JSON.stringify({app:'rally-offline',version:1}));
  }
  if (url.pathname === '/offline-stop' && req.method === 'POST') {
    if (req.headers.origin && req.headers.origin !== `http://${host}:${port}`) {res.writeHead(403); return res.end();}
    res.end('Stopped'); server.close(); return setTimeout(()=>process.exit(0),200);
  }
  // Online services have no local equivalent. Never proxy them to the internet.
  if (url.pathname.startsWith('/live/')) {
    res.setHeader('Content-Type','application/json');
    if (url.pathname === '/live/park/online') return res.end(JSON.stringify({total:0,parks:[0,0,0,0,0]}));
    if (url.pathname.startsWith('/live/stats/')) {res.writeHead(204);return res.end();}
    res.writeHead(503);return res.end(JSON.stringify({error:'Offline edition: this feature requires the original online service.'}));
  }
  if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405);return res.end();}
  let pathname;
  try {pathname=decodeURIComponent(url.pathname);} catch {res.writeHead(400);return res.end();}
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep)) {res.writeHead(403);return res.end();}
  try {
    if (!(await stat(file)).isFile()) throw new Error('not a file');
    const bytes = await readFile(file);
    res.setHeader('Content-Type',mime[path.extname(file)] || 'application/octet-stream');
    res.setHeader('Content-Length',bytes.length);
    // All game assets and connections must stay on this local server.
    res.setHeader('Content-Security-Policy',"default-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' data: blob:; worker-src 'self' blob:; object-src 'none'");
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch {
    console.warn('Missing local file:',pathname);
    res.writeHead(404);res.end('Local file not found');
  }
});
server.listen(port,host,()=>console.log(`Rally Offline: http://${host}:${port}`));
server.on('error',err=>{console.error(err.message);process.exitCode=1;});

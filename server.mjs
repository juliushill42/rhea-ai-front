import http from 'node:http';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import handler from './api/rhea.js';
const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
const app = readFileSync(join(root, 'index.html'));
const server = http.createServer(async (req,res)=>{
  const path = new URL(req.url,'http://localhost').pathname;
  if (path === '/api/rhea') return handler(req,res);
  if (path === '/healthz') {res.writeHead(200,{'content-type':'application/json'});return res.end(JSON.stringify({ok:true,service:'rhea-web'}));}
  if (path === '/' || path === '/index.html') {res.writeHead(200,{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','content-security-policy':"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; font-src 'self'"});return res.end(app);}
  res.writeHead(404,{'content-type':'text/plain'});res.end('Not found');
});
server.listen(port,'127.0.0.1',()=>console.log(`RHEA interface: http://127.0.0.1:${port}`));

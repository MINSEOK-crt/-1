import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const port=Number(process.argv[2]||8765);
if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('올바른 포트를 지정하세요.');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
const server=http.createServer((req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return}
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Not found');return}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
 }catch{res.writeHead(400);res.end('Bad request')}
});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?`포트 ${port}가 사용 중입니다. 기존 서버를 닫거나 다른 포트로 실행하세요.`:error.message);process.exit(1)});
server.listen(port,'localhost',()=>{
 const url=`http://localhost:${port}/`;
 console.log(`AEROSCOPE 항공제조 품질검사\n${url}\n종료하려면 이 창을 닫거나 Ctrl+C를 누르세요.`);
 if(process.platform==='win32'&&process.argv.includes('--open'))spawn('cmd.exe',['/c','start','',url],{windowsHide:true,stdio:'ignore'}).unref();
});

const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const assets=path.join(__dirname,'app/src/main/assets');
const types={'/':'text/html; charset=utf-8','/index.html':'text/html; charset=utf-8','/styles.css':'text/css; charset=utf-8','/model.js':'text/javascript; charset=utf-8','/demo.js':'text/javascript; charset=utf-8','/app.js':'text/javascript; charset=utf-8'};
http.createServer((req,res)=>{
  const route=new URL(req.url,'http://127.0.0.1').pathname;
  if(!Object.hasOwn(types,route)){res.writeHead(404);res.end('Not found');return;}
  res.writeHead(200,{'Content-Type':types[route],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  fs.createReadStream(path.join(assets,route==='/'?'index.html':route.slice(1))).pipe(res);
}).listen(Number(process.env.SWARA_PREVIEW_PORT)||8765,'127.0.0.1',()=>console.log('Swara Institute preview running at http://127.0.0.1:'+(Number(process.env.SWARA_PREVIEW_PORT)||8765)));

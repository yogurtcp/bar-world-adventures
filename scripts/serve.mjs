import http from "node:http";
import { readFile,stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root=path.resolve(fileURLToPath(new URL("../dist/",import.meta.url)));
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json",".webmanifest":"application/manifest+json",".webp":"image/webp",".png":"image/png",".mp3":"audio/mpeg"};
const server=http.createServer(async(req,res)=>{
 try{const name=decodeURIComponent(new URL(req.url,"http://localhost").pathname);let file=path.resolve(root,"."+name);if(file!==root&&!file.startsWith(root+path.sep))throw Error();if((await stat(file)).isDirectory())file=path.join(file,"index.html");const body=await readFile(file);res.writeHead(200,{"Content-Type":types[path.extname(file)]||"application/octet-stream","Cache-Control":"no-cache"});res.end(body);}catch{res.writeHead(404);res.end("Not found");}
});
server.listen(Number(process.env.PORT||4186),"127.0.0.1",()=>console.log(`http://127.0.0.1:${server.address().port}`));

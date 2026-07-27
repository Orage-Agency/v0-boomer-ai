import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';
const KEY_ID='95ZNZYMM7U', ISSUER='95620806-51c7-483f-8768-cfc04b921850';
const KEY_PATH='C:/Users/georg/boomer-handoff-2026-07-10/credentials/asc/AuthKey_95ZNZYMM7U.p8';
const APP_ID='6755741429';
const b64u=b=>Buffer.from(b).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
function derToJose(der){let off=2;if(der[1]&0x80)off=2+(der[1]&0x7f);
 const ri=()=>{const len=der[off+1];let s=off+2;const e=s+len;while(der[s]===0&&e-s>32)s++;const o=Buffer.alloc(32);der.subarray(s,e).copy(o,32-(e-s));off=e;return o;};
 return Buffer.concat([ri(),ri()]);}
function token(){const h={alg:'ES256',kid:KEY_ID,typ:'JWT'};const n=Math.floor(Date.now()/1000);
 const p={iss:ISSUER,iat:n,exp:n+900,aud:'appstoreconnect-v1'};
 const si=`${b64u(JSON.stringify(h))}.${b64u(JSON.stringify(p))}`;
 const s=createSign('SHA256');s.update(si);s.end();
 return `${si}.${b64u(derToJose(s.sign(readFileSync(KEY_PATH,'utf8'))))}`;}
export async function api(method,path,body){
  const res=await fetch(`https://api.appstoreconnect.apple.com${path}`,{method,
    headers:{Authorization:`Bearer ${token()}`,'Content-Type':'application/json'},
    body:body?JSON.stringify(body):undefined});
  const text=await res.text();
  let json={};try{json=text?JSON.parse(text):{};}catch{json={raw:text.slice(0,300)};}
  return {status:res.status,body:json};
}
export { APP_ID };

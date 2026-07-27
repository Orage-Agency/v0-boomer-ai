const KEY='sk_3788a184896d4fdc5747e6fb4a962b4d467600771035761e';
const since = Date.parse('2026-07-10T11:41:57Z')/1000; // current billing period start
const r = await fetch('https://api.elevenlabs.io/v1/convai/agents?page_size=50',{headers:{'xi-api-key':KEY}});
const agents = (await r.json()).agents||[];
console.log('Agents in this ONE ElevenLabs workspace:');
for(const a of agents) console.log('  -', a.name, '|', a.agent_id);
let totals={};
for(const a of agents){
  let cursor=null, secs=0, calls=0;
  for(let p=0;p<10;p++){
    const u=new URL('https://api.elevenlabs.io/v1/convai/conversations');
    u.searchParams.set('agent_id',a.agent_id); u.searchParams.set('page_size','100');
    if(cursor) u.searchParams.set('cursor',cursor);
    const res=await fetch(u,{headers:{'xi-api-key':KEY}});
    const d=await res.json();
    for(const c of d.conversations||[]){
      if((c.start_time_unix_secs||0)>=since){ secs+=c.call_duration_secs||0; calls++; }
    }
    if(!d.has_more) break; cursor=d.next_cursor;
  }
  totals[a.name]={mins:+(secs/60).toFixed(1),calls};
}
console.log('\nUsage THIS BILLING PERIOD (since Jul 10):');
let all=0;
for(const [n,v] of Object.entries(totals)){ console.log(`  ${n.padEnd(28)} ${String(v.mins).padStart(7)} min  (${v.calls} calls)`); all+=v.mins; }
console.log(`  ${'TOTAL'.padEnd(28)} ${all.toFixed(1).padStart(7)} min  of 275 included on Creator`);
console.log(`  remaining: ${(275-all).toFixed(1)} min`);

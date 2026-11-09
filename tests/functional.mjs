import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const source=await fs.readFile(new URL('../dist/app.js',import.meta.url),'utf8');
const cutoff=source.lastIndexOf('try{await load();render()}');
assert(cutoff>0);
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const api=await new AsyncFunction('window',source.slice(0,cutoff)+`
 persist=async()=>{};
 return {zip,csv,esc,validImage,restoreBackup,getState:()=>state,stats};
`)({addEventListener(){}});
assert.equal(api.esc('<img onerror="x">'), '&lt;img onerror=&quot;x&quot;&gt;');
const csv=api.csv([['부품','의견'],['=HYPERLINK("https://example.com")',' a,b\nc'],['  =1+1','-formula'],['ordinary','quoted " text']]);
assert(csv.includes("'=HYPERLINK"));assert(csv.includes("'  =1+1"));assert(csv.includes('" a,b\nc"'));assert(csv.includes('quoted "" text'));
assert.equal(api.validImage('data:image/svg+xml;base64,PHN2Zz4='),false);
const image='data:image/jpeg;base64,/9j/2Q==';
assert.equal(api.validImage(image),true);
const record={id:'QA-1',part:'PART-QA',lot:'LOT-QA',area:'표면',inspector:'QA',createdAt:new Date().toISOString(),image,origin:'synthetic',review:{verdict:'재검토',notes:'QA',updatedAt:new Date().toISOString()},reviewHistory:[]};
const item={id:'IMG-QA',image,origin:'synthetic',label:'스크래치',createdAt:new Date().toISOString()};
const backup={schema:'aeroscope-workspace',version:1,records:[record],dataset:[item]};
await api.restoreBackup(JSON.stringify(backup));await api.restoreBackup(JSON.stringify(backup));
assert.equal(api.getState().records.length,1);assert.equal(api.getState().dataset.length,1);
assert(api.stats().includes('검토 대기'));
assert(api.stats().replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').includes('검토 대기 1'));
await assert.rejects(()=>api.restoreBackup(JSON.stringify({...backup,dataset:[{...item,image:'data:image/svg+xml;base64,PHN2Zz4='}]})));
assert.equal(api.getState().dataset.length,1);
const archive=api.zip([['labels/스크래치/sample.bin',new Uint8Array([0,1,255,50])],['manifest.json','{"test":"항공제조"}'],['empty.txt','']]);
await fs.writeFile(new URL('../../zip-interoperability-test.zip',import.meta.url),new Uint8Array(await archive.arrayBuffer()));
console.log('PASS: HTML escaping, CSV injection and quoting, image restore format, duplicate restore, re-review pending count, ZIP generation.');


const assert=require('node:assert/strict');
const {createStore}=require('../site/career.js');
const memory=()=>{const data=new Map([['old-settings','keep']]);return{data,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)}};
const storage=memory(),career=createStore(storage),record=(id,extra={})=>({id,mode:'quick',eligible:true,format:'singles',scoring:'traditional',target:11,difficulty:'normal',pace:'classic',rivalId:'bea',winner:0,points:[11,5],metrics:{},...extra});
assert.equal(career.finalizeMatch(record('first')).saved,true);
assert(career.load().unlocked.includes('paddle-lime'));
assert.equal(career.finalizeMatch(record('first')).duplicate,true);
assert.equal(career.load().totals.wins,1);
career.finalizeMatch(record('rematch'));assert.equal(career.load().totals.wins,2);
assert.equal(career.equip('paddle','unknown').saved,false);
assert.equal(career.equip('paddle','paddle-lime').saved,true);
assert.equal(createStore(storage).load().equipped.paddle,'paddle-lime');
assert.equal(storage.data.get('old-settings'),'keep');
storage.data.set('rally.offline.career.v1','{bad');createStore(storage).load();assert.equal(storage.data.get('rally.offline.career.v1.backup'),'{bad');
const broken=createStore({getItem:()=>null,setItem:()=>{throw Error('Full')}});
assert.equal(broken.finalizeMatch(record('no-save')).saved,false);assert(!broken.load().unlocked.includes('paddle-lime'));
const many=createStore(memory());for(let i=0;i<205;i++)many.finalizeMatch(record('m'+i));assert.equal(many.load().receipts.length,200);
const losing=createStore(memory());let award=losing.finalizeMatch(record('loss',{winner:1,metrics:{longestRally:15,humanPerfectHits:5}}));assert.deepEqual(award.newMedalIds.sort(),['long-rally','sweet-spot']);
for(const bad of [{medals:'broken'},{rivalWins:'broken'},{totals:{matches:0,wins:0,rushBests:{'singles:normal':'broken'}}}]){
 const db=memory(),valid=many.load();Object.assign(valid,bad);const raw=JSON.stringify(valid);db.data.set('rally.offline.career.v1',raw);const recovered=createStore(db);assert.deepEqual(recovered.load().medals,{});assert.equal(db.data.get('rally.offline.career.v1.backup'),raw);assert.equal(recovered.finalizeMatch(record('recover')).saved,true);
}
console.log('PASS career: persistence, duplicate receipts, rematches, unlocks, validation, failed writes, receipt bound and loss medals');

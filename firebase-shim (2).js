/* يوصّل اللعبة بـ Firebase Firestore (مجاني). لازم تملى firebase-config.js الأول. */
(function(){
  var cfg=window.TAWNY_FIREBASE;
  if(!cfg||!cfg.projectId||cfg.projectId.indexOf('ضع')===0||!window.firebase)return;
  var fs;
  try{
    if(!firebase.apps||!firebase.apps.length)firebase.initializeApp(cfg);
    fs=firebase.firestore();
    try{fs.settings({ignoreUndefinedProperties:true,experimentalAutoDetectLongPolling:true,merge:true})}catch(e){}
  }catch(e){return}
  /* Firestore مش بيقبل مصفوفة جوه مصفوفة. بنحفظها كنص ونرجّعها زي ما كانت */
  function enc(v){
    if(Array.isArray(v)){if(v.some(Array.isArray))return{_njson:JSON.stringify(v)};return v.map(enc)}
    if(v&&typeof v==='object'){var o={};for(var k in v)if(v[k]!==undefined)o[k]=enc(v[k]);return o}
    return v;
  }
  function dec(v){
    if(Array.isArray(v))return v.map(dec);
    if(v&&typeof v==='object'){var ks=Object.keys(v);if(ks.length===1&&ks[0]==='_njson'){try{return JSON.parse(v._njson)}catch(e){return []}}var o={};ks.forEach(function(k){o[k]=dec(v[k])});return o}
    return v;
  }
  function wd(s){return{id:s.id,exists:s.exists,metadata:s.metadata,data:function(){var d=s.data();return d===undefined?undefined:dec(d)}}}
  function wq(q){return{docs:q.docs.map(wd),size:q.size,empty:q.empty,metadata:q.metadata}}
  var noop=function(){};
  function docRef(r){return{id:r.id,path:r.path,
    get:function(){return r.get().then(wd)},
    set:function(d){return r.set(enc(d))},
    update:function(d){return r.update(enc(d))},
    delete:function(){return r.delete()},
    onSnapshot:function(cb,eb){return r.onSnapshot(function(s){cb(wd(s))},eb||noop)},
    collection:function(p){return colRef(r.collection(p))}}}
  function query(q){return{
    where:function(a,b,c){return query(q.where(a,b,c))},
    orderBy:function(f,d){return query(q.orderBy(f,d))},
    limit:function(n){return query(q.limit(n))},
    get:function(){return q.get().then(wq)},
    onSnapshot:function(cb,eb){return q.onSnapshot(function(s){cb(wq(s))},eb||noop)}}}
  function colRef(c){return Object.assign(query(c),{path:c.path,
    doc:function(id){return docRef(id?c.doc(id):c.doc())},
    add:function(d){return c.add(enc(d)).then(docRef)}})}
  var DB={doc:function(p){return docRef(fs.doc(p))},collection:function(p){return colRef(fs.collection(p))}};
  var uid=window.__uid;
  if(!uid){try{uid=localStorage.getItem('kbh_uid');if(!uid){uid='u'+Math.random().toString(36).slice(2,12)+Date.now().toString(36);localStorage.setItem('kbh_uid',uid)}}catch(e){uid='u'+Math.random().toString(36).slice(2,14)}}
  var USER={id:function(){return Promise.resolve(uid)},isOwner:function(){return Promise.resolve(false)},canEdit:function(){return Promise.resolve(false)},can:function(){return Promise.resolve(true)}};
  window.claude={use:function(n){if(n==='db')return Promise.resolve(DB);if(n==='user')return Promise.resolve(USER);return Promise.reject(new Error('unsupported'))}};
})();

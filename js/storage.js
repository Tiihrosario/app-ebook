const KEY='raem-v5-state';
export const localDate=(d=new Date())=>{const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`};
const fresh=()=>({schema:5,reader:{chapter:1,section:0,completed:[]},daily:{},plan:{mode:'free',start:localDate(),records:{}},ifthen:[],prefs:{textScale:1},updatedAt:new Date().toISOString()});
export function load(){try{const x=JSON.parse(localStorage.getItem(KEY));return x?.schema===5?{...fresh(),...x}:fresh()}catch{return fresh()}}
export function save(s){s.updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(s));}
export function erase(){localStorage.removeItem(KEY)}
export function exportData(s){const blob=new Blob([JSON.stringify({app:'RAEM',schema:5,exportedAt:new Date().toISOString(),data:s},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`backup-raem-${localDate()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
export async function importData(file){if(file.size>2_000_000)throw Error('Arquivo acima de 2 MB.');const x=JSON.parse(await file.text());if(x?.app!=='RAEM'||x?.schema!==5||!x.data||typeof x.data!=='object')throw Error('Backup incompatível.');const d=x.data;if(!d.reader||!Array.isArray(d.reader.completed)||!d.daily||!d.plan||!d.prefs)throw Error('Estrutura incompleta.');return {...fresh(),...d,schema:5}}

import footballDb from '@/data/football-db.json';
export type AnyRecord=Record<string,any>;
export const slugify=(v:string)=>v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const playerUrl=(n:string)=>`/explore/player/${slugify(n)}`;
export const clubUrl=(n:string)=>`/explore/club/${slugify(n)}`;
export const competitionUrl=(n:string)=>`/explore/competition/${slugify(n)}`;
export const matchUrl=(id:string|number)=>`/explore/match/${id}`;
const cache:any=footballDb;
export async function db():Promise<any>{ return cache; }
const text=(v:any)=>String(v||'').trim().toLowerCase();
export async function searchPlayers(q:string){const d=await db();const x=text(q);const local:any[]=Object.values(d.players).filter((p:any)=>[p.strPlayer,p.strTeam,p.strNationality,p.strPosition].some(v=>text(v).includes(x))).slice(0,50);if(local.length>=8)return local;try{const r=await fetch(`https://www.thesportsdb.com/api/v1/json/123/searchplayers.php?p=${encodeURIComponent(q.trim().replace(/\s+/g,'_'))}`);const j:any=await r.json();const remote:any[]=Array.isArray(j.player)?j.player.filter((p:any)=>!p.strSport||text(p.strSport)==='soccer'):[];const seen=new Set(local.map(p=>p.idPlayer));return local.concat(remote.filter(p=>!seen.has(p.idPlayer))).slice(0,50)}catch{return local}}
export async function searchTeams(q:string){const d=await db();const x=text(q);const local:any[]=Object.values(d.clubs).filter((t:any)=>[t.strTeam,t.strLeague,t.strCountry,t.strStadium].some(v=>text(v).includes(x))).slice(0,50);if(local.length>=8)return local;try{const r=await fetch(`https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=${encodeURIComponent(q.trim())}`);const j:any=await r.json();const remote:any[]=Array.isArray(j.teams)?j.teams.filter((t:any)=>!t.strSport||text(t.strSport)==='soccer'):[];const seen=new Set(local.map(t=>t.idTeam));return local.concat(remote.filter(t=>!seen.has(t.idTeam))).slice(0,50)}catch{return local}}
export async function teamPlayers(id:string){
  const d=await db();
  const t=d.clubs[id];
  const local:any[]=(t?.players||[]).map((x:string)=>d.players[x]).filter(Boolean);
  try{
    const r=await fetch(`https://www.thesportsdb.com/api/v1/json/123/lookup_all_players.php?id=${encodeURIComponent(id)}`);
    const x:any=await r.json();
    const remote:any[]=Array.isArray(x.player)?x.player:[];
    if(remote.length){
      const seen=new Set(remote.map((p:any)=>p.idPlayer));
      return remote.concat(local.filter((p:any)=>!seen.has(p.idPlayer)));
    }
  }catch{}
  return local;
}
export async function teamNext(id:string){const d=await db();if(d.clubs[id]?.next?.length)return d.clubs[id].next;try{const r=await fetch(`https://www.thesportsdb.com/api/v1/json/123/eventsnext.php?id=${encodeURIComponent(id)}`);const x:any=await r.json();return Array.isArray(x.events)?x.events:[]}catch{return []}}
const playerLiveCache=new Map<string,any>();
async function playerLiveExtras(id:string){
  if(playerLiveCache.has(id)) return playerLiveCache.get(id);
  const out:any={profile:null,stats:[],honours:[],teams:[],milestones:[]};
  try{const r=await fetch(`https://www.thesportsdb.com/api/v1/json/123/lookupplayer.php?id=${id}`);const x:any=await r.json();out.profile=Array.isArray(x.players)&&x.players[0]?x.players[0]:null}catch{}
  try{const r=await fetch(`https://www.thesportsdb.com/api/v1/json/123/lookupplayerstats.php?id=${id}`);const x:any=await r.json();out.stats=Array.isArray(x.playerstats)?x.playerstats:[]}catch{}
  try{const r=await fetch(`https://www.thesportsdb.com/api/v1/json/123/lookuphonours.php?id=${id}`);const x:any=await r.json();out.honours=Array.isArray(x.honours)?x.honours:[]}catch{}
  try{const r=await fetch(`https://www.thesportsdb.com/api/v1/json/123/lookupformerteams.php?id=${id}`);const x:any=await r.json();out.teams=Array.isArray(x.formerteams)?x.formerteams:[]}catch{}
  try{const r=await fetch(`https://www.thesportsdb.com/api/v1/json/123/lookupmilestones.php?id=${id}`);const x:any=await r.json();out.milestones=Array.isArray(x.milestones)?x.milestones:[]}catch{}
  playerLiveCache.set(id,out);return out;
}
export async function playerBundle(slugOrName:string){
  const d=await db();const s=slugify(slugOrName);
  let p:any=Object.values(d.players).find((x:any)=>slugify(x.strPlayer)===s);
  if(p){
    const localStats=Array.isArray(p._stats)?p._stats:(Array.isArray(p.stats)?p.stats:[]);
    const localHonours=p._honours||p.honours||[];
    const localTeams=p._teams||p.formerteams||[];
    const normalizeTeams=(arr:any[])=>arr.map((t:any)=>({...t,strTeam:t.strTeam||t.strFormerTeam||''})).filter((t:any)=>t.strTeam);
    const live=await playerLiveExtras(String(p.idPlayer));
    const profile=live.profile||p;
    return {player:profile,stats:localStats.length?localStats:live.stats,honours:localHonours.length?localHonours:(Array.isArray(live.honours)?live.honours:[]),milestones:Array.isArray(live.milestones)&&live.milestones.length?live.milestones:(Array.isArray(p._milestones)?p._milestones:[]),teams:localTeams.length?normalizeTeams(localTeams):(Array.isArray(live.teams)?normalizeTeams(live.teams):[])};
  }
  try{
    const name=String(slugOrName).replace(/-/g,' ');
    const sr=await fetch(`https://www.thesportsdb.com/api/v1/json/123/searchplayers.php?p=${encodeURIComponent(name.replace(/\s+/g,'_'))}`);
    const sd:any=await sr.json();
    const soccerPlayers=(sd.player||[]).filter((x:any)=>!x.strSport||text(x.strSport)==='soccer');
    p=soccerPlayers.find((x:any)=>slugify(x.strPlayer)===s)||soccerPlayers[0];
    if(!p)return null;
    const live=await playerLiveExtras(String(p.idPlayer));
    return {player:live.profile||p,stats:live.stats,honours:live.honours,milestones:live.milestones,teams:Array.isArray(live.teams)?live.teams.map((t:any)=>({...t,strTeam:t.strTeam||t.strFormerTeam||''})).filter((t:any)=>t.strTeam):[]};
  }catch{return null}
}
export async function clubByName(name:string){
  const d=await db(); const s=slugify(name);
  const existing:any=Object.values(d.clubs).find((t:any)=>slugify(t.strTeam)===s);
  if(existing)return existing;
  const members:any[]=Object.values(d.players).filter((p:any)=>slugify(p.strTeam||'')===s);
  if(members.length){
    const first=members[0];
    return {idTeam:`local-${s}`,strTeam:first.strTeam,strCountry:first.strNationality||'Football',strLeague:first.strLeague||'',strStadium:'Information not yet bundled',intFormedYear:null,strDescriptionEN:`${first.strTeam} profile built from the FootFlux local football database.`,strBadge:first.strTeamBadge||first.strBadge||'',players:members.map(p=>p.idPlayer),next:[]};
  }
  try{
    const r=await fetch(`https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=${encodeURIComponent(name.replace(/-/g,' '))}`);
    const x:any=await r.json();
    const remote:any[] = Array.isArray(x.teams)?x.teams.filter((t:any)=>!t.strSport||text(t.strSport)==='soccer'):[];
    return remote.find((t:any)=>slugify(t.strTeam)===s)||remote[0]||null;
  }catch{return null}
}
export async function clubPlayersByName(name:string){const d=await db();const c=await clubByName(name);if(!c)return [];if(String(c.idTeam).startsWith('local-'))return Object.values(d.players).filter((p:any)=>slugify(p.strTeam||'')===slugify(name));return teamPlayers(c.idTeam)}
export async function clubNextByName(name:string){const c=await clubByName(name);return c?teamNext(c.idTeam):[]}
export async function league(id:string){return {idLeague:id,strLeague:(majorCompetitions.find(x=>x[1]===id)||['Competition'])[0],strBadge:''}}
export async function leagueTeams(name:string){const d=await db();const x=text(name);return Object.values(d.clubs).filter((t:any)=>text(t.strLeague)===x||text(t.strLeague).includes(x))}
export async function nextLeague(id:string){const d=await db();return (d.matches||[]).filter((m:any)=>String(m.idLeague||'')===String(id))}
export async function event(id:string){const d=await db();return (d.matches||[]).find((x:any)=>String(x.idEvent)===String(id))||null}

export const competitionDetails:any={
  'English Premier League':{country:'England',type:'League',season:'2026-2027',description:'England’s top-flight league, with a 20-club season and promotion and relegation below the division.',accent:'Domestic league'},
  'Spanish La Liga':{country:'Spain',type:'League',season:'2026-2027',description:'Spain’s top division featuring the country’s leading professional clubs across a full league season.',accent:'Domestic league'},
  'German Bundesliga':{country:'Germany',type:'League',season:'2026-2027',description:'Germany’s top-flight football league, known for its club-based league format and promotion and relegation system.',accent:'Domestic league'},
  'Italian Serie A':{country:'Italy',type:'League',season:'2026-2027',description:'Italy’s highest domestic football division, contested across a full season by the country’s leading clubs.',accent:'Domestic league'},
  'French Ligue 1':{country:'France',type:'League',season:'2026-2027',description:'France’s leading domestic football division, bringing together clubs from across the country.',accent:'Domestic league'},
  'Eredivisie':{country:'Netherlands',type:'League',season:'2026-2027',description:'The Netherlands’ highest football division and the main domestic league for Dutch professional clubs.',accent:'Domestic league'},
  'UEFA Champions League':{country:'Europe',type:'Cup / European competition',season:'2026-2027',description:'Europe’s premier club competition, bringing together qualifying champions and leading clubs from UEFA member associations.',accent:'European competition'},
  'UEFA Europa League':{country:'Europe',type:'Cup / European competition',season:'2026-2027',description:'UEFA’s second major men’s club competition, featuring clubs that qualify through domestic leagues and cups.',accent:'European competition'},
  'FIFA World Cup':{country:'International',type:'National-team tournament',season:'2026',description:'The global national-team football tournament. FootFlux treats this as a country competition rather than a club league.',accent:'International tournament'},
  'UEFA European Championship':{country:'Europe',type:'National-team tournament',season:'2028',description:'UEFA’s major European national-team tournament. Club links are kept separate from the national-team competition.',accent:'International tournament'},
  'English FA Cup':{country:'England',type:'Cup',season:'2026-2027',description:'England’s historic knockout cup competition, open to clubs across the English football pyramid.',accent:'Domestic cup'},
  'English League Cup':{country:'England',type:'Cup',season:'2026-2027',description:'England’s domestic knockout competition for clubs from the professional league system.',accent:'Domestic cup'},
  'Copa del Rey':{country:'Spain',type:'Cup',season:'2026-2027',description:'Spain’s national knockout cup, contested by clubs from across the Spanish football pyramid.',accent:'Domestic cup'},
  'Italian Coppa Italia':{country:'Italy',type:'Cup',season:'2026-2027',description:'Italy’s national knockout cup competition featuring clubs from the Italian professional game.',accent:'Domestic cup'}
};
export function competitionClubs(name:string){
  const d:any=cache; const x=text(name); const seen=new Set<string>(); const out:any[]=[];
  for(const c of Object.values(d.clubs) as any[]){
    const leagues=[c.strLeague,c.strLeague2,c.strLeague3,c.strLeague4,c.strLeague5,c.strLeague6,c.strLeague7].filter(Boolean).map(text);
    if(leagues.some((v:string)=>v===x||v.includes(x)||x.includes(v))&&!seen.has(c.idTeam)){seen.add(c.idTeam);out.push(c)}
  }
  return out.sort((a,b)=>String(a.strTeam).localeCompare(String(b.strTeam)));
}
export const majorClubs=[['Arsenal','133604'],['Manchester United','133612'],['Manchester City','133613'],['Liverpool','133602'],['Chelsea','133610'],['Tottenham Hotspur','133616'],['Real Madrid','133738'],['Barcelona','133739'],['Atlético Madrid','133729'],['Bayern Munich','133664'],['Borussia Dortmund','133650'],['Juventus','133676'],['Inter','133681'],['AC Milan','133670'],['Paris Saint-Germain','133714'],['Ajax','133675'],['PSV Eindhoven','133632'],['Feyenoord','133628'],['FC Porto','134114'],['Sporting CP','134115'],['AS Monaco','133823'],['Galatasaray','134450'],['Fenerbahçe','134457']];
export const majorCompetitions=[['English Premier League','4328'],['Spanish La Liga','4335'],['German Bundesliga','4331'],['Italian Serie A','4332'],['French Ligue 1','4334'],['Eredivisie','4337'],['UEFA Champions League','4480'],['UEFA Europa League','4481'],['FIFA World Cup','4429'],['UEFA European Championship','4502'],['English FA Cup','4482'],['English League Cup','4570'],['Copa del Rey','4483'],['Italian Coppa Italia','4506']];
export const playerImage=(p:any)=>p?.strCutout||p?.strThumb||'';
export const knownPlayers=['Cristiano Ronaldo','Lionel Messi','Kylian Mbappé','Erling Haaland','Neymar','Lamine Yamal','Jude Bellingham','Mohamed Salah','Robert Lewandowski','Vinícius Júnior'];

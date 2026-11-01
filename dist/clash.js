import {randomGenerator,includes,leagueRollout,parseLeagueVote} from './league.js';
export const TEAMS=['mint','coral'],RULES=['goal','touch','progress','safety'];
export const TEAM_RECIPES={balanced:{name:'Goal getter',weights:{goal:10,touch:0,progress:.5,safety:2}},chaos:{name:'Touch collector',weights:{goal:1,touch:3,progress:0,safety:0}},sprint:{name:'Risk taker',weights:{goal:15,touch:0,progress:1,safety:0}},careful:{name:'Careful coach',weights:{goal:8,touch:0,progress:.3,safety:5}}};
export function parseClashCommand(text){const match=/^!(team|predict)\s+(mint|coral)\s*$/i.exec(text.trim());if(match)return {type:match[1].toLowerCase(),team:match[2].toLowerCase()};const vote=parseLeagueVote(text);return vote?{type:'reward',...vote}:null;}
export function teamRecipe(base,proposed,votes,limit=4){
 const next={...proposed},support={};for(const rule of RULES){const counts=new Map();for(const vote of votes.values())if(vote.rule===rule)counts.set(vote.value,(counts.get(vote.value)||0)+1);if(counts.size){const [value,count]=[...counts].sort((a,b)=>b[1]-a[1]||a[0]-b[0])[0];next[rule]=value;support[rule]=count;}}
 const changes=RULES.filter(k=>next[k]!==base[k]).sort((a,b)=>(support[b]||0)-(support[a]||0)||RULES.indexOf(a)-RULES.indexOf(b));const kept=changes.slice(0,limit),dropped=changes.slice(limit);for(const k of dropped)next[k]=base[k];return {weights:next,changes:kept,dropped};
}
export function kickoffCard(level,seed){const random=randomGenerator(seed),candidates=[{name:'The original kickoff',position:level.spawn},{name:'The northern approach',position:[1,1]},{name:'The southern approach',position:[1,5]},{name:'A midfield start',position:[2,3]}].filter(c=>!includes(level.walls,...c.position)&&!includes(level.hazards,...c.position));const chosen=candidates[Math.floor(random()*candidates.length)];return {...chosen,phase:Math.floor(random()*level.phases),seed};}
export function decideWinner(mint,coral){if(mint.goals!==coral.goals)return {team:mint.goals>coral.goals?'mint':'coral',reason:'More goals'};if(mint.collisions!==coral.collisions)return {team:mint.collisions<coral.collisions?'mint':'coral',reason:'Fewer blocks and possession losses'};return {team:null,reason:'Equal goals and mistakes; an honest draw'};}
export function roundTimeline(mintPolicy,coralPolicy,level,card){
 const options={seed:card.seed,position:card.position,phase:card.phase};const runs={mint:leagueRollout(mintPolicy.q,mintPolicy.weights,level,options),coral:leagueRollout(coralPolicy.q,coralPolicy.weights,level,options)};
 const maps=Object.fromEntries(TEAMS.map(team=>{const map=new Map();for(const frame of runs[team].frames)if(frame.kind!=='reset')map.set(frame.state.t,frame);return [team,map];}));
 return {moves:Array.from({length:121},(_,move)=>({move,mint:maps.mint.get(move),coral:maps.coral.get(move)})),runs,winner:decideWinner(runs.mint.stats,runs.coral.stats)};
}
export class CoachingWindow{
 constructor(){this.members=new Map();this.votes={mint:new Map(),coral:new Map()};this.predictions=new Map();}
 receive(user,text,phase){const command=parseClashCommand(text);if(!command)return {accepted:false};if(command.type==='predict'){if(!['coaching','training','countdown'].includes(phase))return {accepted:false,reason:'Predictions locked'};this.predictions.set(user,command.team);return {accepted:true,...command};}
  if(phase!=='coaching')return {accepted:false,reason:'Coaching is closed'};
  if(command.type==='team'){this.members.set(user,command.team);for(const team of TEAMS)this.votes[team].delete(user);return {accepted:true,...command};}
  const team=this.members.get(user);if(!team)return {accepted:false,reason:'Join with !team mint or !team coral first'};this.votes[team].set(user,{rule:command.rule,value:command.value});return {accepted:true,...command,team};
 }
 counts(){return Object.fromEntries(TEAMS.map(t=>[t,[...this.members.values()].filter(v=>v===t).length]));}
}

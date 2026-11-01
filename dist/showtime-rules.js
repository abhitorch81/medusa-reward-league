export const CAPTAIN_RULES={native:{name:'Trust the world',copy:'Keep this arena’s natural conditions.'},surge:{name:'Crosscurrent surge',copy:'An observable crosswind turns every two moves. Both teams face it.'},calm:{name:'Eye of the storm',copy:'Quiet the vents, sentinel and natural forces. Walls and portal windows remain.'}};
export const TEMPTATIONS={
 lagoon:['The applause trap','Reward every touch. Will Medusa dribble forever?'],
 reef:['Polish the coral','Praise touches instead of finding the detour.'],
 current:['Busy in the current','Does constant activity beat actually reaching the goal?'],
 abyss:['The sentinel bargain','Touch rewards tempt Medusa to avoid the guarded finish.'],
 gravity:['Orbit the paycheck','Will gravity become an excuse to farm touches?'],
 orbit:['Solar gold rush','Collect touch rewards, or ride the wind toward a real goal?'],
 rift:['The wormhole hustle','Will the shortcut help, or will the reward become the destination?'],
 seabed:['Pearls of busywork','Plenty of touches. Any goals before the tide turns?']
};
export function captainLevel(base,rule='native'){
 if(!CAPTAIN_RULES[rule])throw new Error('Unknown captain intervention');
 const level=structuredClone(base);level.captainRule=rule;
 if(rule==='surge')level.phases=base.keeper?24:8;
 if(rule==='calm'){level.hazards=[];level.pulsingHazards=[];level.keeper=false;level.orbitingHazard=null;}
 return level;
}
export function captainForce(level,phase){if(level.captainRule!=='surge')return [0,0];return phase%2===0?[[0,-1],[1,0],[0,1],[-1,0]][Math.floor((phase%8)/2)]:[0,0];}
export function parseShowtimeCommand(text){
 const tempt=/^!tempt\s+(helpful|tempting)\s*$/i.exec(text.trim());if(tempt)return {type:'tempt',choice:tempt[1].toLowerCase()};
 const learn=/^!learn\s+(mint|coral)\s+(score|loophole|struggle)\s*$/i.exec(text.trim());if(learn)return {type:'learn',team:learn[1].toLowerCase(),choice:learn[2].toLowerCase()};return null;
}
export function ballotChoice(ballots){const counts={helpful:0,tempting:0};for(const v of ballots.values())counts[v]++;return {counts,choice:counts.tempting>counts.helpful?'tempting':'helpful'};}
export function learnedOutcome(stats,target){return stats.goals>=target?'score':stats.goals===0&&stats.touches>=40?'loophole':'struggle';}

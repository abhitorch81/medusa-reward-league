// Policies keep one canonical attacking direction; rendering mirrors Coral's
// entire course, including obstacles, forces, portals and kickoff positions.
export function clashDisplayState(state,level,team){
 return {...state,x:team==='coral'?level.width-1-state.x:state.x};
}
export function clashKickoffPositions(level,position){
 return {mint:[...position],coral:[level.width-1-position[0],position[1]]};
}

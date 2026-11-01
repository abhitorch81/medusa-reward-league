// Local locomotion steering for the 3D creatures. The two learned ball policies
// and their measured scores remain independent; this is not multi-agent RL.
export function playerAvoidance(mint,coral,height,previous={mint:0,coral:0},dt=1/30){
 const edge=(height-1)/2+.15,clamp=v=>Math.max(-edge,Math.min(edge,v));
 const near=Math.abs(mint.x-coral.x)<3.8&&Math.abs(mint.z-coral.z)<1.8;
 let mz=mint.z,cz=coral.z;
 if(near){const middle=(mint.z+coral.z)/2;mz=clamp(middle-1.05);cz=clamp(middle+1.05);}
 const mix=1-Math.exp(-Math.max(0,Math.min(dt,.1))*9);
 let a=clamp(mint.z+previous.mint+(mz-mint.z-previous.mint)*mix),b=clamp(coral.z+previous.coral+(cz-coral.z-previous.coral)*mix);
 // A hard personal-space guard catches a low-frame-rate crossing or teleport.
 const dx=mint.x-coral.x,min=1.35;
 if(dx*dx+(a-b)*(a-b)<min*min){const needed=Math.sqrt(Math.max(0,min*min-dx*dx)),mid=(a+b)/2;a=clamp(mid-needed/2);b=clamp(mid+needed/2);if(b-a<needed){if(a===-edge)b=clamp(a+needed);else a=clamp(b-needed);}}
 return {mint:a-mint.z,coral:b-coral.z,avoiding:near};
}

import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('dist/vendor',{recursive:true});
for(const [source,target] of [['three/build/three.module.js','three.module.js'],['three/build/three.core.js','three.core.js'],['three/examples/jsm/controls/OrbitControls.js','OrbitControls.js'],['three/LICENSE','THREE-LICENSE.txt'],['gsap/dist/gsap.min.js','gsap.min.js'],['gsap/README.md','GSAP-README.md']])await copyFile('node_modules/'+source,'dist/vendor/'+target);
console.log('Three.js 0.180.0 and GSAP 3.13.0 bundled locally.');

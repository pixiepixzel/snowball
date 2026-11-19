#!/usr/bin/env python3
# Rebuilds game.js from game.v91.js + the new-world files. Usage: build.py volcano neon farm pirate dino
import sys,os,subprocess
D=os.path.dirname(os.path.abspath(__file__))
worlds=sys.argv[1:] or ['volcano','neon','farm','pirate','dino']
s=open(D+'/game.v91.js').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:70],s.count(a))
    s=s.replace(a,b)
# A. models
lib=open(D+'/nw_lib.js').read()
body=''.join(open(f'{D}/nw_{w}.js').read() for w in worlds)+open(D+'/nw_x16.js').read()
fn=lib+body+'\nreturn[...O,...WL,...SP]}\n'
rep('var iS=[Z(1,`snowflake`',fn+'var iS=[Z(1,`snowflake`')
# B. register
rep('{...tS(`plough`,`snowplough`,`plough`,16747034,Jx,24,!1),height:1.25}],hS=new Map;','{...tS(`plough`,`snowplough`,`plough`,16747034,Jx,24,!1),height:1.25}];mS.push(...NW5());var hS=new Map;')
# C. world definitions
SU={
'volcano':"{key:`volcano`,name:`Volcano Island`,lava:!0,scenes:[L(`Black Sand Beach`,`driftwoodWall`,`driftwood fence`,0x4aa8e0,0xffe0b0,0x77727e,0x625d6a,0x3f8a4a,0x2c5c38,0xfff0c0,1.03),L(`Palm Grove`,`tikiWall`,`tiki fence`,0x3a9ad8,0xd8f0c0,0x8fbe6a,0x6ca452,0x3a7a3c,0x245a30,0xfff4d0,1),L(`Hot Springs`,`geyserWall`,`row of geysers`,0x5ab0c8,0xe0f4f0,0xa8c8c0,0x86a8a0,0x5c8480,0x3c5c60,0xffffff,1.02),L(`Tiki Village`,`basaltWall`,`basalt columns`,0xe07a3a,0xffd08a,0xc8a070,0xa88458,0x7a5c3c,0x4a3828,0xffc880,1),L(`Obsidian Ridge`,`obsidianWall`,`obsidian shards`,0x3a2c50,0xc86a5a,0x6a6078,0x524860,0x322a40,0x1e1a28,0xffa880,.98),L(`Lava Falls`,`magmaWall`,`magma wall`,0x4a1c1c,0xff7a3a,0x7a5a54,0x5c3e36,0x8a2c14,0x2a1a18,0xff9a50,.96),L(`The Crater`,`craterWall`,`crater rim`,0x1c0c10,0xff5a1e,0x6a4c4a,0x4c3032,0xa8380e,0x241416,0xff8a40,.95)],water:0xff5a14,ice:0x4a4650,plough:`lavaBomb`,ramp:`rampVolcano`,bridge:`bridgeVolcano`,chase:{label:`Ash cloud`,color:0x5a5058,glow:0x8a2c14,style:`cloud`},scenery:{backdrop:`spires`,caps:!1,ground:`sand`,weather:{color:0xff9a50,size:.6,fall:-.5,blow:.4},fog:1},music:xu({bpm:118,root:57,scale:gu,chords:[0,3,0,6],lead:`reed`,octave:1,busy:.55,comp:`marimba`,compLine:`arp`,bassLine:`bounce`,drums:`darbuka`,echo:.15}),stars:!1,sources:[9],mixSeed:0,twist:C}",
'neon':"{key:`neon`,name:`Neon City`,scenes:[L(`Back Alley`,`coneWall`,`row of traffic cones`,0x0c0a24,0x4a2a7a,0x5a5c78,0x44465e,0x2c2e48,0x1a1a30,0xc8b8ff,1.02),L(`Night Market`,`lanternWall`,`lantern string`,0x100820,0xa83a5a,0x70607a,0x584a62,0x3c2e48,0x221a30,0xffb0a0,1.02),L(`Arcade Row`,`arcadeWall`,`row of arcade machines`,0x080a28,0x2a5ab8,0x586a90,0x425274,0x2a3654,0x161e36,0xa0d0ff,1.02),L(`Neon Strip`,`signWall`,`neon signs`,0x14062a,0xc83aa8,0x7a5a88,0x5e426c,0x3e2a4c,0x24162e,0xffa0e8,1.03),L(`Skyway`,`barrierWall`,`road barrier`,0x06101e,0x1aa8a0,0x56767a,0x405c60,0x284044,0x14262a,0xa0fff0,1.02),L(`Downtown`,`billboardWall`,`billboards`,0x0a0618,0x6a3ad8,0x62588a,0x4a4270,0x2e2a50,0x1a1832,0xc8a8ff,1.03),L(`Mega Tower`,`skylineWall`,`skyline`,0x04040e,0xe83a7a,0x6a5878,0x50425c,0x34283e,0x1c1424,0xffb0d0,1.04)],water:0x1ad8e8,ice:0xd8f8ff,plough:`streetSweeper`,ramp:`rampNeon`,bridge:`bridgeNeon`,chase:{label:`Blackout`,color:0x2a2440,glow:0x6a3ad8,style:`cloud`},scenery:{backdrop:`city`,caps:!1,ground:`tiles`,weather:{color:0x8ad8ff,size:.5,fall:2.4,blow:.3},fog:1},music:xu({bpm:124,root:61,scale:gu,chords:[0,5,3,4],lead:`chip`,octave:1,busy:.6,hold:.8,bassLine:`bounce`,comp:`chip`,compLine:`arp`,pad:!0,drums:`soft`,echo:.3}),stars:!0,sources:[10],mixSeed:0,twist:C}",
'farm':"{key:`farm`,name:`Farmyard`,scenes:[L(`Meadow`,`picketWall`,`picket fence`,0x4aa8f0,0xd8f0ff,0x9ad86a,0x7cc054,0x5aa040,0x3a7a30,0xfffbe0,1.04),L(`Vegetable Patch`,`hayWall`,`hay bales`,0x58b0f0,0xe8f4d8,0xb89a6a,0x9a7e52,0x6aa044,0x447a30,0xfff6d0,1.03),L(`Orchard`,`hedgeWall`,`hedge`,0x50a8e8,0xf0f0c8,0xa8d070,0x88b458,0x5c9440,0x3a6c2c,0xfff4c0,1.02),L(`Duck Pond`,`stoneWall`,`dry stone wall`,0x5ab8e8,0xd8f4f0,0x8ccc88,0x70b070,0x4c9058,0x30683c,0xffffff,1.02),L(`Barnyard`,`gateWall`,`farm gate`,0xe8a048,0xffe0a8,0xc8b078,0xa8905c,0x8a6c3c,0x5a4426,0xffd898,1),L(`Cornfield`,`cornWall`,`wall of corn`,0xd88a38,0xffd890,0xd8c060,0xb8a048,0x8a8030,0x5a5420,0xffc870,1),L(`Harvest Fair`,`siloWall`,`row of silos`,0x3a4a98,0xf0a070,0xa8a070,0x888256,0x5c6040,0x363c2a,0xffc0a0,.98)],water:0x3a9ad8,ice:0xe8f8ff,plough:`chargingBull`,ramp:`rampFarm`,bridge:`bridgeFarm`,chase:{label:`Twister`,color:0x8a8478,glow:0x4a463c,style:`cloud`},scenery:{backdrop:`hills`,caps:!1,ground:`soft`,weather:{color:0xfff0a0,size:.6,fall:.2,blow:.8},fog:1},music:xu({bpm:120,root:67,scale:bu,chords:[0,3,4,0],lead:`whistle`,octave:1,busy:.7,hold:.7,bass:`pizz`,bassLine:`oompah`,comp:`pluck`,compLine:`broken`,drums:`brush`,echo:.1}),stars:!1,sources:[11],mixSeed:0,twist:C}",
'pirate':"{key:`pirate`,name:`Pirate Cove`,hazard:`cannon`,scenes:[L(`Sandy Shore`,`ropeWall`,`rope fence`,0x38a8e8,0xd0f4ff,0xf0dca0,0xd8c080,0x58b0a0,0x2c7a80,0xfffbe0,1.05),L(`Smugglers' Camp`,`barrelWall`,`barrel stack`,0x3a98d8,0xe8f0d0,0xd8c890,0xb8a870,0x5a9858,0x34683c,0xfff4c8,1.02),L(`Mangrove Creek`,`crateWall`,`crate stack`,0x4a9a98,0xd0ecd8,0x9ab888,0x7a9c6c,0x4a7c54,0x2a5438,0xf0ffe0,1),L(`Port Town`,`palisadeWall`,`palisade`,0xe88a50,0xffd8a0,0xd0b088,0xb09068,0x8a6444,0x543a28,0xffd090,1),L(`Skull Rock`,`skullWall`,`skull rocks`,0x3a3a68,0xa890b8,0x9a98a8,0x7c7a8c,0x54526a,0x302e44,0xe0d8ff,.98),L(`Fortress`,`fortWall`,`fort wall`,0x2a3a70,0xf0a080,0xa8a098,0x8a8278,0x5e5a58,0x38363a,0xffc8a8,.98),L(`Treasure Island`,`treasureWall`,`treasure hoard`,0x1a2458,0xffc850,0xe0c878,0xc0a858,0x7a7a48,0x40482c,0xffe090,1.02)],water:0x1e9ac8,ice:0xdff6ff,plough:`cannonball`,ramp:`rampPirate`,bridge:`bridgePirate`,chase:{label:`Storm surge`,color:0x2a7a98,glow:0x0e3a52,style:`flood`},scenery:{backdrop:`dunes`,caps:!1,ground:`sand`,weather:{color:0xffffff,size:.6,fall:.3,blow:1.4},fog:1},music:xu({bpm:126,beats:3,root:62,scale:gu,chords:[0,6,0,4],lead:`reed`,octave:1,busy:.8,hold:.6,bass:`pizz`,bassLine:`oompah`,comp:`pluck`,compLine:`offbeat`,drums:`toms`,echo:.1}),stars:!1,sources:[12],mixSeed:0,twist:C}",
'dino':"{key:`dino`,name:`Dino Park`,hazard:`stomp`,scenes:[L(`Main Gate`,`turnstileWall`,`turnstiles`,0x48a8e8,0xd8f4e0,0xb8d890,0x98bc74,0x5a9c50,0x34703a,0xfffbe0,1.04),L(`Fossil Dig`,`fossilWall`,`fossil wall`,0x58a8d8,0xf4e4c0,0xd8b888,0xb89868,0x8a7048,0x5a4830,0xfff0c8,1.03),L(`Hatchery`,`eggWall`,`row of giant eggs`,0x4ab0c8,0xe0f8e8,0xa8d8b0,0x88bc94,0x5a9870,0x347050,0xffffff,1.02),L(`Herbivore Plains`,`elecFence`,`electric fence`,0x50a0e0,0xf0f0b8,0xa8c868,0x88ac50,0x5c8c3c,0x3a6428,0xfff4b8,1.02),L(`Raptor Run`,`cageWall`,`cage wall`,0x2a6a58,0xb8e0a0,0x7aa468,0x5e8850,0x3a6a3c,0x204828,0xe8ffc0,.98),L(`T-Rex Kingdom`,`ribWall`,`giant rib cage`,0x3a3a50,0xe89a60,0x9a9070,0x7c7458,0x545040,0x302e28,0xffc890,.96),L(`Meteor Ridge`,`meteorWall`,`meteor crater`,0x1a1030,0xf06a3a,0x8a7068,0x6c5450,0x4a3838,0x2a2024,0xffa070,.96)],water:0x2e9a70,ice:0xe0fff0,plough:`dinoBoulder`,ramp:`rampDino`,bridge:`bridgeDino`,chase:{label:`Stampede`,color:0xb89868,glow:0x5a4830,style:`tumble`},scenery:{backdrop:`hills`,caps:!1,ground:`soft`,weather:{color:0xd8f0a0,size:.6,fall:.2,blow:.4},fog:1},music:xu({bpm:98,root:60,scale:hu,chords:[0,1,4,0],lead:`flute`,octave:1,busy:.45,hold:1.3,comp:`harp`,compLine:`ripple`,pad:!0,drums:`timpani`,echo:.3}),stars:!1,sources:[13],mixSeed:0,twist:C}",
}
allw=['volcano','neon','farm','pirate','dino']
use=[w for w in allw if w in worlds]
assert use==allw[:len(use)],'worlds must be a prefix of '+str(allw)
rep('stars:!1,sources:[8],mixSeed:0,twist:C}],Cu=[','stars:!1,sources:[8],mixSeed:0,twist:C},'+','.join(SU[w] for w in use)+'],Cu=[')
order=['mountain','candy','farm','lost','pirate','desert','volcano','sea','spooky','dino','toys','neon','sky','space']
order=[o for o in order if o not in allw or o in use]
rep('Cu=[`mountain`,`candy`,`lost`,`desert`,`sea`,`spooky`,`toys`,`sky`,`space`]','Cu=['+','.join('`%s`'%o for o in order)+']')
# D. crossing / wandering objects
rep('s.rot=-Math.cos(o*.9+s.phase)*.45}m=!0}','s.rot=-Math.cos(o*.9+s.phase)*.45}else if(s.def.motion===`cross`||s.def.motion===`wander`){let C=s.def.motion===`cross`,t=Math.max(0,ud(s.d)-s.fp),A=o*(C?.5+s.phase%1*.3:.45)+s.phase;s.x=C?Math.sin(A)*t:au(s.baseX+Math.sin(A)*s.size*2.4,-t,t),s.rot=Math.cos(A)>0?-Math.PI/2:Math.PI/2}m=!0}')
# E. lava rivers cannot be frozen
rep('c.need=e.RIVER_NEED_K*n*(ed(t).lap===0?.85:1)','c.need=ad(t).lava?1/0:e.RIVER_NEED_K*n*(ed(t).lap===0?.85:1)')
# F. hazards
haz='''hazTick(t){if(this.state!==`playing`||this.paused||this.tut>=0)return;let a=this.ball,W=ad(a.d),h=W.hazard,r=a.r;if(W.lava)for(let o of this.world.objects)o.def.special===`river`&&o.state===0&&!o.cleared&&o.d>a.d&&o.d-a.d<30*r&&(o.cleared=!0,this.floatAtBall(`LAVA! BRIDGE OR JUMP`,!1));let H=this.hazObjs||(this.hazObjs=[]);for(let i=H.length-1;i>=0;i--){let o=H[i];if(!this.world.objects.includes(o)||o.def.special!==`plough`||!(o.yOff>0)){H.splice(i,1);continue}o.yOff=Math.max(0,o.yOff-36*r*t);o.yOff===0&&(this.effects.burst(o.x,dd(o.d),-o.d,o.size,24,1.1,0),this.audio.thud(o.size),this.rig.shake(.35),H.splice(i,1))}if(!h)return;this.hazT=(this.hazT??6)-t;if(this.hazT>0)return;let Zn=ed(a.d),far=a.d+62*r;if(far>Zn.zoneEnd-14*r||this.stats.time<10){this.hazT=1.5;return}for(let o of this.world.objects)if(o.def.special===`river`&&Math.abs(o.d-far)<o.fp+16*r){this.hazT=1.5;return}let def=uT(W.plough),C=h===`cannon`,D=rd(a.d),half=Math.max(0,ud(far)-D),n=C?1+(Math.random()<.5):2;for(let i=0;i<n;i++){let x=i===0?au(a.x+(Math.random()-.5)*5*r,-half,half):(Math.random()*2-1)*half,o=this.world.spawn(def,x,far+i*10*r,Math.max(D,r)*e.ABSORB_RATIO*(C?1.06:1.25));o&&(o.speed=a.cruiseSpeed()*(C?.45:.28),o.rot=Math.PI,o.yOff=C?28*r:0,C&&H.push(o),this.world.writeMatrix(o,0))}if(C)this.floatAtBall(`CANNON FIRE!`,!1),this.audio.thud(r*2);else{this.floatAtBall(`STOMP!`,!1),this.rig.shake(1.1),this.audio.thud(r*4),this.vibrate(60);for(let k=1;k<=4;k++){let d=a.d+k*10*r;this.effects.burst((Math.random()*2-1)*half,dd(d),-d,r,14,1,0)}}this.hazT=C?5+Math.random()*4:8+Math.random()*5}'''
rep('fxTick(t){let pl=','%sfxTick(t){this.hazTick(t);let pl='%haz)
# H. city skyline backdrop
rep("else if(e===`blocks`){let e=2+p%2,t=a,r=g;","else if(e===`city`){let t=g*(.4+uu(p,n+7)*.35),r=h*(.6+uu(p,n+8)*.8);x(new xa(t,r,t),a+r/2,c,.03),x(new xa(t*1.02,r*.02,t*1.02),a+r*.99,l[(p+n)%l.length],.01),p%2==0&&(x(new xa(t*.6,r*.5,t*.6),a+r*.25,d,.03,void 0,1/0,t*.9),x(new xa(t*.62,r*.02,t*.62),a+r*.5,l[(p+n+3)%l.length],.01,void 0,1/0,t*.9))}else if(e===`blocks`){let e=2+p%2,t=a,r=g;")
rep("d(`blocks`,[0,0],[0,0]),","d(`blocks`,[0,0],[0,0]),d(`city`,[0x20203a,0x18182e],[0x16162c,0x101024]),")
# I. lava end-screen text
rep("sunk:{title:`Sunk!`,subtitle:`Too small to freeze the river in the ${o}. ${s}`}","sunk:ad(this.ball.d).lava?{title:`Melted!`,subtitle:`You fell in the lava in the ${o}. Use the bridge or jump over it. ${s}`}:{title:`Sunk!`,subtitle:`Too small to freeze the river in the ${o}. ${s}`}")
# G. keep everyone's unlocked worlds after the reorder
old="[`mountain`,`candy`,`lost`,`desert`,`sea`,`spooky`,`toys`,`sky`,`space`]"
rep('let x=this.save.x||(this.save.x={});if(x.skv!==2){','let x=this.save.x||(this.save.x={});if(x.wv!==2){let o=%s,r=this.save.reached|0;this.save.reached=r>=o.length?r+%d:Math.max(r,Cu.indexOf(o[r]));x.wv=2;ZC(this.save)}if(x.skv!==2){'%(old,len(use)))
# J. smooth shading on curved surfaces (crease angle), with a Settings switch
rep("function Vw(t){let n=t.getAttribute(`position`);","function SMN(g,deg,wc,Q=400){let p=g.getAttribute(`position`),C=wc?g.getAttribute(`color`):null,n=p.count,T=n/3,fa=new Float32Array(T*3),fu=new Float32Array(T*3),map=new Map,key=Array(n),c=Math.cos(deg*Math.PI/180),out=new Float32Array(n*3),oc=C?new Float32Array(n*3):null;for(let t=0;t<T;t++){let i=t*3,ax=p.getX(i),ay=p.getY(i),az=p.getZ(i),ux=p.getX(i+1)-ax,uy=p.getY(i+1)-ay,uz=p.getZ(i+1)-az,vx=p.getX(i+2)-ax,vy=p.getY(i+2)-ay,vz=p.getZ(i+2)-az,x=uy*vz-uz*vy,y=uz*vx-ux*vz,z=ux*vy-uy*vx,l=Math.hypot(x,y,z)||1;fa[i]=x,fa[i+1]=y,fa[i+2]=z,fu[i]=x/l,fu[i+1]=y/l,fu[i+2]=z/l}for(let i=0;i<n;i++){let k=Math.round(p.getX(i)*Q)+`,`+Math.round(p.getY(i)*Q)+`,`+Math.round(p.getZ(i)*Q),a=map.get(k);a||map.set(k,a=[]),a.push(i),key[i]=a}for(let i=0;i<n;i++){let t=(i/3|0)*3,x=0,y=0,z=0,r=0,gg=0,b=0,m=0,r0=C?C.getX(i):0,g0=C?C.getY(i):0,b0=C?C.getZ(i):0;for(let q of key[i]){let j=(q/3|0)*3;if(fu[j]*fu[t]+fu[j+1]*fu[t+1]+fu[j+2]*fu[t+2]>=c){x+=fa[j],y+=fa[j+1],z+=fa[j+2];if(C){let r1=C.getX(q),g1=C.getY(q),b1=C.getZ(q);Math.abs(r1-r0)+Math.abs(g1-g0)+Math.abs(b1-b0)<.3&&(r+=r1,gg+=g1,b+=b1,m++)}}}let l=Math.hypot(x,y,z)||1;out[i*3]=x/l,out[i*3+1]=y/l,out[i*3+2]=z/l;C&&(oc[i*3]=r/m,oc[i*3+1]=gg/m,oc[i*3+2]=b/m)}return{n:out,c:oc}}function SMA(g){let u=g.userData;if(!u.nf)return;let a=g.getAttribute(`normal`),k=g.getAttribute(`color`);if(SETTINGS.smooth&&!u.ns){let r=SMN(g,66,!0);u.ns=r.n,u.cs=r.c}a.array.set(SETTINGS.smooth?u.ns:u.nf),a.needsUpdate=!0,k.array.set(SETTINGS.smooth?u.cs:u.cf),k.needsUpdate=!0}function SMG(g){let a=g.getAttribute(`normal`),k=g.getAttribute(`color`);if(!a||!k)return;g.userData.nf=new Float32Array(a.array),g.userData.cf=new Float32Array(k.array),SETTINGS.smooth&&SMA(g)}function Vw(t){let n=t.getAttribute(`position`);")
rep("e.flat&&Vw(t),Bw(t,!!e.tints);","e.flat&&Vw(t),Bw(t,!!e.tints),e.flat||SMG(t);")
rep("setRealShadows(e){if(e!==this.realShadows){","setSmooth(){for(let p of this.poolList)SMA(p.mesh.geometry)}setRealShadows(e){if(e!==this.realShadows){")
rep("draw(e){let t=e.build(),n=t.getAttribute(`position`);","draw(e){let t=e.build(),n=t.getAttribute(`position`);e.flat||SMG(t);")
rep("var SETTINGS={sens:1,shake:1,left:!1,lines:1,bossmo:1};","var SETTINGS={sens:1,shake:1,left:!1,lines:1,bossmo:1,smooth:0};")
rep("Object.assign({sens:1,shake:1,left:0,lines:1,bossmo:1},this.save.x.set||{});SETTINGS.sens=e.sens,","Object.assign({sens:1,shake:1,left:0,lines:1,bossmo:1,smooth:0},this.save.x.set||{});SETTINGS.smooth!==e.smooth&&(SETTINGS.smooth=e.smooth,this.world&&this.world.setSmooth(),this.env&&this.env.setSmooth()),setSw(\"set-smooth\",\"Smooth objects\",e.smooth),SETTINGS.sens=e.sens,")
rep('e("set-bossmo")?.addEventListener("click",()=>t({bossmo:this.save.x.set.bossmo?0:1})),','e("set-bossmo")?.addEventListener("click",()=>t({bossmo:this.save.x.set.bossmo?0:1})),document.getElementById("set-smooth")?.addEventListener("click",()=>{t({smooth:this.save.x.set.smooth?0:1});if(this.state===`title`){let e=this.startPoint(this.startLap);this.reset(e.d,e.base)}}),')
h=open(D+'/index.v42.html').read()
x='<button id="set-bossmo" class="switch" type="button">Boss slow-mo: on</button>'
assert h.count(x)==1
open(D+'/index.html','w').write(h.replace(x,x+' <button id="set-smooth" class="switch off" type="button">Smooth objects: off</button>'))
# K. smooth terrain, backdrop and clouds
rep("fillGround(t,n,r,i,a,o){let s=e.GROUND_ROWS,","gvS(K,E,r,i,a){let o=e.GROUND_ROWS,n=E/2,s=r+(i-r)*n/o,c=ud(s),k=Math.min(Dw-1,Math.floor(K/3)),u=K/3-k,l=Tw[k]+(Tw[k+1]-Tw[k])*u,p0=Ew[Math.max(0,k-1)],p1=Ew[k],p2=Ew[k+1],p3=Ew[Math.min(Dw,k+2)],h=Math.max(0,.5*(2*p1+(-p0+p2)*u+(2*p0-5*p1+4*p2-p3)*u*u+(-p0+3*p1-3*p2+p3)*u*u*u));Math.abs(l)<=1.0001&&(h=0);if(h>0){let g=this.chunkIndex*o+n;h=kw(h,l,g)*(1+.12*(N2(l*1.3+(l>0?40:0),g/3.5)-.5)*Math.min(1,h/.3))}return a.set(l*c,dd(s)+h*c,-s),h}fillGroundS(t,n,r,i,a,o){let s=e.GROUND_ROWS,c=t.geometry,P=c.getAttribute(`position`),N=c.getAttribute(`normal`),C=c.getAttribute(`color`),U=c.getAttribute(`uv`),p=P.array,m=N.array,h=C.array,g=U.array,KC=Dw*3,RC2=s*2,W=KC+1,R=RC2+3,px=new Float32Array(W*R*3),hv=new Float32Array(W*R),nx=new Float32Array(W*R*3),cl=new Float32Array(W*R*3),v=Yw,ss=(a,b,x)=>(x=au((x-a)/(b-a),0,1),x*x*(3-2*x));c.setDrawRange(0,KC*RC2*6);for(let e=-1;e<=RC2+1;e++)for(let k=0;k<W;k++){let q=(e+1)*W+k;hv[q]=this.gvS(k,e,n,r,v),px[q*3]=v.x,px[q*3+1]=v.y,px[q*3+2]=v.z}let B=[o.bankLow,o.bankMid,o.ridge,o.ridgeSnow];for(let e=0;e<=RC2;e++){let G=this.chunkIndex*s+e/2;for(let k=0;k<W;k++){let q=(e+1)*W+k,a0=(q-(k>0?1:0))*3,a1=(q+(k<KC?1:0))*3,b0=(q-W)*3,b1=(q+W)*3,ux=px[a1]-px[a0],uy=px[a1+1]-px[a0+1],uz=px[a1+2]-px[a0+2],vx=px[b1]-px[b0],vy=px[b1+1]-px[b0+1],vz=px[b1+2]-px[b0+2],x=uy*vz-uz*vy,y=uz*vx-ux*vz,z=ux*vy-uy*vx,l=Math.hypot(x,y,z)||1;nx[q*3]=x/l,nx[q*3+1]=y/l,nx[q*3+2]=z/l;let H=hv[q],kk=Math.min(Dw-1,Math.floor(k/3)),X=Tw[kk]+(Tw[kk+1]-Tw[kk])*(k/3-kk),mm=1.25+(Ow(G/6,X<0?5:24)-.5)*.3,T=[ss(0,.07,H),ss(.08,.34,H),ss(.42,.85,H),ss(mm-.16,mm+.16,H)],cr=o.lane.r,cg=o.lane.g,cb=o.lane.b;for(let j=0;j<4;j++){let t=T[j],c=B[j];cr+=(c.r-cr)*t,cg+=(c.g-cg)*t,cb+=(c.b-cb)*t}let f=1;cl[q*3]=cr*f,cl[q*3+1]=cg*f,cl[q*3+2]=cb*f}}let _=0,w=0,put=(q,u0,v0)=>{q*=3,p[_]=px[q],p[_+1]=px[q+1],p[_+2]=px[q+2],m[_]=nx[q],m[_+1]=nx[q+1],m[_+2]=nx[q+2],h[_]=cl[q],h[_+1]=cl[q+1],h[_+2]=cl[q+2],g[w]=u0,g[w+1]=v0,_+=3,w+=2};for(let e=0;e<RC2;e++){let c0=i+a*e/RC2,c1=i+a*(e+1)/RC2;for(let k=0;k<KC;k++){let A=(e+1)*W+k,kk=Math.floor(k/3),u0=k/3-kk,f0=(Tw[kk]+(Tw[kk+1]-Tw[kk])*u0)*.9,f1=(Tw[kk]+(Tw[kk+1]-Tw[kk])*(u0+1/3))*.9;put(A,f0,c0),put(A+1,f1,c0),put(A+W+1,f1,c1),put(A,f0,c0),put(A+W+1,f1,c1),put(A+W,f0,c1)}}U.needsUpdate=!0,P.needsUpdate=!0,N.needsUpdate=!0,C.needsUpdate=!0}fillGround(t,n,r,i,a,o){if(SETTINGS.smooth)return this.fillGroundS(t,n,r,i,a,o);t.geometry.setDrawRange(0,Dw*e.GROUND_ROWS*6);let s=e.GROUND_ROWS,")
rep("createGroundMesh(){let t=Dw*e.GROUND_ROWS*6,","createGroundMesh(){let t=Dw*e.GROUND_ROWS*36,")
rep("function Ow(e,t){","function N2(a,b){let i=Math.floor(a),f=a-i,w=f*f*(3-2*f);return Ow(b,i+101)*(1-w)+Ow(b,i+102)*w}function MCS(e,t,i){let a=new wa(e,t,30,20,!0).toNonIndexed(),o=a.getAttribute(`position`),s1=uu(i,1)*6.28,s2=uu(i,2)*6.28,s3=uu(i,3)*6.28;for(let n=0;n<o.count;n++){let x=o.getX(n),y=o.getY(n),z=o.getZ(n),k=(y+t/2)/t,th=Math.atan2(z,x),f=1+(.22*Math.sin(3*th+s1+k*2)+.11*Math.sin(5*th+s2-k*3)+.05*Math.sin(9*th+s3))*(1-k*.2);o.setXYZ(n,x*f,y,z*f)}return a}function Ow(e,t){")
rep("c[n]=Math.min(1,d.r*f),c[n+1]=Math.min(1,d.g*f),c[n+2]=Math.min(1,d.b*f)}}e.setAttribute(`color`,new ai(c,3))}","c[n]=Math.min(1,d.r*f),c[n+1]=Math.min(1,d.g*f),c[n+2]=Math.min(1,d.b*f)}}e.setAttribute(`color`,new ai(c,3));{let N=SMN(e,70,!1,3e4).n,S=new Float32Array(s.count*3),W=new Float32Array(s.count*3),Hh=new Float32Array(s.count);for(let v=0;v<s.count;v++){let l=Math.max(0,N[v*3]*NC.x+N[v*3+1]*NC.y+N[v*3+2]*NC.z),f=.6+.46*l,X=s.getX(v),Z=s.getZ(v);S[v*3]=Math.min(1,a.r*f),S[v*3+1]=Math.min(1,a.g*f),S[v*3+2]=Math.min(1,a.b*f),W[v*3]=Math.min(1,o.r*f),W[v*3+1]=Math.min(1,o.g*f),W[v*3+2]=Math.min(1,o.b*f),Hh[v]=Number.isFinite(i)?s.getY(v)-(i+.012*Math.sin((X+Z)*70)+.006*Math.sin(X*151-Z*113)):-1}e.setAttribute(`colorS`,new ai(S,3)),e.setAttribute(`snowS`,new ai(W,3)),e.setAttribute(`snowH`,new ai(Hh,1))}}")
rep("n[e*3]=.8+.2*r,n[e*3+1]=.85+.15*r,n[e*3+2]=.93+.07*r}e.setAttribute(`color`,new ai(n,3))}","n[e*3]=.8+.2*r,n[e*3+1]=.85+.15*r,n[e*3+2]=.93+.07*r}e.setAttribute(`color`,new ai(n,3));{let N=SMN(e,85,!1,3e4).n,S=new Float32Array(t.count*3);for(let v=0;v<t.count;v++){let r=N[v*3+1]*.5+.5;S[v*3]=.8+.2*r,S[v*3+1]=.85+.15*r,S[v*3+2]=.93+.07*r}e.setAttribute(`colorS`,new ai(S,3))}}")
rep("n.add(this.backdrop)}setShadows(e){this.sun.castShadow=e}","n.add(this.backdrop),this.setSmooth()}setSmooth(){for(let m of[this.clouds]){let g=m.geometry,k=g.getAttribute(`color`),S=g.getAttribute(`colorS`),u=g.userData;if(!k||!S)continue;u.cf||(u.cf=new Float32Array(k.array)),k.array.set(SETTINGS.smooth?S.array:u.cf),k.needsUpdate=!0}}setShadows(e){this.sun.castShadow=e}")
# hi-res smooth backdrop variants
rep("d=(e,t,n)=>{let r=[],i=(t,n,i,a,o,s,c,d,f)=>{","d=(e,t,n,S=0)=>{let r=[],i=(t,n,i,a,o,s,c,d,f)=>{")
rep("if(e===`peaks`)x(MC(g,h,7,.36,n+p),a+h/2,c,.07,d,a+h*(.56+uu(p,n+6)*.1));else if(e===`dunes`){let e=new Ea(1,1);","if(e===`peaks`)x(S?MCS(g,h,n+p):MC(g,h,7,.36,n+p),a+h/2,c,.07,d,a+h*(.56+uu(p,n+6)*.1));else if(e===`dunes`){let e=new Ea(1,S?3:1);")
rep("else if(e===`hills`){let e=new Ea(1,1);","else if(e===`hills`){let e=new Ea(1,S?3:1);")
rep("x(new Ea(e,1),a+e*.35,t,.03),p%3==0&&(x(new Ea(e*.72,1),r+e*.2,u[(p+n+1)%u.length],.03),r+=e*.82);let i=new Ea(1,1);i.scale(e*.62,e*.26,e*.62),x(i,r,d,.02),x(new Ea(e*.15,1),r+e*.3,14829372,.03)}","x(new Ea(e,S?3:1),a+e*.35,t,.03),p%3==0&&(x(new Ea(e*.72,S?3:1),r+e*.2,u[(p+n+1)%u.length],.03),r+=e*.82);let i=new Ea(1,S?2:1);i.scale(e*.62,e*.26,e*.62),x(i,r,d,.02),x(new Ea(e*.15,S?2:1),r+e*.3,14829372,.03)}")
rep("else if(e===`spires`)x(MC(g*.4,h*1.5,5,.32,n+p),a+h*.75,c,.08),x(MC(g*.26,h*.85,5,.32,n+p+50),a+h*.42,d,.08,void 0,1/0,g*.32);","else if(e===`spires`)x(S?MCS(g*.4,h*1.5,n+p):MC(g*.4,h*1.5,5,.32,n+p),a+h*.75,c,.08),x(S?MCS(g*.26,h*.85,n+p+50):MC(g*.26,h*.85,5,.32,n+p+50),a+h*.42,d,.08,void 0,1/0,g*.32);")
rep("x(new Ca(r*.8,r,i,7,1,!0),a+i/2,c,.06,void 0,1/0,e*g);let o=new Ea(1,1);","x(new Ca(r*.8,r,i,S?18:7,1,!0),a+i/2,c,.06,void 0,1/0,e*g);let o=new Ea(1,S?2:1);")
rep("let a=AC(r);if(!a)return;let o=new Wi(a,this.peakMaterial);o.renderOrder=-2,o.frustumCulled=!1,o.visible=e===`peaks`,this.backdrop.add(o),this.backdrops.set(e,o)};","let a=AC(r);if(!a)return;S&&a.getAttribute(`color`).array.set(a.getAttribute(`colorS`).array);let o=new Wi(a,this.peakMaterial);o.renderOrder=-2,o.frustumCulled=!1,o.visible=!1,this.backdrop.add(o),this.backdrops.set(e+(S?`_s`:``),o);S||d(e,t,n,1)};")
rep("this.backdrops.forEach((e,t)=>e.visible=t===d.scenery.backdrop)","this.backdrops.forEach((e,t)=>e.visible=t===d.scenery.backdrop+(SETTINGS.smooth?`_s`:``))")
# L. rounder ball shapes when smoothing is on
rep("function V(e,t,n={},r=0){return xd(new Ea(e,r),t,n,0)}","function V(e,t,n={},r=0){return xd(new Ea(e,SETTINGS&&SETTINGS.smooth&&r<1?1:r),t,n,0)}")
# M. smooth look is off by default; reset anyone who had it on from the earlier default
rep("xSet(){let e=this.save.x.set=Object.assign(","xSet(){let X=this.save.x;X.smv!==1&&(X.set&&(X.set.smooth=0),X.smv=1);let e=this.save.x.set=Object.assign(")
# N. test button: level 50 + all worlds
rep('e("set-tut")?.addEventListener("click",()=>{','document.getElementById("set-max")?.addEventListener("click",v=>{let q=v.currentTarget;if(!q.dataset.arm){q.dataset.arm=1;q.textContent="Tap again to confirm";return}let x=0;for(let i=1;i<50;i++)x+=zC(i);this.save.xp=Math.max(this.save.xp||0,x);this.save.reached=Math.max(this.save.reached||0,Eu);for(let k of l)k.level&&k.level<=50&&!this.save.skins.includes(k.id)&&this.save.skins.push(k.id);ZC(this.save);location.reload()}),e("set-tut")?.addEventListener("click",()=>{')
h=open(D+'/index.html').read()
x='<button id="set-tut" class="switch" type="button">Replay tutorial</button>'
assert h.count(x)==1
open(D+'/index.html','w').write(h.replace(x,x+' <button id="set-max" class="switch" type="button">Unlock level 50 + all worlds</button>'))
# O. Common gear has no star perk
rep("n===\"hat\"?BS.reach+=o:n===\"scarf\"?BS.hitLoss*=1-o:n===\"nose\"?BS.growth+=o:BS.grip+=o,a.ap(BS,a.v[r.r])}","n===\"hat\"?BS.reach+=o:n===\"scarf\"?BS.hitLoss*=1-o:n===\"nose\"?BS.growth+=o:BS.grip+=o,r.r>0&&a.ap(BS,a.v[r.r])}")
rep("perk:K.perk(K.v[r]),set:","perk:r>0?K.perk(K.v[r]):``,set:")
rep('n("div","gear-perk","\u2605 "+r.worn.perk)','n("div","gear-perk",r.worn.perk?"\u2605 "+r.worn.perk:"No \u2605 perk on Common gear")')
rep('n("div","gear-pperk","\u2605 "+o.perk)','n("div","gear-pperk",o.perk?"\u2605 "+o.perk:"No \u2605 perk on Common gear")')
rep("Every item has its own \u2605 perk.","Uncommon and better items have their own \u2605 perk.")
# P. more gear (recoloured models with new perks) and more skins
rep("r=e?.hat??-1,i=e?.scarf??-1,a=e?.nose??-1,o=Math.PI;","r=e?.hat??-1,i=e?.scarf??-1,a=e?.nose??-1,o=Math.PI;let GXh={8:[0,0x26356e],9:[1,0x4a5ad8],10:[2,0xd8302a],11:[3,0x5a2ab8],12:[4,0xb87333],13:[5,0x8fd8ff]},GXs={8:[0,0x4ad8a8],9:[1,0xffc82a],10:[2,0xdfeaff],11:[0,0x2a2a4a],12:[2,0xff7aa8],13:[6,0x2a7ad8]},GXn={7:[0,0x2a2a30],8:[1,0xf2e6c0],9:[1,0xe8302a],10:[4,0x3a8af0],11:[4,0x2ad87a],12:[6,0xf2c230]},GXb={5:[0,0xe8302a],6:[1,0x3a8af0],7:[2,0x8fd8ff],8:[3,0x3a3a44],9:[4,0xf2c230],10:[0,0x3fae5a]},HCo,SCo,NCo,BCo;GXh[r]&&([r,HCo]=GXh[r]);GXs[i]&&([i,SCo]=GXs[i]);GXn[a]&&([a,NCo]=GXn[a]);")
rep("let e=[14173242,3124826,3108816,2236962,10134445,16761390,16766720,14031400][r];","let e=HCo??[14173242,3124826,3108816,2236962,10134445,16761390,16766720,14031400][r];")
rep("let e=[13189184,3119690,16238297,12071471,4708032,16742938,3104720,14031400][i],","let e=SCo??[13189184,3119690,16238297,12071471,4708032,16742938,3104720,14031400][i],")
rep("let e=[8421504,16747034,16747034,9426175,13215999,16761390,4865826][a],","let e=NCo??[8421504,16747034,16747034,9426175,13215999,16761390,4865826][a],")
rep("let c=e?.boots??-1;if(c>=0){let e=[15909424,13189184,15921906,12108752,9067051][c];","let c=e?.boots??-1;GXb[c]&&([c,BCo]=GXb[c]);if(c>=0){let e=BCo??[15909424,13189184,15921906,12108752,9067051][c];")
NH=r',{name:"Night beanie",icon:"\u{1F9E2}",vis:8,v:[1.04,1.07,1.1,1.14,1.18,1.22],perk:v=>`Night owl: +${gPct(v-1)}% XP from runs`,ap:(B,v)=>{B.xp*=v}},{name:"Blueberry bobble",icon:"\u{1F9E2}",vis:9,v:[1.1,1.18,1.26,1.35,1.45,1.55],perk:v=>`Sticky: combos last ${gPct(v-1)}% longer`,ap:(B,v)=>{B.combo*=v}},{name:"Racing helmet",icon:"⛑️",vis:10,v:[1,2,3,4,5,7],perk:v=>`Racer: +${v} coins per close call`,ap:(B,v)=>{B.closeCoins+=v}},{name:"Magician\'s hat",icon:"\u{1F3A9}",vis:11,v:[1.1,1.18,1.26,1.35,1.5,1.7],perk:v=>`Trick: gold discs appear ${gPct(v-1)}% more`,ap:(B,v)=>{B.secret*=v}},{name:"Chieftain helmet",icon:"⚔️",vis:12,v:[1.1,1.18,1.26,1.35,1.45,1.6],perk:v=>`Bash: knock the avalanche back ${gPct(v-1)}% further`,ap:(B,v)=>{B.push*=v}},{name:"Frost crown",icon:"\u{1F451}",vis:13,v:[.97,.95,.93,.9,.87,.84],perk:v=>`Ice king: freeze rivers while ${gPct(1-v)}% smaller`,ap:(B,v)=>{B.river*=v}}'
NS=r',{name:"Mint scarf",vis:8,v:[.06,.1,.14,.18,.22,.28],perk:v=>`Fresh: melt ${gPct(v)}% slower`,ap:(B,v)=>{B.melt*=1-v}},{name:"Sunny scarf",vis:9,v:[.04,.08,.12,.16,.2,.26],perk:v=>`Bright: +${gPct(v)}% coins from runs`,ap:(B,v)=>{B.coins*=1+v}},{name:"Cloud scarf",vis:10,v:[1.06,1.1,1.14,1.2,1.26,1.32],perk:v=>`Light: jump ${gPct(v-1)}% higher`,ap:(B,v)=>{B.jump*=v}},{name:"Midnight scarf",vis:11,v:[1.04,1.08,1.12,1.16,1.2,1.25],perk:v=>`Charmed: +${gPct(v-1)}% rare finds and gold discs`,ap:(B,v)=>{B.luck*=v}},{name:"Rose scarf",vis:12,v:[1.04,1.08,1.12,1.16,1.22,1.28],perk:v=>`Bloom: begin each run ${gPct(v-1)}% bigger`,ap:(B,v)=>{B.start*=v}},{name:"Ocean bandana",vis:13,v:[1.06,1.12,1.18,1.24,1.3,1.36],perk:v=>`Surf: walls grow you ${gPct(v-1)}% more`,ap:(B,v)=>{B.gate*=v}}'
NN=r',{name:"Coal nose",icon:"⚫",vis:7,v:[.04,.06,.08,.11,.14,.18],perk:v=>`Tough: ${gPct(v)}% less size lost on hits`,ap:(B,v)=>{B.hitLoss*=1-v}},{name:"Parsnip nose",icon:"\u{1F955}",vis:8,v:[1,2,3,4,6,8],perk:v=>`Digger: +${v} coins per wall smashed`,ap:(B,v)=>{B.wallCoins+=v}},{name:"Chilli nose",icon:"\u{1F336}️",vis:9,v:[.015,.02,.03,.04,.05,.06],perk:v=>`Hot streak: close calls grow you ${gPct(v*10)/10}%`,ap:(B,v)=>{B.closeGrow+=v}},{name:"Sapphire nose",icon:"\u{1F48E}",vis:10,v:[1,2,3,4,5,7],perk:v=>`Cool head: +${v} coins per close call`,ap:(B,v)=>{B.closeCoins+=v}},{name:"Emerald nose",icon:"\u{1F48E}",vis:11,v:[1.06,1.1,1.14,1.2,1.28,1.36],perk:v=>`Lucky find: ${gPct(v-1)}% better gear drop chance`,ap:(B,v)=>{B.drop*=v}},{name:"Gold button",icon:"\u{1F7E1}",vis:12,v:[1.1,1.16,1.22,1.3,1.38,1.46],perk:v=>`Polished: ${gPct(v-1)}% longer safe time after hits`,ap:(B,v)=>{B.invuln*=v}}'
NB=r',{name:"Red wellies",icon:"\u{1F462}",vis:5,v:[1.03,1.05,1.07,1.09,1.11,1.14],perk:v=>`Stomper: snow packs on ${gPct(v-1)}% faster as you roll`,ap:(B,v)=>{B.pack*=v}},{name:"Trainers",icon:"\u{1F45F}",vis:6,v:[.4,.6,.8,1.1,1.4,1.8],perk:v=>`Warm-up: melting starts ${v}s later`,ap:(B,v)=>{B.grace+=v}},{name:"Snow boots",icon:"\u{1F97E}",vis:7,v:[.05,.08,.11,.14,.18,.22],perk:v=>`Frosty: melt ${gPct(v)}% slower`,ap:(B,v)=>{B.melt*=1-v}},{name:"Jet boots",icon:"\u{1F680}",vis:8,v:[1.1,1.18,1.26,1.35,1.45,1.55],perk:v=>`Blast: ${gPct(v-1)}% wider SLAM when landing off ramps`,ap:(B,v)=>{B.slam*=v}},{name:"Golden skis",icon:"\u{1F3BF}",vis:9,v:[1.08,1.14,1.2,1.28,1.36,1.45],perk:v=>`Gold rush: gold discs appear ${gPct(v-1)}% more`,ap:(B,v)=>{B.secret*=v}},{name:"Lucky wellies",icon:"\u{1F340}",vis:10,v:[1.04,1.08,1.12,1.16,1.2,1.25],perk:v=>`Lucky: +${gPct(v-1)}% rare finds and gold discs`,ap:(B,v)=>{B.luck*=v}}'
rep("ap:(B,v)=>{B.drop*=v}}]},\nscarf:","ap:(B,v)=>{B.drop*=v}}"+NH+"]},\nscarf:")
rep("ap:(B,v)=>{B.wallCoins+=v}}]},\nnose:","ap:(B,v)=>{B.wallCoins+=v}}"+NS+"]},\nnose:")
rep("ap:(B,v)=>{B.wallCoins+=v}}]},\nboots:","ap:(B,v)=>{B.wallCoins+=v}}"+NN+"]},\nboots:")
rep("ap:(B,v)=>{B.bounce=Math.max(B.bounce,v)}}]}};","ap:(B,v)=>{B.bounce=Math.max(B.bounce,v)}}"+NB+"]}};")
rep('{name:"Festive",icon:"\\u{1F384}",event:1,','{name:"Frost",icon:"\\u2744\\uFE0F",p:{hat:13,scarf:8,nose:8,boots:7},b:["Melt 25% slower","Freeze rivers while 8% smaller"],ap:[B=>{B.melt*=.75},B=>{B.river*=.92}]},{name:"Treasure",icon:"\\u2B50",p:{hat:11,scarf:9,nose:10,boots:9},b:["+10% coins","Gold discs appear 20% more"],ap:[B=>{B.coins*=1.1},B=>{B.secret*=1.2}]},{name:"Festive",icon:"\\u{1F384}",event:1,')
import re as _re
def after(idn,new):
    global s
    m=_re.search(r'\{id:`%s`,[^}]*\}'%idn,s);assert m,idn
    s=s[:m.end()]+','+new+s[m.end():]
SK=[('bubblegum',"{id:`mint`,name:`Mint chip`,price:75,pattern:`speckle`,colors:[0x9fe8c8,0xc8f6e0,0x5a3a2a],weights:[.5,.35,.15],shine:.3,glow:0}"),
('camo',"{id:`tennis`,name:`Tennis ball`,price:200,pattern:`bands`,colors:[0xd4ee3a,0xffffff,0xd4ee3a],count:3,wave:.16,wf:2,shine:.05,glow:0}"),
('bee',"{id:`basketball`,name:`Basketball`,price:400,pattern:`wedges`,colors:[0xe8772a,0xdd6a20],count:8,ribs:1,shine:.15,glow:0}"),
('football',"{id:`cookie`,name:`Cookie dough`,price:600,pattern:`patches`,colors:[0xe0b070,0x5a3418],count:16,spread:.17,shine:.05,glow:0}"),
('beach',"{id:`polka`,name:`Polka dot`,price:850,pattern:`patches`,colors:[0xff5a8a,0xffffff],count:22,spread:.19,shine:.3,glow:0}"),
('melon',"{id:`sunset`,name:`Sunset`,price:1200,pattern:`bands`,colors:[0x2a2a6a,0x8a3a8a,0xe85a5a,0xffa03a,0xffd86a],count:5,soft:.12,shine:.3,glow:0}"),
('peppermint',"{id:`lime`,name:`Lime slice`,price:1800,pattern:`wedges`,colors:[0xb8f03a,0xe8ffa0],count:16,cap:0x6ab82a,shine:.4,glow:0}"),
('gold',"{id:`neongrid`,name:`Neon grid`,price:2500,pattern:`tiles`,colors:[0x14143a,0x1c1c4a],weights:[.5,.5],count:10,grout:0x22e6ff,soft:.01,shine:.8,glow:0x0a3a5a}"),
('marble',"{id:`cow`,name:`Cow`,price:0,level:8,pattern:`camo`,colors:[0xffffff,0x1c1c1c,0x1c1c1c,0xffffff],shine:.05,glow:0}"),
('ladybird',"{id:`moonrock`,name:`Moon rock`,price:0,level:12,pattern:`camo`,colors:[0xc8c8d0,0xa8a8b4,0x9a9aa6,0xe0e0e8],shine:.1,glow:0}"),
('zebra',"{id:`leopard`,name:`Leopard`,price:0,level:18,pattern:`patches`,colors:[0xe8b85a,0x3a2410],count:34,spread:.13,shine:.1,glow:0}"),
('tiger',"{id:`ocean`,name:`Ocean`,price:0,level:26,pattern:`veins`,colors:[0x1a5ad8,0x2a7ae8,0x8ad8ff,0xffffff],vw:.14,seed:8.2,shine:.6,glow:0x0a1a4a}"),
('planet',"{id:`amethyst`,name:`Amethyst`,price:0,level:33,pattern:`sparkle`,colors:[0x9a5ae8,0xffffff,0x6a2ab8],shine:1,glow:0x1a0a3a}"),
('sun',"{id:`toxic`,name:`Toxic`,price:0,crate:`rare`,pattern:`veins`,colors:[0x1a2a1a,0x2a3a2a,0x5aff3a,0xc8ff8a],vw:.14,seed:7.1,shine:.4,glow:0x0a3a0a},{id:`chrome`,name:`Chrome`,price:0,crate:`rare`,pattern:`speckle`,colors:[0xc8d0dc,0xe8eef6,0x9aa4b4],weights:[.45,.35,.2],shine:1,glow:0x10141c},{id:`candyfloss`,name:`Candy floss`,price:0,crate:`rare`,pattern:`plasma`,colors:[0xff9ad8,0x9ad8ff,0xffffff],shine:.3,glow:0},{id:`checker`,name:`Chequered`,price:0,crate:`rare`,pattern:`tiles`,colors:[0xffffff,0x1c1c1c],weights:[.5,.5],count:8,grout:0x1c1c1c,soft:.01,shine:.5,glow:0},{id:`nebula`,name:`Nebula`,price:0,crate:`superRare`,pattern:`space`,colors:[0x1a0a3a,0x6a1a8a,0xe83aa8,0xffffff],seed:4.4,stars:.06,shine:.5,glow:0x1a0a2a},{id:`emerald`,name:`Emerald`,price:0,crate:`superRare`,pattern:`sparkle`,colors:[0x1ad87a,0xffffff,0x0a8a4a],shine:1,glow:0x0a2a1a},{id:`blackhole`,name:`Black hole`,price:0,crate:`mythic`,pattern:`space`,colors:[0x000004,0x12001a,0x3a0a5a,0xffb03a],seed:9,stars:.03,shine:.9,glow:0x1a0a2a},{id:`inferno`,name:`Inferno`,price:0,crate:`mythic`,pattern:`plasma`,colors:[0xff3a1a,0x3a0a0a,0xffd03a],shine:.4,glow:0x5a1a00}")]
for i,n in SK: after(i,n)
# Q. Sets tab: no count after the name
rep("$(`tab-sets`).textContent=A?`Sets \\u2713${A}`:`Sets`","$(`tab-sets`).textContent=`Sets`")
# R. last tutorial card one second shorter
rep("else n===3&&this.tutT>4&&this.tutOk()}","else n===3&&this.tutT>3&&this.tutOk()}")
# S. jump step in the tutorial
rep('var CIU={"steer":','var CIU={"jump":"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cellipse%20cx%3D%2212%22%20cy%3D%2221%22%20rx%3D%226%22%20ry%3D%221.6%22%20fill%3D%22%239fb4cc%22%2F%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2213.5%22%20r%3D%225%22%20fill%3D%22%23ffffff%22%20stroke%3D%22%239fc4ee%22%20stroke-width%3D%221.4%22%2F%3E%3Ccircle%20cx%3D%2210.4%22%20cy%3D%2212%22%20r%3D%221.3%22%20fill%3D%22%23fff%22%2F%3E%3Cpath%20d%3D%22M12%207.5V2.2M8.6%205.2L12%201.8l3.4%203.4%22%20fill%3D%22none%22%20stroke%3D%22%232f8cff%22%20stroke-width%3D%222.4%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E","steer":')
rep('["ring","Red ring means too big. Go round it!"],["flag","Grow big enough to smash the wall"]]','["ring","Red ring means too big. Go round it!"],["jump","Swipe up to jump"],["flag","Grow big enough to smash the wall"]]')
rep('["Nice steering!","That\'s it, keep growing!","Good dodge!","Go get it!"]','["Nice steering!","That\'s it, keep growing!","Good dodge!","Great jump!","Go get it!"]')
rep("else n===3&&this.tutT>3&&this.tutOk()}","else if(n===3){(a.h>a.r*.3||this.tutT>25)&&this.tutOk()}else n===4&&this.tutT>3&&this.tutOk()}")
# T. missions: 3 slots with a 1 hour wait + 2 quick slots with a 15 minute wait
rep("!r||this.missionValue(t,r)<r.target||(t.done=!0,this.save.coins+=r.reward,","!r||this.missionValue(t,r)<r.target||(t.done=!0,t.at=Date.now(),this.save.coins+=r.reward,")
rep("dealMissions(){let e=this.save.missions,t=n.length-7,r=!1;for(let i=0;i<e.length;i++)if(e[i].done){for(let r=0;r<n.length;r++){let r=this.save.missionNext++","dealMissions(){let e=this.save.missions,t=n.length-7,r=!1;for(;e.length<5;){let q=0;for(let k=0;k<n.length;k++){let j=this.save.missionNext++,a=n[j<n.length?j:7+(j-n.length)%t];if(!e.some(e=>e.id===a.id)){e.push({id:a.id,progress:0,done:!1,f:MF(BC(this.save.xp).level)}),q=1;break}}if(!q)break;r=!0}for(let i=0;i<e.length;i++)if(e[i].done&&Date.now()-(e[i].at||0)>=(i>2?MLOCK2:MLOCK)){for(let r=0;r<n.length;r++){let r=this.save.missionNext++")
rep(".map(e=>({id:e.id,progress:KC(e.progress),done:e.done===!0}));r.missionNext=",".map(e=>({id:e.id,progress:KC(e.progress),done:e.done===!0,at:KC(e.at),f:KC(e.f,1)||1}));r.missionNext=")
rep("r.missions=e.slice(0,3)}","r.missions=e.slice(0,5)}")
rep("missionRows(){let e=this.daily(),","missionRows(){this.dealMissions();let e=this.daily(),")
rep("t.push({text:r.text,progress:e.done||i<=0||r.target<=1?``:`${i}/${r.target}`,reward:r.reward,done:e.done})","t.push(e.done?{text:r.text,progress:``,reward:r.reward,done:!0,until:(e.at||0)+(this.save.missions.indexOf(e)>2?MLOCK2:MLOCK)}:{text:r.text,progress:i<=0||r.target<=1?``:`${i}/${r.target}`,reward:r.reward,done:!1})")
rep("var SETTINGS={","var MLOCK=36e5,MLOCK2=9e5;var SETTINGS={")
# U. padlock + live countdown on waiting missions; missions scale with level
rep('var CIU={"jump":','var CIU={"lock":"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M7.5%2011V8a4.5%204.5%200%200%201%209%200v3%22%20fill%3D%22none%22%20stroke%3D%22%238a9ab0%22%20stroke-width%3D%222.6%22%20stroke-linecap%3D%22round%22%2F%3E%3Crect%20x%3D%224.5%22%20y%3D%2210.5%22%20width%3D%2215%22%20height%3D%2210.5%22%20rx%3D%223%22%20fill%3D%22%23f0a400%22%2F%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2215%22%20r%3D%221.7%22%20fill%3D%22%237a5200%22%2F%3E%3Crect%20x%3D%2211.2%22%20y%3D%2215%22%20width%3D%221.6%22%20height%3D%223.4%22%20rx%3D%22.8%22%20fill%3D%22%237a5200%22%2F%3E%3C%2Fsvg%3E","clock":"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%2212%22%20r%3D%229.3%22%20fill%3D%22%23fff%22%20stroke%3D%22%233f8cf0%22%20stroke-width%3D%222.4%22%2F%3E%3Cpath%20d%3D%22M12%206.8V12l3.6%202.2%22%20fill%3D%22none%22%20stroke%3D%22%232b2f3a%22%20stroke-width%3D%222.2%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E","jump":')
rep("var MLOCK=36e5,MLOCK2=9e5;","var MLOCK=36e5,MLOCK2=9e5;function MLT(u){let s=Math.max(0,Math.ceil((u-Date.now())/1e3)),m=Math.floor(s/60);return s<=0?`ready`:`${m}:${String(s%60).padStart(2,`0`)}`}setInterval(()=>{for(let q of document.querySelectorAll(`.mlock[data-until]`))q.lastChild.textContent=MLT(+q.dataset.until)},1e3);function MF(L){return L<5?.6:L<10?.8:L<20?1:L<30?1.25:L<40?1.5:1.75}function MSC(d,m){if(!d)return d;let f=m&&m.f||1;if(f===1)return d;let k=d.kind,T=d.target*f,run=d.scope===`run`;T=k===`time`?Math.min(300,Math.max(30,Math.round(T/30)*30)):k===`dist`?Math.min(run?5e3:1e5,Math.max(200,Math.round(T/100)*100)):k===`absorb`?Math.max(20,Math.round(T/10)*10):k===`grow`?Math.max(5,Math.round(T/5)*5):Math.max(1,Math.min(k===`walls`&&run?10:k===`streak`?6:k===`worlds`?2:k===`slams`&&run?5:99,Math.round(T)));if(T===d.target)return d;let R=Math.max(5,Math.round(d.reward*Math.pow(T/d.target,1.2)/5)*5),s=T===1?``:`s`,r1=run?` in one run`:``,tx=k===`walls`?`Smash ${T} wall${s}${r1}`:k===`absorb`?`Absorb ${T} things${r1}`:k===`slams`?`Land ${T} ramp slam${s}${r1}`:k===`grow`?`Grow ${T} times bigger in one run`:k===`streak`?(T===1?`Smash a wall without being hit`:`Smash ${T} walls in a row without being hit`):k===`secrets`?(T===1?`Find a secret object`:`Find ${T} secret objects`):k===`freeze`?(T===1?`Freeze a river`:`Freeze ${T} rivers`):k===`time`?`Last ${T<60?T+` seconds`:T%60?Math.floor(T/60)+` min `+T%60+` sec`:T/60+(T===60?` minute`:` minutes`)} in one run`:k===`worlds`?(T===1?`Smash a world's last wall`:`Smash ${T} worlds' last walls in one run`):k===`dist`?`Roll ${T/1e3} km in ${run?`one run`:`total`}`:d.text;return{...d,target:T,reward:R,text:tx}}")
rep("let r=n.find(e=>e.id===t.id);!r||this.missionValue(t,r)<r.target||","let r=MSC(n.find(e=>e.id===t.id),t);!r||this.missionValue(t,r)<r.target||")
rep("let r=n.find(t=>t.id===e.id);if(!r)continue;let i=Math.min(r.target,","let r=MSC(n.find(t=>t.id===e.id),e);if(!r)continue;let i=Math.min(r.target,")
rep("if(!e.some(e=>e.id===a.id)){e[i]={id:a.id,progress:0,done:!1};break}","if(!e.some(e=>e.id===a.id)){e[i]={id:a.id,progress:0,done:!1,f:MF(BC(this.save.xp).level)};break}")
rep("qC=()=>n.slice(0,3).map(e=>({id:e.id,progress:0,done:!1}))","qC=()=>n.slice(0,3).map(e=>({id:e.id,progress:0,done:!1,f:.6}))")
rep("for(let n of e){let e=document.createElement(`div`);e.className=n.done?`mission done`:`mission`;","for(let n of e){if(n.until&&n.until>Date.now()){let L=document.createElement(`div`);L.className=`mission locked`,L.innerHTML=`${CI(`lock`)}<span class=\"what\">New mission</span><span class=\"mlock\" data-until=\"${n.until}\">${CI(`clock`)}<b>${MLT(n.until)}</b></span>`,t.appendChild(L);continue}let e=document.createElement(`div`);e.className=n.done?`mission done`:`mission`;")
h=open(D+'/index.html').read()
x='.mission .what{flex:1;min-width:0}'
assert h.count(x)>=1
open(D+'/index.html','w').write(h.replace(x,x+'.mission.locked .what{opacity:.6}.mission.locked>.ci{width:16px;height:16px;flex:none;margin:0 -.5px}.mlock{display:flex;align-items:center;gap:4px;flex:none;font-variant-numeric:tabular-nums;opacity:.85}.mlock .ci{width:15px;height:15px}',1))
# V. polish pass
ICONS=r"""(()=>{let hx=n=>"#"+(n>>>0).toString(16).padStart(6,"0"),sh=(n,f)=>hx((Math.min(255,(n>>16&255)*f)|0)<<16|(Math.min(255,(n>>8&255)*f)|0)<<8|Math.min(255,(n&255)*f)|0),S=b=>"data:image/svg+xml,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${b}</svg>`),
HAT=[c=>gearBeanie(hx(c),sh(c,.8),6),c=>gearBeanie(hx(c),sh(c,.8),9),
c=>S(`<path d="M9 44C9 24 19 13 32 13s23 11 23 31z" fill="${hx(c)}"/><path d="M28 13.4h8V44h-8z" fill="${sh(c,.65)}"/><rect x="7" y="41" width="50" height="9" rx="4.5" fill="${sh(c,.7)}"/><rect x="17" y="29" width="30" height="12" rx="6" fill="#ff9a2e" stroke="#1d2433" stroke-width="3"/><path d="M22 33h8" stroke="#fff" stroke-opacity=".7" stroke-width="2.5" stroke-linecap="round"/>`),
c=>S(`<rect x="17" y="8" width="30" height="36" rx="3" fill="${hx(c)}"/><rect x="17" y="31" width="30" height="8" fill="#d8433a"/><rect x="5" y="42" width="54" height="10" rx="5" fill="${sh(c,1.3)}"/><rect x="21" y="11" width="5" height="17" rx="2.5" fill="#fff" fill-opacity=".22"/>`),
c=>S(`<path d="M13 30C4 28 3 16 8 9c1 8 5 12 10 13zM51 30c9-2 10-14 5-21-1 8-5 12-10 13z" fill="#efe4cf" stroke="#b8a888" stroke-width="2"/><path d="M11 46C11 28 20 18 32 18s21 10 21 28z" fill="${hx(c)}"/><rect x="29" y="18" width="6" height="28" fill="#b09040"/><rect x="8" y="43" width="48" height="9" rx="4.5" fill="#b09040"/>`),
c=>S(`<path d="M9 48V22l11 11 12-17 12 17 11-11v26z" fill="${hx(c)}" stroke="${sh(c,.7)}" stroke-width="2.5" stroke-linejoin="round"/><rect x="9" y="44" width="46" height="9" rx="3" fill="${sh(c,.75)}"/><circle cx="32" cy="38" r="4" fill="#e8483a"/><circle cx="19" cy="40" r="3" fill="#3f8cf0"/><circle cx="45" cy="40" r="3" fill="#3fae5a"/><circle cx="32" cy="15" r="3.5" fill="#fff" stroke="${sh(c,.7)}"/><circle cx="9" cy="21" r="3" fill="#fff" stroke="${sh(c,.7)}"/><circle cx="55" cy="21" r="3" fill="#fff" stroke="${sh(c,.7)}"/>`),
c=>S(`<path d="M10 44C10 25 20 15 32 15s22 10 22 29z" fill="${hx(c)}"/><rect x="29" y="15" width="6" height="29" fill="${sh(c,.8)}"/><path d="M4 44h56v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="${sh(c,.85)}"/><circle cx="32" cy="30" r="8" fill="#3a3f4a"/><circle cx="32" cy="30" r="5" fill="#fff6c0"/>`),
c=>S(`<path d="M12 46C14 26 24 12 40 12c8 0 13 6 14 14-5-4-9-3-11 1 2 6 4 12 5 19z" fill="${hx(c)}"/><rect x="7" y="42" width="46" height="12" rx="6" fill="#fff" stroke="#c9d6e8" stroke-width="2"/><circle cx="54" cy="27" r="6.5" fill="#fff" stroke="#c9d6e8" stroke-width="2"/>`)],
SB=(c,x)=>S(`<path d="M7 14c13 7 37 7 50 0v14c-13 7-37 7-50 0z" fill="${hx(c)}"/><path d="M36 28h14v29l-7-4.500-7 4.500z" fill="${sh(c,.82)}"/>${x}`),
SCF=[c=>SB(c,`<path d="M16 19v13M24 21v13M32 21.500v13M40 21v13M48 19v13" stroke="#000" stroke-opacity=".16" stroke-width="3" stroke-linecap="round"/>`),
c=>SB(c,`<path d="M18 19.500v13M30 21.500v13M44 20.500v13" stroke="#fff" stroke-opacity=".85" stroke-width="5"/><path d="M36 38h14M36 47h14" stroke="#fff" stroke-opacity=".85" stroke-width="4"/>`),
c=>SB(c,`<g fill="#fff" fill-opacity=".5"><circle cx="14" cy="22" r="4"/><circle cx="24" cy="27" r="4"/><circle cx="35" cy="25" r="4"/><circle cx="46" cy="27" r="4"/><circle cx="52" cy="21" r="3.500"/><circle cx="43" cy="40" r="3.500"/><circle cx="43" cy="49" r="3.500"/></g>`),
c=>SB(c,`<path d="M7 21c13 7 37 7 50 0M20 19v15M44 19v15" stroke="#1e3a78" stroke-width="3" fill="none"/><path d="M12 17v13M32 21v14M52 17v13" stroke="#f2d070" stroke-width="2"/><path d="M36 40h14M43 28v26" stroke="#1e3a78" stroke-width="3"/>`),
c=>SB(c,`<g fill="#fff"><path d="M18 20l1.500 3.500 3.500 1.500-3.500 1.500L18 30l-1.500-3.500L13 25l3.500-1.500zM44 21l1.200 2.800 2.800 1.200-2.800 1.200L44 29l-1.200-2.800L40 25l2.800-1.200z"/><circle cx="31" cy="27" r="2"/><circle cx="43" cy="42" r="2"/></g>`),
c=>SB(c,`<path d="M7 14l25 26 25-26c-13 7-37 7-50 0z" fill="${sh(c,1.15)}"/><g fill="#fff" fill-opacity=".8"><circle cx="22" cy="24" r="2.200"/><circle cx="32" cy="29" r="2.200"/><circle cx="42" cy="24" r="2.200"/></g>`)],
SV=[0,1,2,3,4,4,5,1],
NOS=[c=>S(`<ellipse cx="32" cy="34" rx="21" ry="15" fill="${hx(c)}"/><ellipse cx="24" cy="28" rx="8" ry="4.500" fill="#fff" fill-opacity=".28"/><ellipse cx="38" cy="41" rx="9" ry="3" fill="#000" fill-opacity=".12"/>`),
c=>S(`<path d="M8 55l25-36 11 11z" fill="${hx(c)}"/><path d="M20 41l6 3.500M27 31l6 3.500" stroke="${sh(c,.7)}" stroke-width="3.500" stroke-linecap="round"/><path d="M39 24l7-15M39 24l15-7M39 24l14 4" stroke="#3fae5a" stroke-width="5.500" stroke-linecap="round"/>`),0,
c=>S(`<rect x="27.500" y="40" width="9" height="19" rx="3" fill="#d8c080"/><path d="M14 22a18 18 0 0 1 36 0v22a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4z" fill="${hx(c)}"/><path d="M14 30h36v14a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4z" fill="${sh(c,.8)}"/><rect x="20" y="12" width="6" height="16" rx="3" fill="#fff" fill-opacity=".5"/>`),
c=>S(`<path d="M32 6l20 18-20 34-20-34z" fill="${hx(c)}"/><path d="M32 6l20 18H12z" fill="${sh(c,1.25)}"/><path d="M32 24v34L12 24z" fill="${sh(c,.8)}"/><path d="M22 24l10-18 10 18" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.500"/>`),0,
c=>S(`<circle cx="32" cy="32" r="22" fill="${hx(c)}"/><circle cx="32" cy="32" r="16" fill="none" stroke="${sh(c,1.4)}" stroke-width="3"/><g fill="#14161c"><circle cx="26" cy="26" r="3.200"/><circle cx="38" cy="26" r="3.200"/><circle cx="26" cy="38" r="3.200"/><circle cx="38" cy="38" r="3.200"/></g>`)],
BT=(c,x,sole)=>S(`${x}<path d="M19 7h20v24l14 7c3.500 1.800 5 5 5 8v5H12V39c0-4 7-7 7-12z" fill="${hx(c)}"/><rect x="12" y="48" width="46" height="8" rx="3" fill="${sole||sh(c,.6)}"/><rect x="19" y="7" width="20" height="8" rx="2" fill="${sh(c,1.25)}"/>`),
BOO=[c=>BT(c,``),c=>S(`<path d="M19 4h20v22l14 6c3.500 1.500 5 4.500 5 7v4H12V33c0-4 7-6 7-11z" fill="${hx(c)}"/><rect x="12" y="41" width="46" height="6" rx="3" fill="#fff"/><path d="M16 50h38M19 55h32M22 60h26" stroke="#9aa6b8" stroke-width="3" stroke-linecap="round"/>`),
c=>BT(c,``,`#8fd0ff`).replace(encodeURIComponent(`</svg>`),encodeURIComponent(`<path d="M19 21h20M19 29h22" stroke="#9fb4cc" stroke-width="3"/></svg>`)),
c=>S(`<path d="M22 44l-5 16 9-7 4 9 4-9 9 7-5-16z" fill="#ff7a1e"/><path d="M27 44l-1 9 4-3 4 3-1-9z" fill="#ffd35a"/><path d="M19 3h20v22l14 6c3.500 1.500 5 4.500 5 7v4H12V32c0-4 7-6 7-11z" fill="${hx(c)}"/><rect x="12" y="40" width="46" height="6" rx="3" fill="${sh(c,.6)}"/><rect x="19" y="3" width="20" height="7" rx="2" fill="#e8483a"/>`),
c=>S(`<g transform="rotate(-28 32 32)"><rect x="2" y="20" width="60" height="8" rx="4" fill="${hx(c)}"/><rect x="2" y="36" width="60" height="8" rx="4" fill="${hx(c)}"/><rect x="24" y="19" width="12" height="10" rx="2" fill="#2b2f3a"/><rect x="24" y="35" width="12" height="10" rx="2" fill="#2b2f3a"/><rect x="50" y="20" width="12" height="8" rx="4" fill="${sh(c,1.3)}"/><rect x="50" y="36" width="12" height="8" rx="4" fill="${sh(c,1.3)}"/></g>`)],
COL={hat:[14173242,3124826,3108816,2236962,10134445,16761390,16766720,14031400],scarf:[13189184,3119690,16238297,12071471,4708032,16742938,3104720,14031400],nose:[8421504,16747034,16747034,9426175,13215999,16761390,4865826],boots:[15909424,13189184,15921906,12108752,9067051]},
GX={hat:{8:[0,0x26356e],9:[1,0x4a5ad8],10:[2,0xd8302a],11:[3,0x5a2ab8],12:[4,0xb87333],13:[5,0x8fd8ff]},scarf:{8:[0,0x4ad8a8],9:[1,0xffc82a],10:[2,0xdfeaff],11:[0,0x2a2a4a],12:[2,0xff7aa8],13:[6,0x2a7ad8]},nose:{7:[0,0x2a2a30],8:[1,0xf2e6c0],9:[1,0xe8302a],10:[4,0x3a8af0],11:[4,0x2ad87a],12:[6,0xf2c230]},boots:{5:[0,0xe8302a],6:[1,0x3a8af0],7:[2,0x8fd8ff],8:[3,0x3a3a44],9:[4,0xf2c230],10:[0,0x3fae5a]}};
for(let sl of GEAR_SLOTS)GEAR[sl].kinds.forEach((K,k)=>{try{let v=K.vis,[shp,c]=GX[sl][v]||[v,COL[sl][v]],f=sl==="hat"?HAT[shp]:sl==="scarf"?SCF[SV[shp]]:sl==="nose"?NOS[shp]:BOO[shp];f&&(GEAR_IMG[`${sl}:${k}`]=f(c))}catch(e){}})})();"""
rep('"hat:1":gearBeanie("#3fae5a","#2f8a46",9)};','"hat:1":gearBeanie("#3fae5a","#2f8a46",9)};'+ICONS.replace('\n',''))
rep("c.appendChild(n(\"b\",null,o.name.replace(/ (hat|scarf|nose|boots|helmet)$/i,\"\")))","c.appendChild(n(\"b\",null,o.name))")
rep("let r=document.createElement(`img`);r.alt=``,t.picture&&(r.src=t.picture),n.appendChild(r);","let r=document.createElement(`img`);r.alt=``,t.picture?r.src=t.picture:(r.src=`data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==`,r.className=`wait`),n.appendChild(r);")
rep("n&&t&&(n.src=t)}","n&&t&&(n.src=t,n.classList.remove(`wait`))}")
rep('f.textContent=r?"Done":e.gear?"Gear box":`${e.coins} coins`','f.textContent=r?"Done":e.gear?"Free gear":`${e.coins} coins`')
rep('r.hidden=!e.length,r.textContent=e.join(" \\u00b7 ")','r.hidden=!e.length,r.innerHTML=e.map(x=>`<div>${EMO(x)}</div>`).join(``)') if s.count('r.hidden=!e.length,r.textContent=e.join(" \\u00b7 ")')==1 else rep('r.hidden=!e.length,r.textContent=e.join(" · ")','r.hidden=!e.length,r.innerHTML=e.map(x=>`<div>${EMO(x)}</div>`).join(``)')
rep("Crates roll for your furthest w","Chests roll for your furthest w")
h=open(D+'/index.html').read()
def hr(a,b,n=1):
    global h
    assert h.count(a)==n,(a[:60],h.count(a));h=h.replace(a,b)
hr('<button id="tab-crates" class="tab on" type="button">Crates</button>','<button id="tab-crates" class="tab on" type="button">Chests</button>')
hr('<button id="stats-close" class="btn" type="button">Done</button>','<button id="stats-close" class="btn alt" type="button">Done</button>')
hr('<button id="levels-close" class="btn" type="button">Done</button>','<button id="levels-close" class="btn alt" type="button">Done</button>')
import re as _r2
def hre(pat,b):
    global h
    assert len(_r2.findall(pat,h))==1,(pat[:60],len(_r2.findall(pat,h)));h=_r2.sub(pat,lambda m:b,h)
hre(r'<h2>Settings</h2>\s*<div class="switches">','<h2>Settings</h2><div class="set-title set-sec">Sound</div><div class="switches">')
hre(r'<div class="set-row"><span>Steering</span>','<div class="set-title set-sec">Controls</div><div class="set-row"><span>Steering</span>')
hre(r'<button id="set-shake" class="switch" type="button">Screen shake: on</button>\s*<button id="set-left" class="switch off" type="button">Left-handed: off</button>\s*<button id="set-lines" class="switch" type="button">Speed lines: on</button>','<button id="set-left" class="switch off" type="button">Left-handed: off</button> <button id="set-tut" class="switch" type="button">Replay tutorial</button></div><div class="set-title set-sec">Effects</div><div class="switches"><button id="set-shake" class="switch" type="button">Screen shake: on</button> <button id="set-lines" class="switch" type="button">Speed lines: on</button>')
hre(r'<button id="set-smooth" class="switch off" type="button">Smooth objects: off</button>\s*<button id="set-tut" class="switch" type="button">Replay tutorial</button>','<button id="set-smooth" class="switch off" type="button" hidden style="display:none">Smooth objects: off</button>')
CSS='<style>.gear-tile>b{white-space:normal!important;text-overflow:clip;overflow:visible;font-size:9.5px;line-height:1.05;padding:0 2px;text-align:center}.gear-tile .gear-img{width:62%;height:62%}.thing img.wait{filter:none!important;opacity:1!important;border-radius:12px;background:linear-gradient(100deg,#dfe8f3 30%,#eef4fb 50%,#dfe8f3 70%);background-size:200% 100%;animation:thw 1.2s linear infinite}@keyframes thw{to{background-position:-200% 0}}.stats-card h2{font-size:27px;font-weight:900;letter-spacing:-.5px}.stats-card .btn.alt{margin-top:10px}.set-sec{align-self:stretch;text-align:center;margin:4px 0 -6px}.crate-result:empty{min-height:0}#title h1.logo{font-size:min(15vw,8vh,70px)!important}#title .tag{margin-top:8px!important}#trophy-note>div+div{margin-top:4px}#zone,#gate-label{text-shadow:0 1px 2px #0b1a33d9,0 0 8px #17365ccc!important}.stats-card h2{font-size:27px!important;font-weight:900!important}.crate-result:empty{min-height:0!important}</style>'
hr('</head>',CSS+'</head>')
open(D+'/index.html','w').write(h)
# W. small animations: living things, flags and fires, landmarks, menus
rep("s.rot=Math.cos(A)>0?-Math.PI/2:Math.PI/2}m=!0}if(!s.scenery&&(!c||c===`plough`)){","s.rot=Math.cos(A)>0?-Math.PI/2:Math.PI/2}m=!0}else s.def.anim&&!s.scenery&&s.d-t<80*r&&(m=!0);if(!s.scenery&&(!c||c===`plough`)){")
rep("let a=e.def.motion===`waddle`&&!e.scenery;a&&(n+=Math.abs(Math.sin(t*7+e.phase))*.06*e.size,r+=Math.sin(t*.7+e.phase*3)*.9),Ww.set(e.x,n,-e.d),Gw.setFromAxisAngle(nT,r),e.sx>0?Kw.set(e.sx,e.sz,e.sz):Kw.setScalar(e.size*e.fade),","let a=e.def.motion===`waddle`&&!e.scenery;a&&(n+=Math.abs(Math.sin(t*7+e.phase))*.06*e.size,r+=Math.sin(t*.7+e.phase*3)*.9);let AN=e.scenery?0:e.def.anim,ax=0,sq=1,ph=e.phase||0;AN&&(AN===1?(n+=Math.abs(Math.sin(t*3+ph))*.07*e.size,ax=Math.sin(t*3+ph)*.05):AN===2?n+=(.14+.1*Math.sin(t*1.3+ph))*e.size:AN===3?ax=Math.sin(t*1.6+ph)*.07:AN===4?sq=1+.035*Math.sin(t*9+ph)+.02*Math.sin(t*5.3+ph):AN===5?r+=t*.8:AN===6?n+=Math.sin(t*38+ph)*.012*e.size:AN===7&&(sq=1+.025*Math.sin(t*2.2+ph)));Ww.set(e.x,n,-e.d),Gw.setFromAxisAngle(nT,r),e.sx>0?Kw.set(e.sx,e.sz,e.sz):Kw.setScalar(e.size*e.fade),ax&&Gw.multiply(aT.setFromAxisAngle(iT,ax)),sq!==1&&(Kw.y*=sq),")
rep("mS.push(...NW5());","mS.push(...NW5());(()=>{let M={1:`raptor pterodactyl stego trike ankylo trex brachio allosaurus astronaut gingerbreadMan mummy camel clownfish turtle dolphin shark whale eel ray teddy parrot pirate hatchling ankylosaur brachiosaurus tRex snowman chick piglet sheep cow tentacle giantRobot nomad crab starfish`,2:`ufo satellite balloon balloonBunch hotAirBalloon blimp airship cloudPuff fluffyCloud thundercloud floatingIsland kite hangGlider paperPlane biplane helicopter airliner station asteroid cloudHouse cloudPalace skyTemple divingBell`,3:`flag pirateFlag windsock weatherVane seaweed anemone fern palm tallPalm datePalm tallPalmTree islandPalm coconutPalm leaningPalm cottonCandy boat reedBoat royalBarge toyBoat outrigger dinghy sloop galleon logBoat submarine freighter crowsNest mast beanstalk treeFern cycad`,4:`candles torch tikiTorch cauldron thunderbolt neonSign neonTubes lavaRock fireTemple beacon lamppost streetLamp`,5:`pinwheel spaceMine moon bluePlanet ringedPlanet star`,6:`rocket bigRocket megaRocket toyRocket shuttle`,7:`volcano superVolcano eruptingVolcano megaTower jelly`};for(let k in M)for(let id of M[k].split(` `))for(let d of mS)d.id===id&&!d.special&&(d.anim=+k)})();")
rep("let bx=$(`crate-box`),lc=CHESTS.find(c=>c.id===(e.chest||\"iron\"));","let bx=$(`crate-box`),lc=CHESTS.find(c=>c.id===(e.chest||\"iron\"));bx.classList.remove(`opened`),void bx.offsetWidth,e.result&&bx.classList.add(`opened`);")
h=open(D+'/index.html').read()
CSS2='<style>.switch,.tab,.gear-tile,.step,.set-step,.chest-row,.thing,.mission{transition:transform .08s}.switch:active,.tab:active,.gear-tile:active,.step:active,.set-step:active{transform:scale(.94)}.chest-img{animation:chw 3.2s ease-in-out infinite;transform-origin:50% 90%}.chest-row:nth-child(2n) .chest-img{animation-delay:.5s}.chest-row:nth-child(3n) .chest-img{animation-delay:1.1s}@keyframes chw{0%,82%,100%{transform:rotate(0)}86%{transform:rotate(-7deg)}90%{transform:rotate(6deg)}94%{transform:rotate(-4deg)}97%{transform:rotate(2deg)}}#crate-box.opened{animation:chop .7s cubic-bezier(.3,1.5,.5,1)}@keyframes chop{0%{transform:scale(1) rotate(0)}15%{transform:scale(1.06) rotate(-8deg)}30%{transform:scale(1.06) rotate(8deg)}45%{transform:scale(1.1) rotate(-6deg)}60%{transform:scale(1.25,.8)}80%{transform:scale(.92,1.12)}100%{transform:scale(1)}}#crate-box.opened~.crate-result>*{animation:crp .45s .45s both cubic-bezier(.3,1.6,.5,1)}@keyframes crp{from{transform:scale(.3);opacity:0}to{transform:scale(1);opacity:1}}.skin-card:active,.skin:active{transform:scale(.95)}</style>'
assert h.count('</head>')==1
open(D+'/index.html','w').write(h.replace('</head>',CSS2+'</head>'))
# X. Endless mode
rep("var DREMIX=-1,Ru=new Map;","var DREMIX=-1,ENDL=0,Ru=new Map;function EDS(m){return m<1e3?[String(Math.round(m)),` m`]:[(m/1e3).toFixed(2),` km`]}")
rep("i=r.lap===0?.93:r.lap===1?.97:1+.035*Math.min(r.lap-1,8);","i=r.lap===0?.93:r.lap===1?.97:ENDL?1+.05*(r.lap-1+r.zone/7):1+.035*Math.min(r.lap-1,8);")
rep("*(1+.02*Math.min(ed(a.d).lap,9));","*(1+(ENDL?.035*(ed(a.d).lap+ed(a.d).zone/7):.02*Math.min(ed(a.d).lap,9)));")
rep("start(){if(this._dailyArm||DREMIX<0||(DREMIX=-1,","start(){this.state===`ended`&&this.endRun&&!this._endArm&&(ENDL=1,DREMIX=Eu+1+Math.floor(Math.random()*900),this._endArm=!0);this._endArm||(ENDL=0);if(this._dailyArm||this._endArm||DREMIX<0||(DREMIX=-1,")
rep("this.dailyRun=!!this._dailyArm,this._dailyArm=!1,","this.endRun=!!this._endArm,this._endArm=!1,this.endKm=0,this.endRank=0,this.endIsRec=!1,(()=>{let q=document.getElementById(`size-label`);q&&(q.textContent=this.endRun?``:`Size:`)})(),this.dailyRun=!!this._dailyArm,this._dailyArm=!1,")
rep("!this.save.x.tut&&!this.dailyRun&&(this.save.hints.includes","!this.save.x.tut&&!this.dailyRun&&!this.endRun&&(this.save.hints.includes")
rep("toTitle(){if(this.state!==`ended`)return;DREMIX=-1,","toTitle(){if(this.state!==`ended`)return;ENDL&&this._prevLap!=null&&(this.startLap=this._prevLap),DREMIX=-1,ENDL=0,")
rep("startDaily(){if(this.state!==\"title\"||this.dailyDone())return;","startEndless(){if(this.state!==\"title\")return;this._prevLap=this.startLap,ENDL=1,DREMIX=Eu+1+Math.floor(Math.random()*900),this._endArm=!0,this.startLap=0,this.seed=null;let e=this.startPoint(0);this.reset(e.d,e.base),this.showPick(),this.start(),this.toasts.unshift(`Endless: how far can you roll?`)}endRecord(){if(!this.keepScores)return;let x=this.save.x,T=Array.isArray(x.endTop)?x.endTop:x.endTop=[],D=Math.round(this.distance),P=T[0]?T[0][0]:0;this.endPrev=P,T.push([D,Date.now()]),T.sort((a,b)=>b[0]-a[0]),T.length>5&&(T.length=5),this.endRank=T.findIndex(e=>e[0]===D)+1,this.endIsRec=D>P&&D>50}endTopRows(){let T=this.save.x.endTop||[];return T.length?[`Your best endless runs`,...T.map((e,i)=>`${i+1}. ${pdist(e[0])} \\u00b7 ${new Date(e[1]).toLocaleDateString(`en-GB`,{day:`numeric`,month:`short`})}`)]:[]}startDaily(){if(this.state!==\"title\"||this.dailyDone())return;")
rep("this.keepScores&&t>this.save.reached&&(this.save.reached=t,","this.keepScores&&!ENDL&&t>this.save.reached&&(this.save.reached=t,")
rep("if(this.keepScores&&!this.autoplay&&!this.continued&&(t===\"shattered\"","if(this.keepScores&&!this.endRun&&!this.autoplay&&!this.continued&&(t===\"shattered\"")
rep("this.world.bestAt=this.keepScores?this.save.bestAt:null,","this.world.bestAt=this.keepScores?(ENDL?this.save.x.endAt:this.save.bestAt)??null:null,")
rep("this.checkMissions();let e=this.save.bestAt;if(e&&!this.passedBest","this.checkMissions();let e=ENDL?this.save.x.endAt:this.save.bestAt;if(e&&!this.passedBest")
rep("if(this.keepScores){t&&(this.save.best=e),this.distRec&&(this.save.bestDist=Math.round(this.distance)),this.save.coins+=n;let r=ed(this.ball.d),i=this.save.bestAt;","if(ENDL){t=!1,this.distRec=!1,this.distPrev=0,this.endRecord()}if(this.keepScores){t&&(this.save.best=e),this.distRec&&(this.save.bestDist=Math.round(this.distance)),this.save.coins+=n;let r=ed(this.ball.d),i=ENDL?this.save.x.endAt:this.save.bestAt;")
rep("&&(this.save.bestAt={lap:r.lap,zone:r.zone,t:r.t}),ZC(this.save)}this.ui.setBook","&&(ENDL?this.save.x.endAt={lap:r.lap,zone:r.zone,t:r.t}:this.save.bestAt={lap:r.lap,zone:r.zone,t:r.t}),ZC(this.save)}this.ui.setBook")
rep("}[this.endKind],[l,u]=fu(e);this.wallMark&&","}[this.endKind],[l,u]=fu(e);ENDL&&(c={title:pdist(this.distance),subtitle:(this.endIsRec?`New endless record! `:this.endRank?`Your number ${this.endRank} run. `:``)+c.subtitle});this.wallMark&&")
rep("extras:this.xFinish(),size:l,","extras:ENDL?[...this.xFinish(),...this.endTopRows()]:this.xFinish(),size:l,")
rep("distance:pdist(this.distance)+(this.distRec?","distance:ENDL?pdist(this.distance)+(this.endIsRec?` \\u00b7 new endless record!`:this.endPrev>0?` \\u00b7 endless best ${pdist(this.endPrev)}`:``):pdist(this.distance)+(this.distRec?")
rep("this.ui.setSize(...fu(this.shown(a.r))),(()=>{let z=this.shown(a.r),q=this.bumpRef","this.ui.setSize(...(this.endRun?EDS(this.distance):fu(this.shown(a.r)))),(()=>{let z=this.shown(a.r),q=this.bumpRef")
rep("this.tally.dist=D;this.signStep(a,D);","this.tally.dist=D;if(this.endRun&&this.keepScores){let km=Math.floor(D/1e3);if(km>(this.endKm||0)){this.runCoins+=25*(km-(this.endKm||0)),this.endKm=km;let x=this.save.x,ML=[1,2,5,10,20,50,100,200,500],mi=ML.filter(v=>v<=km).length;if(mi>(x.endMs||0)){x.endMs=mi;let id=[`wood`,`wood`,`silver`,`silver`,`gold`,`gold`,`diamond`,`diamond`,`legend`][mi-1],g=this.freeChest(id),nm=CHESTS.find(c=>c.id===id).name;this.toasts.push(`${ML[mi-1]} km for the first time! Free ${nm}`),this.audio.chime(),g&&g.text&&(this.runExtras||(this.runExtras=[])).push(g.text),ZC(this.save)}}}this.signStep(a,D);")
rep('t("daily-btn").addEventListener("click",()=>this.startDaily()),','t("daily-btn").addEventListener("click",()=>this.startDaily()),t("endless-btn")?.addEventListener("click",()=>this.startEndless()),')
rep('row(p,"Best distance",this.save.bestDist>0?pdist(this.save.bestDist):"None yet"),','row(p,"Best distance",this.save.bestDist>0?pdist(this.save.bestDist):"None yet"),row(p,"Endless best",this.save.x.endTop&&this.save.x.endTop[0]?pdist(this.save.x.endTop[0][0]):"None yet"),')
import re as _r3
m=_r3.search(r'xTitle\(\)\{',s);assert m and len(_r3.findall(r'xTitle\(\)\{',s))==1
s=s[:m.end()]+'{let q=document.getElementById("endless-sub"),b=document.getElementById("endless-btn"),sb=document.getElementById("start-btn");if(q&&b){let T=this.save.x&&this.save.x.endTop,L=(this.save.reached??0)<2,m=this.save.x&&this.save.x.lastMode;q.textContent=L?`Reach World 3`:T&&T[0]?`Best: ${pdist(T[0][0])}`:`How far can you get?`;b.classList.toggle("locked",L);b.querySelector(".dl-row").innerHTML=L?`${CI("lock")}Endless`:`<b class="inf">\u221e</b>Endless`;b.classList.toggle("last",m==="endless"&&!L);sb&&sb.classList.toggle("last",!(m==="endless"&&!L));setTimeout(()=>{let el=document.getElementById("title-best");el&&(el.textContent=`Furthest: World ${(this.save.reached??0)+1}`+(T&&T[0]?` \u00b7 Endless best: ${pdist(T[0][0])}`:``))},0)}}'+s[m.end():]
h=open(D+'/index.html').read()
def hr(a,b,n=1):
    global h
    assert h.count(a)==n,(a[:60],h.count(a));h=h.replace(a,b)
hr('<div class="play-page"><button id="daily-btn" class="btn daily-btn" type="button"><span class="dl-row"><i class="mi mi-cal"></i>Daily challenge</span><small id="daily-sub"></small></button></div>','<div class="play-page"><button id="daily-btn" class="btn daily-btn" type="button"><span class="dl-row"><i class="mi mi-cal"></i>Daily challenge</span><small id="daily-sub"></small></button></div><div class="play-page"><button id="endless-btn" class="btn daily-btn endless-btn" type="button"><span class="dl-row"><b class="inf">&infin;</b>Endless</span><small id="endless-sub">How far can you get?</small></button></div>')
hr('<button id="play-dots" type="button"><i class="on"></i><i></i>','<button id="play-dots" type="button"><i class="on"></i><i></i><i></i>')
hr("const sync=()=>{const n=Math.round(p.scrollLeft/(p.clientWidth||1))>0?1:0;if(n===page)return;page=n;dots.forEach((d,i)=>d.classList.toggle('on',i===n));hint.textContent=n?'‹ Swipe back for a normal run':'Swipe for the daily challenge ›'};","const sync=()=>{const n=Math.max(0,Math.min(2,Math.round(p.scrollLeft/(p.clientWidth||1))));if(n===page)return;page=n;dots.forEach((d,i)=>d.classList.toggle('on',i===n));hint.textContent=['Swipe for daily and endless ›','‹ Normal run · Endless ›','‹ Swipe back'][n]};")
hr("document.getElementById('play-dots').addEventListener('click',()=>go(page?0:1));","document.getElementById('play-dots').addEventListener('click',()=>go((page+1)%3));")
hr("drag=null;go(dx<-40?1:dx>40?0:from);setTimeout(()=>{p.style.scrollSnapType=''},450)});\n  // a mouse drag","drag=null;go(Math.max(0,Math.min(2,from+(dx<-40?1:dx>40?-1:0))));setTimeout(()=>{p.style.scrollSnapType=''},450)});\n  // a mouse drag")
hr('<span id="play-hint">Swipe for the daily challenge ›</span>','<span id="play-hint">Swipe for daily and endless ›</span>')
hr('</head>','<style>.endless-btn{background:linear-gradient(#a06bff,#6a3fe0)!important;box-shadow:0 6px #4a2ab0,0 12px 22px #17365c66!important}.endless-btn .inf{font-size:1.35em;line-height:.8;margin-right:6px;font-weight:900}</style></head>')
open(D+'/index.html','w').write(h)
# Y. Worlds and Endless side by side on the menu
rep("startEndless(){if(this.state!==\"title\")return;","startEndless(){if(this.state!==\"title\"||(this.save.reached??0)<2)return;")
rep("this.endRun=!!this._endArm,this._endArm=!1,","this.endRun=!!this._endArm,this._endArm=!1,this._dailyArm||(this.save.x.lastMode=this.endRun?`endless`:`worlds`),")
rep("t.disabled=e.locked,t.textContent=e.locked?`Locked`:`Tap to roll`}","t.disabled=e.locked,t.innerHTML=e.locked?`<span class=\"dl-row\">Locked</span><small>Roll this far first</small>`:`<span class=\"dl-row\">Play</span><small></small>`,t.lastChild.textContent=e.locked?`Roll this far first`:`Tap to roll`}")
h=open(D+'/index.html').read()
import re as _r4
pat=r'<div id="play-pager">.*?<button id="play-dots" type="button">'
assert len(_r4.findall(pat,h,_r4.S))==1
new='<div id="play-pager" class="duo"><div class="play-page"><button id="start-btn" class="btn daily-btn duo-btn" type="button">Play</button></div><div class="play-page"><button id="endless-btn" class="btn daily-btn endless-btn duo-btn" type="button"><span class="dl-row"><b class="inf">&infin;</b>Endless</span><small id="endless-sub">How far can you get?</small></button></div></div><button id="play-dots" type="button" hidden style="display:none">'
h=_r4.sub(pat,lambda m:new,h,flags=_r4.S)
assert h.count('</head>')==1
h=h.replace('</head>','<style>#play-pager.duo{display:grid!important;grid-template-columns:1fr 1fr!important;grid-auto-flow:row!important;grid-auto-columns:auto!important;gap:10px;overflow:visible!important;scroll-snap-type:none!important;width:min(100%,348px)!important;max-width:100%!important;margin:0 auto!important;padding:0!important;touch-action:auto!important}#play-pager.duo .play-page{padding:0!important;min-width:0}.duo-btn{width:100%!important;padding:13px 6px!important;font-size:20px!important;gap:2px!important;margin-top:0!important}.duo-btn small{font-size:10.5px;font-weight:800;opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}.duo-btn:not(.last){animation:none!important;filter:saturate(.85) brightness(.93)}.duo-btn.last{outline:3px solid #ffffffd9;outline-offset:2px}.endless-btn.locked{filter:grayscale(.75) brightness(.9)!important;outline:0}.endless-btn .ci{width:17px;height:17px;margin-right:5px}.daily-mini{width:auto!important;min-width:210px;padding:7px 20px!important;font-size:14px!important;margin-top:12px!important;animation:none!important;box-shadow:0 4px #b4560a,0 8px 16px #17365c55!important}.daily-mini small{font-size:10px!important}#title-best{font-size:12px;margin-top:6px}</style></head>')
open(D+'/index.html','w').write(h)
# Z. daily challenge on a side tab with its own card
h=open(D+'/index.html').read()
def hr(a,b,n=1):
    global h
    assert h.count(a)==n,(a[:60],h.count(a));h=h.replace(a,b)
hr('<button id="progress-btn" class="mission-tab side-tab progress-tab" type="button">Progress</button>','<button id="progress-btn" class="mission-tab side-tab progress-tab" type="button">Progress</button><button id="daily-tab" class="mission-tab side-tab daily-tab" type="button">Daily</button>')
hr('<section id="end" class="screen hidden">','<section id="daily-card" class="screen hidden"><div class="card"><h2>Daily challenge</h2><div class="sub">A new mixed-up map every day. Smash 2 walls to win bonus coins.</div><button id="daily-btn" class="btn daily-btn" type="button"><span class="dl-row"><i class="mi mi-cal"></i>Play today\'s map</span><small id="daily-sub"></small></button><button id="daily-close" class="btn alt" type="button">Back</button></div></section><section id="end" class="screen hidden">')
hr('</head>','<style>.daily-tab{bottom:auto!important;top:50%!important;right:auto!important;left:0!important;border-radius:0 14px 14px 0!important;background:linear-gradient(#ffb94a,#f07a12)!important;color:#fff!important}.lefty .daily-tab{left:auto!important;right:0!important;border-radius:14px 0 0 14px!important}.daily-tab.new:after{content:"";position:absolute;top:-5px;right:-5px;width:12px;height:12px;border-radius:50%;background:#ff3d2e;border:2px solid #fff}.lefty .daily-tab.new:after{right:auto;left:-5px}#daily-card{background:#0e1d3366;justify-content:center;z-index:6}#daily-card .card{gap:14px}#daily-card .daily-btn{width:100%}</style></head>')
open(D+'/index.html','w').write(h)
rep('t("daily-btn").addEventListener("click",()=>this.startDaily()),','t("daily-btn").addEventListener("click",()=>this.startDaily()),t("daily-tab")?.addEventListener("click",()=>{this.state===`title`&&(this.xTitle(),t("daily-card").classList.remove("hidden"))}),t("daily-close")?.addEventListener("click",()=>t("daily-card").classList.add("hidden")),')
rep('startDaily(){if(this.state!=="title"||this.dailyDone())return;','startDaily(){if(this.state!=="title"||this.dailyDone())return;document.getElementById("daily-card")?.classList.add("hidden");')
rep('setTimeout(()=>{let el=document.getElementById("title-best");','{let dt=document.getElementById("daily-tab");dt&&dt.classList.toggle("new",!this.dailyDone())}setTimeout(()=>{let el=document.getElementById("title-best");')
# AA. menu tidy: stats inside Progress, world picker above Play
h=open(D+'/index.html').read()
import re as _r5
m=_r5.search(r'<div id="world-pick">.*?</button>\s*</div>\s*(?=<div class="rank-row">)',h,_r5.S);assert m
wp=m.group(0);h=h[:m.start()]+h[m.end():]
assert h.count('<div id="play-pager" class="duo">')==1
h=h.replace('<div id="play-pager" class="duo">',wp+'<div id="play-pager" class="duo">')
a='<button id="stats-btn" class="stats-btn" type="button"><i class="mi mi-stats"></i>Stats</button>';assert h.count(a)==1;h=h.replace(a,'')
a='<div id="stats-body" class="stats-body"></div>';assert h.count(a)==1;h=h.replace(a,'')
a='<button id="ptab-trophies" class="tab" type="button">Trophies</button>';assert h.count(a)==1;h=h.replace(a,a+'<button id="ptab-stats" class="tab" type="button">Stats</button>')
m=_r5.search(r'<div id="ppane-missions" class="ppane">',h);assert m
h=h[:m.start()]+'<div id="ppane-stats" class="ppane" hidden><div id="stats-body" class="stats-body"></div></div>'+h[m.start():]
assert h.count('</head>')==1
h=h.replace('</head>','<style>.bottom #world-pick{width:min(100%,348px);margin-bottom:6px}#progress-hub .tabs .tab{padding-left:9px;padding-right:9px;font-size:12.5px}#ppane-stats{width:100%}#ppane-stats .stats-body{max-height:none;overflow:visible}</style></head>')
open(D+'/index.html','w').write(h)
rep('r=e=>{for(let n of["missions","collection","trophies"])t("ptab-"+n).classList.toggle("on",n===e),t("ppane-"+n).hidden=n!==e;e==="collection"?this.ui.onBook():e==="trophies"&&this.showTrophies()};','r=e=>{for(let n of["missions","collection","trophies","stats"])t("ptab-"+n).classList.toggle("on",n===e),t("ppane-"+n).hidden=n!==e;e==="collection"?this.ui.onBook():e==="trophies"?this.showTrophies():e==="stats"&&(this.showStats(),document.getElementById("stats").classList.add("hidden"))};')
rep('for(let e of["missions","collection","trophies"])t("ptab-"+e).addEventListener("click",()=>r(e));','for(let e of["missions","collection","trophies","stats"])t("ptab-"+e).addEventListener("click",()=>r(e));')
# AB. menu: logo up, snowball centred in the gap
rep("mC.set(ou(this.camX,n.x,.35),dd(d)+a*(1+o),-d)","mC.set(ou(this.camX,n.x,.35),dd(d)+a*(1+o*.62),-d)")
h=open(D+'/index.html').read()
assert h.count('</head>')==1
h=h.replace('</head>','<style>.title-wrap{top:calc(env(safe-area-inset-top) + 156px)!important}</style></head>')
open(D+'/index.html','w').write(h)
# AC. daily challenge lives to the left of World 1 in the world picker
rep("showPick(){let e=this.startLap;this.ui.setWorldPick({name:e<Eu?zu(e).name:`Remix worlds`,index:e+1,count:Eu+1,locked:e>this.save.reached,hasPrev:e>0,hasNext:e<Eu})}pickWorld(e){let t=au(this.startLap+e,0,Eu);","showPick(){let e=this.startLap;if(this.pickDaily){let D=this.dailyDone(),t=this.save.x.daily;this.ui.setWorldPick({name:`Daily challenge`,index:0,count:Eu+1,locked:!1,hasPrev:!1,hasNext:!0,daily:{done:D,note:D?`${t&&t.claimed?`Won today \\u2713`:`Played today`} \\u00b7 new map in ${this.dailyWait()}`:`${zu(Eu+this.xDay()%997).name} \\u00b7 smash 2 walls to win`}});return}this.ui.setWorldPick({name:e<Eu?zu(e).name:`Remix worlds`,index:e+1,count:Eu+1,locked:e>this.save.reached,hasPrev:!0,hasNext:e<Eu,dot:e===0&&!this.dailyDone()})}pickWorld(e){if(this.pickDaily){e>0&&(this.pickDaily=!1,this.showPick());return}if(e<0&&this.startLap===0){this.pickDaily=!0,this.showPick();return}let t=au(this.startLap+e,0,Eu);")
rep("c=C[(e.index-1)%C.length];document.documentElement.style.setProperty(\"--wt\",c)}","c=e.daily?\"#f08a1e\":C[(e.index-1)%C.length];document.documentElement.style.setProperty(\"--wt\",c)}")
rep("$(`world-note`).textContent=e.locked?`Locked: roll this far to start here`:`World ${e.index} of ${e.count}`,","$(`world-note`).textContent=e.daily?e.daily.note:e.locked?`Locked: roll this far to start here`:`World ${e.index} of ${e.count}`,$(`world-prev`).classList.toggle(`dot`,!!e.dot),")
rep("t.lastChild.textContent=e.locked?`Roll this far first`:`Tap to roll`}","t.lastChild.textContent=e.locked?`Roll this far first`:e.daily?(e.daily.done?`Back tomorrow`:`Daily challenge`):`Tap to roll`,e.daily&&e.daily.done&&(t.disabled=!0)}")
rep("this.ui.onStart=()=>this.start(),","this.ui.onStart=()=>this.pickDaily?this.startDaily():this.start(),")
rep("DREMIX=-1,ENDL=0,this.state=`title`,this.xTitle();let e=this.startPoint(this.startLap)","DREMIX=-1,ENDL=0,this.pickDaily=!1,this.state=`title`,this.xTitle(),this.showPick();let e=this.startPoint(this.startLap)")
h=open(D+'/index.html').read()
assert h.count('</head>')==1
h=h.replace('</head>','<style>#daily-tab{display:none!important}#world-prev{position:relative}#world-prev.dot:after{content:"";position:absolute;top:-3px;right:-3px;width:12px;height:12px;border-radius:50%;background:#ff3d2e;border:2px solid #fff}#start-btn:disabled{filter:grayscale(.8) brightness(.9);animation:none!important}</style></head>')
open(D+'/index.html','w').write(h)
# AD. clear padlock on the locked Endless button
h=open(D+'/index.html').read()
assert h.count('</head>')==1
h=h.replace('</head>','<style>.endless-btn.locked{filter:none!important;background:linear-gradient(#7d8798,#5d6676)!important;box-shadow:0 5px 0 #454d5b!important}.endless-btn.locked .dl-row{color:#e6ebf2}.endless-btn.locked .dl-row .ci{width:26px!important;height:26px!important;margin-right:6px;vertical-align:-5px;filter:drop-shadow(0 1px 1px rgba(0,0,0,.35))}.endless-btn.locked small{color:#fff;opacity:.9}</style></head>')
open(D+'/index.html','w').write(h)
# AE. max-level test button toggles back to level 1
rep('this.save.xp=Math.max(this.save.xp||0,x);this.save.reached=Math.max(this.save.reached||0,Eu);','if(this.save.x.maxOn||(this.save.xp>=x&&this.save.reached>=Eu)){this.save.x.maxOn=0;this.save.xp=0;this.save.reached=0;ZC(this.save);location.reload();return}this.save.x.maxOn=1;this.save.xp=Math.max(this.save.xp||0,x);this.save.reached=Math.max(this.save.reached||0,Eu);')
rep('let G=document.getElementById("event-tag")','{let q=document.getElementById("set-max");q&&!q.dataset.arm&&(q.textContent=this.save.x&&(this.save.x.maxOn||BC(this.save.xp||0).level>=50&&this.save.reached>=Eu)?"Back to level 1 (test)":"Unlock level 50 + all worlds")}let G=document.getElementById("event-tag")')
# AF. menu view: smaller ball, more track, small logo, slow camera drift
rep("s=i.CAM_DIST_K*a*(1-.5*o)*(1+.1*this.pull),c=i.CAM_HEIGHT_K*a*(1-.55*o)*(1+.06*this.pull)","s=i.CAM_DIST_K*a*(1-.5*o)*(1+.1*this.pull),c=i.CAM_HEIGHT_K*a*(1-.55*o)*(1+.06*this.pull)")
rep("u.position.set(this.camX+o*a*.7,dd(l)+c,-l)","u.position.set(this.camX+o*a*(.25+.3*Math.sin(this.t*.14)),dd(l)+c,-l)")
rep("dd(d)+a*(1+o*.62),-d)","dd(d)+a*(1+o*TLY),-d)")
s="var TLY=.62;"+s
h=open(D+'/index.html').read()
assert h.count('</head>')==1
h=h.replace('</head>','<style>@media(max-height:700px){.title-wrap{top:calc(env(safe-area-inset-top) + 122px)!important}#title h1.logo{font-size:min(9.5vw,5.2vh,44px)!important;-webkit-text-stroke-width:1.8px!important}#title h1.logo br{display:none}#title .title-wrap p{display:none!important}}</style></head>')
open(D+'/index.html','w').write(h)
# AG. menu: keep the ball clear of the world picker on every screen size (shift the view, no perspective change)
rep("u.lookAt(mC);let f=Math.max(.001,n.cruiseSpeed())","u.lookAt(mC);MVO(this,u,n,o);let f=Math.max(.001,n.cruiseSpeed())")
s="var MVV;function MVO(c,u,n,o){if(o<.002){u.view&&u.view.enabled&&u.clearViewOffset();c.vo=0;return}let t=performance.now();if(!c.vt||t-c.vt>400){c.vt=t;let e=document.getElementById(\"world-pick\"),r=e&&e.getBoundingClientRect();c.vp=r&&r.height?r.top:0}if(!c.vp)return;MVV||(MVV=mC.clone());let W=innerWidth,H=innerHeight,y0=dd(n.d);u.updateMatrixWorld();MVV.set(n.x,y0+n.r,-n.d).project(u);let cy=(1-MVV.y)/2*H;MVV.set(n.x,y0+2*n.r,-n.d).project(u);let rp=Math.abs(cy-(1-MVV.y)/2*H)*1.08,k=cy+(c.vo||0)-(c.vp-22-rp);k=Math.max(-H*.2,Math.min(H*.45,k));c.vo=k*o;u.setViewOffset(W,H,0,c.vo,W,H)}"+s
# AH. combo text never leaves the screen (grow inward, smaller for big numbers)
rep("C.classList.toggle(\"hot\",n>=15)","C.classList.toggle(\"big\",n>=100),C.classList.toggle(\"huge\",n>=1000),C.classList.toggle(\"hot\",n>=15)")
h=open(D+'/index.html').read()
assert h.count('</head>')==1
h=h.replace('</head>','<style>#combo{right:calc(16px + env(safe-area-inset-right))!important;transform-origin:100% 50%;max-width:46vw;white-space:nowrap}#combo b{transform-origin:100% 50%}.lefty #combo{right:auto!important;left:calc(16px + env(safe-area-inset-left))!important;transform-origin:0 50%}.lefty #combo b{transform-origin:0 50%}#combo.big b{font-size:28px}#combo.huge b{font-size:22px}@keyframes cpop{0%{transform:scale(1.25)}to{transform:scale(1)}}</style></head>')
open(D+'/index.html','w').write(h)
# AI. floating texts (combo bonus etc.) always fit on screen: wrap long ones, clamp by real width
rep("i.textContent=e,i.style.left=`${t}px`,i.style.top=`${n}px`,i.className=r?`floater big`:`floater`,i.offsetWidth,i.classList.add(`go`)}","i.textContent=e,i.className=r?`floater big`:`floater`;{let W=(i.offsetParent||i.parentNode).clientWidth||innerWidth,w=i.offsetWidth*.625+8;t=w*2>W?W/2:Math.max(w,Math.min(W-w,t))}i.style.left=`${t}px`,i.style.top=`${n}px`,i.offsetWidth,i.classList.add(`go`)}")
h=open(D+'/index.html').read()
assert h.count('</head>')==1
h=h.replace('</head>','<style>.floater{width:max-content;max-width:72%;white-space:normal!important;text-align:center;text-wrap:balance;line-height:1.08}</style></head>')
open(D+'/index.html','w').write(h)
# AJ. hit boxes follow each model's real shape: oriented ellipse per height band, measured from the mesh
s="""var HBL=0,HBC=0,HBU=0;function HBH(p){p.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);let c=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]),h=[];for(let q of p){for(;h.length>=2&&c(h[h.length-2],h[h.length-1],q)<=1e-9;)h.pop();h.push(q)}let t=h.length+1;for(let i=p.length-2;i>=0;i--){let q=p[i];for(;h.length>=t&&c(h[h.length-2],h[h.length-1],q)<=1e-9;)h.pop();h.push(q)}h.pop();return h}
function HBM(g){let P=g.getAttribute("position"),I=g.index,a=P.array,n=I?I.count:P.count,top=0;for(let i=1;i<a.length;i+=3)a[i]>top&&(top=a[i]);if(!(top>0))return null;let K=5,B=[];for(let k=0;k<K;k++){let Y=top*(k+1)/K+1e-4,x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,pts=[],add=(x,z)=>{x<x0&&(x0=x);x>x1&&(x1=x);z<z0&&(z0=z);z>z1&&(z1=z);pts.push([x,z])};for(let i=0;i<n;i+=3){for(let j=0;j<3;j++){let p=(I?I.array[i+j]:i+j)*3,q=(I?I.array[i+(j+1)%3]:i+(j+1)%3)*3,py=a[p+1],qy=a[q+1];py<=Y&&add(a[p],a[p+2]);if(py<Y!==qy<Y&&py!==qy){let f=(Y-py)/(qy-py);add(a[p]+(a[q]-a[p])*f,a[p+2]+(a[q+2]-a[p+2])*f)}}}if(x1<x0){B.push(null);continue}let cx=(x0+x1)/2,cz=(z0+z1)/2,h=HBH(pts).map(e=>[cx+(e[0]-cx)*.85,cz+(e[1]-cz)*.85]);B.push({hx:Math.max(.1,(x1-x0)/2),hz:Math.max(.1,(z1-z0)/2),cx,cz,h})}for(let k=0;k<K;k++)B[k]||(B[k]=B[k-1]||B.find(e=>e)||{hx:.3,hz:.3,cx:0,cz:0,h:[[-.3,-.3],[.3,-.3],[.3,.3],[-.3,.3]]});return{top,B}}
function HBX(n,t,l,c,sr,ab){let D=n.def,H=D._hb;if(!H)return 0;let S=n.size,K=H.B.length,k=ab?K-1:Math.max(0,Math.min(K-1,Math.ceil((t.h+1.15*t.r)/S/H.top*K)-1)),b=H.B[k],m=D.motion,E=Math.max(1e-4,Math.sqrt(l*l+c*c));if(m==="spin"||m==="hop"||m==="waddle"||D.anim===5||b.h.length<2){let R=(b.hx+b.hz)/2*S*.85+sr;HBL=l;HBC=c;HBU=R;return 1}let r=n.rot||0,co=Math.cos(r),si=Math.sin(r),bx=-l,bz=c,px=(bx*co-bz*si)/S,pz=(bx*si+bz*co)/S,h=b.h,N=h.length,best=1e18,qx=0,qz=0,ins=N>2;for(let i=0;i<N;i++){let A=h[i],Bp=h[(i+1)%N],ex=Bp[0]-A[0],ez=Bp[1]-A[1],L=ex*ex+ez*ez,u=L>0?Math.max(0,Math.min(1,((px-A[0])*ex+(pz-A[1])*ez)/L)):0,x=A[0]+ex*u,z=A[1]+ez*u,d=(px-x)*(px-x)+(pz-z)*(pz-z);d<best&&(best=d,qx=x,qz=z);ins&&ex*(pz-A[1])-ez*(px-A[0])<0&&(ins=!1)}let dist=Math.sqrt(best),vx=px-qx,vz=pz-qz;if(dist<1e-6){vx=px-b.cx;vz=pz-b.cz;let q=Math.sqrt(vx*vx+vz*vz)||1;vx/=q;vz/=q}else{vx/=dist;vz/=dist}if(ins){vx=-vx;vz=-vz;dist=-dist}let pen=(sr/S-dist)*S,wx=vx*co+vz*si,wz=-vx*si+vz*co;HBL=-wx*E;HBC=wz*E;HBU=E+pen;return 1}
"""+s
rep("makePool(e){let t=e.build();t.computeBoundingBox(),","makePool(e){let t=e.build();e.special||e.flat||(e._hb=HBM(t));t.computeBoundingBox(),")
rep("let u=s*(n.size<t.r*i.ABSORB_RATIO?BS.reach:1)+n.fp;if(c>u||c<-u||l>u||l<-u)continue;","let u=s*(n.size<t.r*i.ABSORB_RATIO?BS.reach:1)+n.fp;if(!o&&HBX(n,t,l,c,u-n.fp,n.size<t.r*i.ABSORB_RATIO)&&!(n.size<t.r*i.ABSORB_RATIO&&l*l+c*c<u*u)){l=HBL;c=HBC;u=HBU}if(c>u||c<-u||l>u||l<-u)continue;")
rep("d.fp=i*t.footprint,d.top=","d.fp=i*t.footprint,d.lw=t._hb?Math.max(d.fp,i*.82*Math.max(t._hb.B[2].hx,t._hb.B[2].hz)):d.fp,d.top=")
rep("for(let e of t)Math.abs(e.x-n)<e.fp+i&&r++;","for(let e of t)Math.abs(e.x-n)<(e.lw||e.fp)+i&&r++;")
rep("for(let e of t){if(Math.abs(e.x-s)>=e.fp+i)continue;","for(let e of t){if(Math.abs(e.x-s)>=(e.lw||e.fp)+i)continue;")
rep("let n=r.d-t.d,c=a*e.CONTACT_REACH+r.fp;","let n=r.d-t.d,c=a*e.CONTACT_REACH+(r.lw||r.fp);")
rep("let o=a*e.CONTACT_REACH+r.fp+.25*a;","let o=a*e.CONTACT_REACH+(r.lw||r.fp)+.25*a;")
rep("e.size*=n,e.fp*=n,e.top*=n,","e.size*=n,e.fp*=n,e.lw*=n,e.top*=n,")
rep(":h<i*.95+e.fp+.4*i&&(d-=g*9)",":h<i*.95+(e.lw||e.fp)+.4*i&&(d-=g*9)")
rep("return{def:i,size:a,fp:a*i.footprint,tier:e}}","i._hb===void 0&&(i._hb=i.special||i.flat?null:HBM(i.build()));return{def:i,size:a,fp:e===`obstacle`&&i._hb?Math.max(a*i.footprint,a*.85*Math.max(i._hb.B[2].hx,i._hb.B[2].hz)):a*i.footprint,tier:e}}")
rep("e.special||e.flat||(e._hb=HBM(t));","e.special||e.flat||e._hb||(e._hb=HBM(t));")
# AK. max-level toggle applies in place too (reload can be blocked inside the app)
rep("this.save.x.maxOn=0;this.save.xp=0;this.save.reached=0;ZC(this.save);location.reload();return}","this.save.x.maxOn=0;this.save.xp=0;this.save.reached=0;ZC(this.save);MXA(this,q);return}")
rep("!this.save.skins.includes(k.id)&&this.save.skins.push(k.id);ZC(this.save);location.reload()})","!this.save.skins.includes(k.id)&&this.save.skins.push(k.id);ZC(this.save);MXA(this,q)})")
s="function MXA(g,q){delete q.dataset.arm;g.startLap=0;g.pickDaily=!1;try{document.getElementById(\"settings\").classList.add(\"hidden\");g.gearEnforce&&g.gearEnforce();g.ui.setLevel(g.levelLabel());g.dealMissions&&g.dealMissions();g.ui.setMissions(g.missionRows());g.xTitle&&g.xTitle();g.showPick();if(g.state===\"title\"){let e=g.startPoint(0);g.reset(e.d,e.base)}}catch(e){}try{window.__noReload||location.reload()}catch(e){}}"+s
# AL. Endless hooks: chase your best, next-reward bar, power-ups, close-loss message, instant again
rep("return[...O,...WL,...SP]}","const RD=0xe23b3b,BL=0x39a8ff;SP.push({...nS(`pwMagnet`,`magnet`,RD,()=>M([R(.34,1.05,.34,RD,{x:-.42,y:.55}),R(.34,1.05,.34,RD,{x:.42,y:.55}),R(1.18,.36,.34,RD,{y:.3}),R(.36,.3,.36,WH,{x:-.42,y:1.6}),R(.36,.3,.36,WH,{x:.42,y:1.6})]),0,`spin`),pw:1},{...nS(`pwShield`,`shield`,BL,()=>M([V(.8,BL,{y:1.05,sz:.45},1),R(.26,1.15,.2,WH,{y:.48,z:-.3}),R(.95,.26,.2,WH,{y:.95,z:-.3}),R(.26,1.15,.2,WH,{y:.48,z:.3}),R(.95,.26,.2,WH,{y:.95,z:.3})]),0,`spin`),pw:2});return[...O,...WL,...SP]}")
rep("mS.filter(e=>e.special===`secret`)","mS.filter(e=>e.special===`secret`&&!e.pw)",2)
rep("let e=this.spawn(c,a,o,t);e&&(e.rot=Math.PI,this.writeMatrix(e,0))}}}this.lastPattern=O.name","let e=this.spawn(c,a,o,t);e&&(e.rot=Math.PI,this.writeMatrix(e,0))}}if(ENDL&&PWNOW-PWLAST>1300&&v()<PWC){let t=i.SECRET_SIZE_K*m,a=(v()*2-1)*Math.max(0,h-t*1.5),o=n+v()*r,c=uT(v()<.5?`pwMagnet`:`pwShield`);if(!T(o,t)&&e(a,o,t)){let e=this.spawn(c,a,o,t);e&&(PWLAST=PWNOW,e.rot=Math.PI,this.writeMatrix(e,0))}}}this.lastPattern=O.name")
rep("onSecret(t,n){if(this.state!==`playing`)return;","onPower(t,n){this.world.take(n),this.world.recycle(t),this.rig.kick(4),this.ui.flash(`big`),this.audio.fanfare(),this.vibrate(30),this.tally.pw=(this.tally.pw||0)+1,t.def.pw===1?(this.beam=10,this.beamFull=10,this.beamName=`Magnet`,this.ui.banner(`Magnet!`,`Small things fly to you for 10 seconds`)):(this.shield=!0,this.ui.banner(`Shield!`,`Blocks your next hit`))}onSecret(t,n){if(this.state!==`playing`)return;if(t.def.pw){this.onPower(t,n);return}")
rep("(this.passedBest=!0,this.toasts.push(`Past your best run!`),this.audio.chime())","(this.passedBest=!0,ENDL||(this.toasts.push(`Past your best run!`),this.audio.chime()))")
# HUD: chase + next reward
rep("this.tally.dist=D;if(this.endRun&&this.keepScores){","this.tally.dist=D;this.endRun&&this.endHud(D);if(this.endRun&&this.keepScores){")
rep("endRecord(){if(!this.keepScores)return;","endHud(D){PWNOW=D;let H=document.getElementById(`end-hud`);if(!H)return;let c=document.getElementById(`end-chase`),B=this.endBest0||0,t,g=!1;if(B>50){if(D<B)t=`${pdist(B-D)} to your best`;else{g=!0,t=`New best! +${pdist(D-B)}`;this.endPassed||(this.endPassed=!0,this.ui.banner(`New best!`,`Every metre from here is a record`),this.ui.flash(`gold`),this.audio.fanfare(),this.rig.kick(6),this.vibrate(40))}}else t=`Set your first record`;c.textContent!==t&&(c.textContent=t);c.classList.toggle(`gold`,g);let km=Math.floor(D/1e3)+1,ML=[1,2,5,10,20,50,100,200,500],mi=(this.save.x.endMs||0),ch=this.keepScores&&ML[mi]===km,l=ch?`Chest at ${km} km`:`+25 coins \u00b7 ${km} km`,L=document.getElementById(`end-next-l`);L.textContent!==l&&(L.textContent=l);H.classList.toggle(`chest`,!!ch);document.getElementById(`end-next-f`).style.width=`${(D%1e3)/10}%`}endRecord(){if(!this.keepScores)return;")
rep("this.endRun=!!this._endArm,this._endArm=!1,","this.endRun=!!this._endArm,this._endArm=!1,PWNOW=0,PWLAST=-300,this.endPassed=!1,this.endBest0=this.save.x.endTop&&this.save.x.endTop[0]?this.save.x.endTop[0][0]:0,document.getElementById(`end-hud`)?.classList.toggle(`hidden`,!this.endRun),document.getElementById(`zone`).style.display=this.endRun?`none`:``,document.getElementById(`progress`).style.visibility=this.endRun?`hidden`:``,document.getElementById(`end`)?.classList.toggle(`endless`,this.endRun),")
# close-loss message
rep("subtitle:(this.endIsRec?`New endless record! `:this.endRank?`Your number ${this.endRank} run. `:``)+c.subtitle","subtitle:(this.endIsRec?`New endless record! `:this.endPrev>50&&this.endPrev-this.distance<Math.max(150,this.endPrev*.15)?`Only ${pdist(Math.max(1,this.endPrev-this.distance))} short of your best! `:this.endPrev>50?`${pdist(this.endPrev-this.distance)} off your best. `:this.endRank?`Your number ${this.endRank} run. `:``)+c.subtitle")
s="var PWC=.3,PWNOW=0,PWLAST=-300;"+s
h=open(D+'/index.html').read()
a='<div id="zone">Summit</div>'
assert h.count(a)==1
h=h.replace(a,a+'<div id="end-hud" class="hidden"><div id="end-chase"></div><div id="end-next"><div id="end-next-bar"><i id="end-next-f"></i></div><span id="end-next-l"></span></div></div>')
assert h.count('</head>')==1
h=h.replace('</head>','<style>#end-hud{width:min(58%,220px);margin:5px auto 0;text-align:center;pointer-events:none;font-weight:800;color:#fff;text-shadow:0 1px 2px #0b2445cc}#end-hud.hidden{display:none}#end-chase{font-size:13.5px;line-height:1.15;letter-spacing:.3px}#end-chase.gold{color:#ffd84a}#end-next{margin-top:4px}#end-next-bar{height:6px;border-radius:5px;background:#0b244566;overflow:hidden;box-shadow:0 0 0 1.5px #ffffff55}#end-next-f{display:block;height:100%;width:0;background:linear-gradient(90deg,#8fd0ff,#fff);border-radius:5px}#end-hud.chest #end-next-f{background:linear-gradient(90deg,#ffb52e,#ffe88a)}#end-next-l{display:block;margin-top:3px;font-size:10.5px;opacity:.95}#end-hud.chest #end-next-l{color:#ffe88a}#end.endless #end-best{display:none}#twist{display:none!important}</style></head>')
open(D+'/index.html','w').write(h)
# AM. themed music for the five newer worlds: new instruments, drum kits and styles
rep("case`pizz`:l(`triangle`,t,n+.22)","case`steel`:{let e=.55;l(`sine`,t,n+e).connect(s(i*.9,e)).connect(o),l(`sine`,t*2,n+e*.7).connect(s(i*.55,e*.7)).connect(o),l(`sine`,t*4.02,n+.12).connect(s(i*.2,.12)).connect(o);break}case`saw`:{let e=n+r+.1,f=a.createBiquadFilter();f.type=`lowpass`,f.frequency.setValueAtTime(3200,n),f.frequency.exponentialRampToValueAtTime(900,n+Math.max(.15,r)),f.Q.value=3;let g=c(i*.42,.01,.09);f.connect(g).connect(o),l(`sawtooth`,t,e,-9).connect(f),l(`sawtooth`,t,e,9).connect(f);break}case`synthbass`:{let e=n+r+.05,f=a.createBiquadFilter();f.type=`lowpass`,f.frequency.setValueAtTime(900,n),f.frequency.exponentialRampToValueAtTime(220,n+.18),l(`sawtooth`,t,e).connect(f).connect(c(i*.9,.006,.05)).connect(o);break}case`banjo`:{let e=.3,f=a.createBiquadFilter();f.type=`bandpass`,f.frequency.value=2200,f.Q.value=.8,l(`sawtooth`,t,n+e).connect(f).connect(s(i*1.5,e,.002)).connect(o),l(`square`,t*2,n+.08).connect(s(i*.12,.08)).connect(o);break}case`fiddle`:{let e=n+r+.08,g=l(`sawtooth`,t,e);u(g,6.2,.008,e);let f=a.createBiquadFilter();f.type=`bandpass`,f.frequency.value=2300,f.Q.value=.9,g.connect(f).connect(c(i*1.5,.035,.07)).connect(o);break}case`accordion`:{let e=n+r+.1,f=a.createBiquadFilter();f.type=`lowpass`,f.frequency.value=2400;let g=c(i*.3,.03,.08);f.connect(g).connect(o);let h=l(`square`,t,e,-10),k=l(`square`,t,e,10);u(h,5,.004,e),h.connect(f),k.connect(f),l(`sawtooth`,t*2,e).connect(c(i*.06,.03,.08)).connect(o);break}case`horn`:{let e=n+r+.15,f=a.createBiquadFilter();f.type=`lowpass`,f.frequency.setValueAtTime(500,n),f.frequency.linearRampToValueAtTime(1500,n+.09),f.frequency.linearRampToValueAtTime(950,n+.3);let g=c(i*.7,.06,.14);f.connect(g).connect(o),l(`sawtooth`,t,e,-4).connect(f),l(`sawtooth`,t,e,4).connect(f);break}case`pizz`:l(`triangle`,t,n+.22)")
rep("case`timpani`:t===0&&i%2==0&&this.thump(a,95,68,.7,.26)","case`four`:r===0&&this.thump(a,160,48,.16,.26),r===2&&this.hiss(a,8e3,.04,.045),(t===4||t===12)&&this.clap(a,.1);break;case`tiki`:(t===0||t===6||t===10)&&this.thump(a,210,120,.16,.2),(t===3||t===8||t===13)&&this.thump(a,320,220,.1,.14),t%2==0&&this.hiss(a,7e3,.03,t%4==2?.04:.02);break;case`hoedown`:r===0&&(n%2==0?this.thump(a,150,60,.14,.22):this.clap(a,.07)),r===2&&this.hiss(a,6e3,.05,.04),(r===1||r===3)&&this.hiss(a,9e3,.02,.012);break;case`shanty`:t===0&&this.thump(a,130,55,.22,.26),r===0&&n>0&&this.tek(a,.09),t===0&&i%2==1&&this.clap(a,.06);break;case`stomp`:(t===0||t===8)&&(this.thump(a,90,38,.5,.3),this.hiss(a,300,.12,.05,`lowpass`)),t===11&&this.thump(a,120,60,.2,.14),(t===4||t===12)&&this.thump(a,240,150,.12,.1),t%4==2&&this.hiss(a,5e3,.05,.02);break;case`timpani`:t===0&&i%2==0&&this.thump(a,95,68,.7,.26)")
rep("music:xu({bpm:118,root:57,scale:gu,chords:[0,3,0,6],lead:`reed`,octave:1,busy:.55,comp:`marimba`,compLine:`arp`,bassLine:`bounce`,drums:`darbuka`,echo:.15})","music:xu({bpm:112,root:60,scale:mu,chords:[0,3,4,0],lead:`steel`,octave:1,busy:.75,hold:.6,bass:`pizz`,bassLine:`bounce`,comp:`marimba`,compLine:`offbeat`,drums:`tiki`,echo:.16,level:2.4})")
rep("music:xu({bpm:124,root:61,scale:gu,chords:[0,5,3,4],lead:`chip`,octave:1,busy:.6,hold:.8,bassLine:`bounce`,comp:`chip`,compLine:`arp`,pad:!0,drums:`soft`,echo:.3})","music:xu({bpm:126,root:57,scale:gu,chords:[0,5,3,4],lead:`saw`,octave:1,busy:.65,hold:.8,bass:`synthbass`,bassLine:`bounce`,comp:`chip`,compLine:`arp`,pad:!0,drums:`four`,echo:.32,level:1.4})")
rep("music:xu({bpm:120,root:67,scale:bu,chords:[0,3,4,0],lead:`whistle`,octave:1,busy:.7,hold:.7,bass:`pizz`,bassLine:`oompah`,comp:`pluck`,compLine:`broken`,drums:`brush`,echo:.1})","music:xu({bpm:128,root:67,scale:bu,chords:[0,3,4,0],lead:`fiddle`,octave:1,busy:.85,hold:.6,bass:`pizz`,bassLine:`bounce`,comp:`banjo`,compLine:`arp`,drums:`hoedown`,echo:.07,level:2})")
rep("music:xu({bpm:126,beats:3,root:62,scale:gu,chords:[0,6,0,4],lead:`reed`,octave:1,busy:.8,hold:.6,bass:`pizz`,bassLine:`oompah`,comp:`pluck`,compLine:`offbeat`,drums:`toms`,echo:.1})","music:xu({bpm:132,beats:3,root:62,scale:gu,chords:[0,6,0,4],lead:`accordion`,octave:1,busy:.85,hold:.9,bass:`pizz`,bassLine:`oompah`,comp:`pluck`,compLine:`offbeat`,drums:`shanty`,echo:.1,level:2.2})")
rep("music:xu({bpm:98,root:60,scale:hu,chords:[0,1,4,0],lead:`flute`,octave:1,busy:.45,hold:1.3,comp:`harp`,compLine:`ripple`,pad:!0,drums:`timpani`,echo:.3})","music:xu({bpm:92,root:55,scale:vu,chords:[0,0,3,2],lead:`horn`,octave:1,busy:.45,hold:1.3,bassLine:`drone`,comp:`marimba`,compLine:`ostinato`,pad:!0,drums:`stomp`,echo:.26,level:.9})")
# AN. quieter rolling sound (about half)
rep("this.rollGain.gain.setTargetAtTime(.3*o*(.75+.6*i),a,.08)","this.rollGain.gain.setTargetAtTime(.07*o*(.75+.6*i),a,.08)")
rep("this.rumbleGain.gain.setTargetAtTime(.11*i*o,a,.15)","this.rumbleGain.gain.setTargetAtTime(.035*i*o,a,.15)")
# AO. Endless: no beginner settings at the start, steadier and faster ramp
rep("i=r.lap===0?.93:r.lap===1?.97:ENDL?1+.05*(r.lap-1+r.zone/7):","i=ENDL?1+.07*(r.lap+r.zone/7):r.lap===0?.93:r.lap===1?.97:")
rep("*(1+(ENDL?.035*(ed(a.d).lap+ed(a.d).zone/7):","*(1+(ENDL?.02+.065*(ed(a.d).lap+ed(a.d).zone/7):")
# AP. Endless: scenery, colours, music and chaser change every 2-3 areas (three chapters per lap)
rep("a=Du[Fu(Du.length,i,11)],o=[];for(let e=0;e<t.length;e++){let t=r(Su).scenes[e],i=(n()-.5)*.07,","a=Du[Fu(Du.length,i,11)],o=[],E_=ENDL,CH=e=>e<3?0:e<5?1:2,AI=Du.indexOf(a),AS=1+(i%3+3)%3,AC=[a,Du[(AI+AS)%Du.length],Du[(AI+2*AS)%Du.length]];for(let e=0;e<t.length;e++){let a=E_?AC[CH(e)]:AC[0];let t=r(Su).scenes[e],i=(n()-.5)*.07,")
rep("let u;return{key:`remix${i+1}`","let u,RR={key:`remix${i+1}`")
rep("twist:i<w.length?w[i]:w[Fu(w.length,i,47)]}}var DREMIX","twist:i<w.length?w[i]:w[Fu(w.length,i,47)]};if(E_){let pv=RR.scenery.backdrop;RR.chap=[0,1,2].map(c=>{if(!c)return RR;let x;for(let k=0;k<8;k++){x=r(Su);if(x.scenery.backdrop!==pv)break}pv=x.scenery.backdrop;return{...RR,key:RR.key+`c`+c,name:`${AC[c].adj} ${Ou[Fu(Ou.length,i,29)]}`,chase:x.chase,scenery:x.scenery,music:Iu(x.music),stars:AC[c].stars,tint:AC[c].tint}})}return RR}var DREMIX")
rep("let t=Ru.get(e);return t||(t=Lu(e),Ru.set(e,t)),t}","let K_=ENDL?e+.5:e,t=Ru.get(K_);return t||(t=Lu(e),Ru.set(K_,t)),t}")
rep("function ad(e){return zu(ed(e).lap)}","function ad(e){let t=ed(e),n=zu(t.lap);return n.chap?n.chap[t.zone<3?0:t.zone<5?1:2]:n}")
# AQ. Endless: the chaser stays close, you cannot bank a big lead
rep("(this.hopeless=0,this.surging=!1),this.avalancheGap=Math.min(this.avalancheGap,i.AVALANCHE_MAX_GAP_K),","(this.hopeless=0,this.surging=!1),this.avalancheGap=Math.min(this.avalancheGap,ENDL?EGAP:i.AVALANCHE_MAX_GAP_K),")
s="var EGAP=14;"+s
# AR. Endless: the chaser no longer jumps back at chapter changes, and pushes are smaller
rep("this.avWorldT=this.stats.time,this.avalancheGap=Math.max(this.avalancheGap,i.AVALANCHE_MAX_GAP_K*.7))","this.avWorldT=this.stats.time,ENDL||(this.avalancheGap=Math.max(this.avalancheGap,i.AVALANCHE_MAX_GAP_K*.7)))")
rep("this.avalancheGap=Math.min(e.AVALANCHE_MAX_GAP_K,this.avalancheGap+t*BS.push))}","this.avalancheGap=Math.min(e.AVALANCHE_MAX_GAP_K,this.avalancheGap+t*BS.push*(ENDL?.35:1)))}")
# AS. Endless: no start delay, no freeze, and the drawn chaser tracks the real one across its whole range
rep("this.stats.time>=(this.tut>=0?Math.max(i.AVALANCHE_DELAY,24):i.AVALANCHE_DELAY)&&(this.avalancheOn=!0,","this.stats.time>=(ENDL?.5:this.tut>=0?Math.max(i.AVALANCHE_DELAY,24):i.AVALANCHE_DELAY)&&(this.avalancheOn=!0,")
rep("):t<.7?(this.freezeT=10,","):t<.7&&!ENDL?(this.freezeT=10,")
rep("let GR=this.avalancheGap*rd(a.d)/Math.max(1e-9,a.r),k=GR<t,","let GR=this.avalancheGap*rd(a.d)/Math.max(1e-9,a.r);if(ENDL){let F=i.AVALANCHE_SHOW_FAR_K+2.5,C=EGAP*rd(a.d)/Math.max(1e-9,a.r);GR>2.4&&C>F&&(GR=2.4+(GR-2.4)*(F-2.4)/(C-2.4));t=F}let k=!!ENDL||GR<t,")
# AT. Endless uses only unlocked worlds and pays more per world beaten; worlds pay in full only if you beat one
_i=s.index('function Lu(e)');_j=s.index('var DREMIX',_i);_L=s[_i:_j]
assert _L.count('r(Su)')==8 and _L.count('Su.map((e,t)=>t)')==1 and _L.count('o=[],E_=ENDL,')==1
_L=_L.replace('r(Su)','r(SQ)').replace('Su.map((e,t)=>t)','(E_&&EUN?EUN.slice():Su.map((e,t)=>t))').replace('o=[],E_=ENDL,','o=[],E_=ENDL,SQ=E_&&EUN?EUN.map(e=>Su[e]):Su,')
s=s[:_i]+_L+s[_j:]
rep("let K_=ENDL?e+.5:e,t=Ru.get(K_);","let K_=ENDL?e+.5+(EUN?EUN.length:0)*1e7:e,t=Ru.get(K_);")
s="var EUN=null;function EUS(r){let n=Math.max(2,Math.min(Eu,(r|0)+1));EUN=Cu.slice(0,n).map(k=>Su.findIndex(e=>e.key===k)).filter(e=>e>=0);return EUN.length}"+s
rep("this._prevLap=this.startLap,ENDL=1,","this._prevLap=this.startLap,EUS(this.save.reached),ENDL=1,")
rep("this.start(),this.toasts.unshift(`Endless: how far can you roll?`)}","this.start(),this.toasts.unshift(`Endless: ${EUN.length} worlds in the mix \\u00b7 coins \\u00d7${this.payK().toFixed(1)}`)}payK(){if(ENDL)return 1+.1*Math.min(Eu,this.save.reached|0);if(this.dailyRun||!this.keepScores)return 1;return this.worldsDone>0||(this.save.reached|0)<2?1:.35}payRows(){if(!this.keepScores||this.dailyRun)return[];if(ENDL)return[`Worlds beaten bonus: coins \\u00d7${this.payK().toFixed(1)}`];if(this.worldsDone>0)return[`${this.worldsDone===1?`World`:`${this.worldsDone} worlds`} beaten: full coins`];return(this.save.reached|0)<2?[]:[`World not beaten: you keep 35% of the coins`]}")
rep("start(){this.state===`ended`&&this.endRun&&!this._endArm&&(ENDL=1,","start(){this.state===`ended`&&this.endRun&&!this._endArm&&(EUS(this.save.reached),ENDL=1,")
rep("this.endRun=!!this._endArm,this._endArm=!1,","this.endRun=!!this._endArm,this._endArm=!1,this.worldsDone=0,this.runLap0=this.lapSeen=ENDL||this._dailyArm?0:this.startLap,")
# world completion bonus (worlds mode only)
rep("let t=ed(a.d).lap;this.keepScores&&!ENDL&&t>this.save.reached&&","let t=ed(a.d).lap;if(this.keepScores&&!ENDL&&!this.dailyRun&&t>this.lapSeen){let F=t>this.save.reached,W=Math.min(Eu,t),B=Math.round(150*W*(F?1:.25));this.lapSeen=t,this.worldsDone++,this.runCoins+=B,this.toasts.push(F?`World beaten for the first time! +${B} coins`:`World beaten! +${B} coins`)}this.keepScores&&!ENDL&&t>this.save.reached&&")
rep("+this.runCoins)*BS.coins*(this.stage.twist.coins||1)):0;","+this.runCoins)*BS.coins*(this.stage.twist.coins||1)*this.payK()):0;")
rep("extras:ENDL?[...this.xFinish(),...this.endTopRows()]:this.xFinish(),","extras:ENDL?[...this.payRows(),...this.xFinish(),...this.endTopRows()]:[...this.payRows(),...this.xFinish()],")
# endless km bonus label and chest tiers step up with worlds beaten
rep("`+25 coins \u00b7 ${km} km`","`+${Math.round(25*this.payK())} coins \u00b7 ${km} km`")
rep("let id=[`wood`,`wood`,`silver`,`silver`,`gold`,`gold`,`diamond`,`diamond`,`legend`][mi-1],","let TI=[`wood`,`silver`,`gold`,`diamond`,`legend`],id=TI[Math.min(4,[0,0,1,1,2,2,3,3,4][mi-1]+Math.floor(Math.min(Eu,this.save.reached|0)/5))],")
rep("`World ${e.index} of ${e.count}`,","`World ${e.index} of ${e.count}`+(PAYCUT&&!e.locked?` \\u00b7 beat it for full coins`:``),")
rep("showPick(){let e=this.startLap;","showPick(){PAYCUT=(this.save.reached|0)>=2;let e=this.startLap;")
s="var PAYCUT=!1;"+s
# AU. Candy World chaser: pink marshmallow avalanche instead of the brown chocolate flood
rep("chase:{label:`Chocolate flood`,color:8014378,glow:3808782,style:`flood`}","chase:{label:`Marshmallow avalanche`,color:0xffd9ea,glow:0xff6fb0,style:`tumble`}")
# AV. chaser tidy-up: redder sandstorm, bouncy-ball avalanche, ember ash cloud, magenta blackout
rep("chase:{label:`Sandstorm`,color:14727288,glow:9069112,style:`cloud`}","chase:{label:`Sandstorm`,color:0xb9652a,glow:0x6e2a0c,style:`cloud`}")
rep("chase:{label:`Dust bunnies`,color:12104896,glow:4867672,style:`tumble`}","chase:{label:`Bouncy-ball avalanche`,color:0xffffff,glow:0x2a2030,style:`tumble`,multi:!0}")
rep("chase:{label:`Ash cloud`,color:0x5a5058,glow:0x8a2c14,style:`cloud`}","chase:{label:`Ash cloud`,color:0x4a4046,glow:0xd8481a,style:`cloud`}")
rep("chase:{label:`Blackout`,color:0x2a2440,glow:0x6a3ad8,style:`cloud`}","chase:{label:`Blackout`,color:0x1a1428,glow:0xe02a9a,style:`cloud`}")
rep("this.effects.setChaseColors(r.chase.color,r.chase.glow,r.chase.style)","this.effects.setChaseColors(r.chase.color,r.chase.glow,r.chase.style,!!r.chase.multi)")
rep("setChaseColors(e,t,n=`tumble`){","setChaseColors(e,t,n=`tumble`,M=!1){if(M!==!!this.avMulti&&this.avTumble.instanceColor){this.avMulti=M;let c=new F,q=new F(14084091),P=[0xff4d4d,0xffc93c,0x4dd964,0x3ca9ff,0xb46bff,0xff7ad1];for(let k=0;k<180;k++)M?c.setHex(P[(k*7+(k>>2))%6]):c.setHex(16777215).lerp(q,Math.abs(Math.sin(k*7.31)*91.7)%1*.8),this.avTumble.setColorAt(k,c);this.avTumble.instanceColor.needsUpdate=!0}")
rep("let ms=this.mist,on=CL&&AM>.01&&!!this.cam;","let ms=this.mist,on=CL&&!this.avMulti&&AM>.01&&!!this.cam;")
# AW. every chaser gets the rolling cloud that the avalanche has
_i=s.index("let ms=this.mist,on=CL&&!this.avMulti&&AM>.01&&!!this.cam;");_j=s.index("ms.instanceMatrix.needsUpdate=!0,ms.instanceColor.needsUpdate=!0}}",_i);_M=s[_i:_j]
assert _M.count("AS")==3
_M=_M.replace("AS","MAS").replace("let ms=this.mist,on=CL&&!this.avMulti&&AM>.01&&!!this.cam;","let ms=this.mist,MAS=S0*S0*(3-2*S0),on=AM>.01&&!!this.cam;").replace("al*=au((gd-o-i*.2)/(i*1.5),0,1);","al*=au((gd-o-i*.2)/(i*1.5),0,1)*(this.avMulti?.4:1);")
s=s[:_i]+_M+s[_j:]
# AY. worlds and daily use the Endless avalanche rules: drawn chaser tracks the real one, stays close, no hold-offs
rep("this.avalancheGap=Math.min(this.avalancheGap,ENDL?EGAP:i.AVALANCHE_MAX_GAP_K),","this.avalancheGap=Math.min(this.avalancheGap,EGAP),")
rep("this.avWorldT=this.stats.time,ENDL||(this.avalancheGap=Math.max(this.avalancheGap,i.AVALANCHE_MAX_GAP_K*.7)))","this.avWorldT=this.stats.time)")
rep("this.avalancheGap+t*BS.push*(ENDL?.35:1)))}","this.avalancheGap+t*BS.push*.35))}")
rep("this.stats.time>=(ENDL?.5:this.tut>=0?Math.max(i.AVALANCHE_DELAY,24):i.AVALANCHE_DELAY)&&","this.stats.time>=(this.tut>=0?Math.max(i.AVALANCHE_DELAY,24):.5)&&")
rep("):t<.7&&!ENDL?(this.freezeT=10,","):!1?(this.freezeT=10,")
rep("if(ENDL){let F=i.AVALANCHE_SHOW_FAR_K+2.5,C=EGAP*rd(a.d)/Math.max(1e-9,a.r);","{let F=i.AVALANCHE_SHOW_FAR_K+2.5,C=EGAP*rd(a.d)/Math.max(1e-9,a.r);")
rep("let k=!!ENDL||GR<t,","let k=!0,")
# AZ. weightier avalanche: taller rolling cloud, uneven front, wind-blown powder, debris, swallowed scenery, ground shadow, cracks and thuds
rep("AM=Math.pow(au((7.6-GP)/3.4,0,1),1.2);for(let t=0;t<c;t++){","AM=Math.pow(au((7.6-GP)/3.4,0,1),1.2);let LBF=x=>i*(.8*Math.sin(a*.5+x/r*2.1)+.4*Math.sin(a*.83-x/r*3.7+1.3)),SNW=this.avSnow;if(this.avSh){let K=i*(.6+.8*AM);for(let k=0;k<10;k++){let m=this.avSh[k],d1=n-i,L=(k+1)*.75*K+i;m.visible=AM>.02,m.position.set(0,-d1*e.SLOPE+i*.04,-d1),m.scale.set(r*1.3,L,L),m.material.opacity=m.userData.o*AM}}this.windAcc=(this.windAcc||0)+1.6*AM*AM;for(this.pc.setHex(this.sprayHex??16777215);this.windAcc>=1;){--this.windAcc;let D=n+i*Math.random()*1.5;this.emit((Math.random()*2-1)*r*1.1,D*-e.SLOPE+i*(.3+Math.random()*2.4),-D,(Math.random()-.5)*i*2,i*(.4+Math.random()*1.6),-i*(17+Math.random()*11),i*(.07+Math.random()*.13),.6+Math.random()*.5,i*4)}this.pc.setHex(16777215);for(let t=0;t<c;t++){")
rep("{let q=au((g-o-i*.3)/(i*1.3),0,1);m*=q*q*(3-2*q)}","g+=LBF(h);{let q=au((g-o-i*.3)/(i*1.3),0,1);m*=q*q*(3-2*q)}")
rep("M0=i*(.2+.34*k1)*(.5+.5*AS);_=1+.5*k2,v=.7+.3*k3,y=1+.4*k1,","M0=i*(.2+.34*k1)*(.5+.5*AS);_=1+.5*k2,v=.7+.3*k3,y=1+.4*k1,SNW&&(t%15===7||t%15===11)&&(_=2.7,v=.42,y=.42,M0*=1.9),")
rep("rad=i*(.8+1.1*ph)*(.8+.4*AM)","rad=i*(.8+1.1*ph)*(.8+.5*AM)")
rep("yy=rad*.45+i*ph*(.2+.7*AM)}else{let c=j-72,","yy=rad*.45+i*ph*(.2+1*AM)}else if(j>=150){let c=j-150,ph=(a*(.22+c%5*.025)+c*.618034)%1,u=c*.381966%1*2-1,k=Math.abs(Math.sin(c*12.9898)*43758.5453)%1;gd=n-i*(1.5+2.2*k)+i*ph*.6,rad=i*(1.1+1.3*ph)*(.7+.4*AM),al=Math.sin(Math.PI*ph)*(.04+.13*AM)*Math.sqrt(AM),x=u*r*1.35+Math.sin(a*.4+c)*i*.6,yy=i*(.9+ph*(1.8+2.4*AM))}else{let c=j-72,")
rep("yy=rad*.5+i*MAS*(.15+1.5*(c%3)/2*Math.pow(1-ph,1.2))}al*=au((gd-o-i*.2)/(i*1.5),0,1)","yy=rad*.5+i*MAS*(.15+1.9*(c%3)/2*Math.pow(1-ph,1.2))}gd+=LBF(x);al*=au((gd-o-i*.2)/(i*1.5),0,1)")
rep("this.mist=new na(new Sa(1,14),mm,150)","this.mist=new na(new Sa(1,14),mm,210)")
rep("for(let e=0;e<150;e++)this.mist.setColorAt","for(let e=0;e<210;e++)this.mist.setColorAt")
rep("sp=au(GP-1.2,.8,4.4),N=150,","sp=au(GP-1.2,.8,4.4),N=210,")
rep("this.avFlood.visible=!1,t.add(this.avFlood);","this.avFlood.visible=!1,t.add(this.avFlood);{let g=new bi;g.setAttribute(`position`,new ai(new Float32Array([-1,0,0,1,0,0,1,-e.SLOPE,-1,-1,-e.SLOPE,-1]),3)),g.setIndex([0,1,2,0,2,3]);this.avSh=[0,1,2,3,4,5,6,7,8,9].map(k=>.07*Math.pow(1-k/10,1.3)).map(o=>{let m=new Wi(g,new Mi({color:0x0a1830,transparent:!0,opacity:0,depthWrite:!1,side:2,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));return m.frustumCulled=!1,m.visible=!1,m.renderOrder=2,m.userData.o=o,t.add(m),m})}")
rep("updateAvalanche(t,n,r,i,a,o){if(this.avalanche.visible=t,!t){this.mist.visible=!1;return}","updateAvalanche(t,n,r,i,a,o){if(this.avalanche.visible=t,!t){this.mist.visible=!1;if(this.avSh)for(let m of this.avSh)m.visible=!1;return}")
# debris colours in the snow avalanche
rep("if(M!==!!this.avMulti&&this.avTumble.instanceColor){this.avMulti=M;","{let SN=!M&&e===16777215,KY=M?1:SN?2:0;this.avSnow=SN;if(KY!==this.avKey&&this.avTumble.instanceColor){this.avKey=KY;this.avMulti=M;")
rep("M?c.setHex(P[(k*7+(k>>2))%6]):c.setHex(16777215).lerp(q,Math.abs(Math.sin(k*7.31)*91.7)%1*.8),","M?c.setHex(P[(k*7+(k>>2))%6]):SN&&k%3&&k%15===7?c.setHex(0x7a5232):SN&&k%3&&k%15===11?c.setHex(0x3a6e3c):SN&&k%3&&k%15===2?c.setHex(0x8fc8ff):c.setHex(16777215).lerp(q,Math.abs(Math.sin(k*7.31)*91.7)%1*.8),")
rep("this.avTumble.setColorAt(k,c);this.avTumble.instanceColor.needsUpdate=!0}","this.avTumble.setColorAt(k,c);this.avTumble.instanceColor.needsUpdate=!0}}")
# swallowed scenery
rep("d.golden=0,d.shadow=-1,","d.golden=0,d.sw=0,d.fall=0,d.fly=null,d.tumA=0,d.shadow=-1,")
rep("Ww.set(e.x,n,-e.d),Gw.setFromAxisAngle(nT,r),","e.fall>0&&(n-=e.fall*e.size*.22);Ww.set(e.x,n,-e.d),Gw.setFromAxisAngle(nT,r),e.fall>0&&Gw.premultiply(aT.setFromAxisAngle(rT,-1.4*e.fall*e.fall*(3-2*e.fall))),e.fall<0&&Gw.multiply(aT.setFromAxisAngle(iT,Math.sin(t*62+(e.phase||0))*.075)),e.tumA&&Gw.premultiply(aT.setFromAxisAngle(rT,-e.tumA)),")
rep("this.effects.avGap=this.avalancheVisGap,this.effects.cam=this.rig.camera,this.effects.updateAvalanche(","this.swallow(t),this.effects.avGap=this.avalancheVisGap,this.effects.cam=this.rig.camera,this.effects.updateAvalanche(")
rep("endRecord(){if(!this.keepScores)return;","swallow(dt){let L=this.swL||(this.swL=[]),FL=this.swF||(this.swF=[]),W=this.world,B=this.ball,R=this.rig.camR;if(this.avalancheOn&&(this.state===`playing`||this.state===`dying`||this.state===`finishing`)){let G=this.avalancheVisGap,F=this.avalancheVisD+R*2.2,FS=F+R*4.5*au((6-G)/3.5,0,1);this.flyCd=(this.flyCd||0)-dt;for(let e of W.objects){if(e.sw||e.d>(e.scenery?FS:F))continue;let s=e.def.special;if(s&&s!==`plough`&&s!==`secret`||e.sx>0||e.def.flat)continue;e.sw=1;if(!e.scenery&&!s&&this.state===`playing`&&this.flyCd<=0&&G<5.5&&FL.length<2&&e.size<B.r*1.05&&e.size>B.r*.3&&Math.random()<.5){this.flyCd=1.2;let sx=e.x>=B.x?1:-1;Math.abs(e.x-B.x)<R*2.3&&(e.x=B.x+sx*R*2.3);e.scenery=!0,e.fly={vx:sx*R*(1+Math.random()),vd:Math.max(B.speed,B.cruiseSpeed()*.6)+R*(5+2*Math.random()),vy:R*11,t:0,y0:e.yOff},e.yOff+=R*1.5,FL.push(e)}else e.fall=-.25,L.push(e)}}for(let k=L.length-1;k>=0;k--){let e=L[k];if(!e.sw){L.splice(k,1);continue}e.fall=Math.min(1,e.fall+dt/.3),W.writeMatrix(e,this.time),e.fall>=1&&L.splice(k,1)}for(let k=FL.length-1;k>=0;k--){let e=FL[k],f=e.fly;if(!f||!e.sw){FL.splice(k,1);continue}f.t+=dt,e.x+=f.vx*dt,e.d+=f.vd*dt,f.vy-=R*9*dt,e.yOff+=f.vy*dt,this.effects.emit(e.x+(Math.random()-.5)*e.size,dd(e.d)+e.yOff+e.size*Math.random(),-e.d,(Math.random()-.5)*R,R*(.5+Math.random()),R*2,R*(.08+Math.random()*.1),.35+Math.random()*.25,R*5),e.tumA=f.t*5,e.rot+=dt*3,f.t>1.2&&(e.fade=Math.max(0,1-(f.t-1.2)/.4));if(f.t>1.6||e.yOff<f.y0&&f.vy<0){let q=W.objects.indexOf(e);e.fly=null,q>=0&&W.remove(q),FL.splice(k,1)}else W.writeMatrix(e,this.time)}}endRecord(){if(!this.keepScores)return;")
# sound: cracks and thuds, slightly fuller roar
rep("stopAvalanche(){","avCrack(e){let g=.5+.5*e;this.tone(`sine`,80+Math.random()*45,34,.38,.3*g),this.burstNoise(`lowpass`,480,90,.32,.26*g),Math.random()<.45&&this.burstNoise(`bandpass`,2200,650,.08,.13*g,.04)}stopAvalanche(){")
rep("this.audio.setAvalanche(this.avalancheOn?this.threat:0),","this.audio.setAvalanche(this.avalancheOn?this.threat:0),this.avalancheOn&&this.threat>.25&&(this.avCrk=(this.avCrk??1)-n)<=0&&(this.avCrk=(1.8-1.2*this.threat)*(.6+.8*Math.random()),this.audio.avCrack(this.threat)),")
rep("this.roarGain.gain.setTargetAtTime(.05+.75*e*e,t.currentTime,.15)","this.roarGain.gain.setTargetAtTime(.05+.85*e*e,t.currentTime,.15)")
rep("if(!s.def.flat&&s.d<f&&s.size*2>1.2*r&&Math.abs(s.x-i)<s.fp+7*r){","if(!s.def.flat&&!s.sw&&s.d<f&&s.size*2>1.2*r&&Math.abs(s.x-i)<s.fp+7*r){")
# BA. each chaser type gets its own character: particles, cloud tint, debris colours, lightning, sounds
s="""var AVFX={"Avalanche":"snow","Marshmallow avalanche":"sweet","Twister":"wind","Lava flow":"lava","Storm surge":"water","Sandstorm":"sand","Ash cloud":"ash","Tidal wave":"water","Ghost swarm":"ghost","Stampede":"herd","Bouncy-ball avalanche":"toys","Blackout":"neon","Thunderstorm":"storm","Black hole":"void"},
AVW={snow:[1.6,null,0,1.5,.3,2.4,2,.4,1.6,-17,-11,.07,.13,.6,.5,4],sweet:[1.8,[0xffffff,0xff8fc0,0xffe27a,0x8fe0ff],0,1.5,.3,2.4,2,.6,2,-16,-10,.07,.12,.6,.5,5],lava:[2.2,[0xffd24a,0xff8a1a,0xff4a12],-.5,2,.2,1.6,2,3,5,-6,-7,.05,.07,.7,.6,1.5],ash:[2,[0xff7a2a,0x5a4c50,0x2e2a2e],-.5,2,.3,2.4,2.5,2.5,4,-7,-8,.05,.09,.8,.6,1.2],water:[2.4,[0xffffff,0xcdeeff,null],0,1.2,.4,1.8,3,3,6,-11,-9,.06,.1,.6,.4,16],sand:[3.2,[0xe0b070,0xc98a4a,0xf0d0a0],0,2,.2,2.6,1.5,.1,.8,-22,-14,.04,.06,.5,.4,1],wind:[2.4,[0xd8d0c0,0x8a8478,0x9ad86a],0,1.5,.3,3,9,2,4,-10,-7,.06,.1,.6,.5,3],storm:[2.6,[0xbfd4ff,0x8fb0e8],0,5,3,3.5,1,-10,-6,-9,-6,.04,.05,.45,.3,10],void:[2.2,[0xb48cff,0x6a2ad0,0xffffff],3,4,.3,2.6,1.5,-.5,1,9,6,.05,.08,.5,.3,0],neon:[2,[0xff2fa8,0x2fe0ff,0xffffff],0,1.5,.3,2,3,1,5,-10,-12,.04,.05,.3,.3,12],ghost:[1.4,[0xd8ffe8,0xa8f0d0],0,1.5,.4,2.4,1.5,1,2,-5,-4,.1,.1,.8,.5,.5],herd:[2.2,[0xb89868,0x8a6a40,0xd8c090],0,1.2,.1,.8,3,2,4,-10,-8,.06,.1,.5,.4,14],toys:[2.2,[0xff4d4d,0xffc93c,0x4dd964,0x3ca9ff,0xb46bff],0,1.2,.3,1.5,3,3,5,-10,-8,.06,.08,.6,.4,14]},
AVM={lava:0x7a4a3a,ash:0x514a50,water:0xe6f6ff,storm:0x707a90,void:0x2c1c50,neon:0x2a1c40},AVD={snow:[0x7a5232,0x3a6e3c,0x8fc8ff],sweet:[0xffffff,0xff9ccf,0xffe27a],herd:[0x6b4a2a,0xd8c090,0x8a6a40]};"""+s
rep("this.windAcc=(this.windAcc||0)+1.6*AM*AM;for(this.pc.setHex(this.sprayHex??16777215);this.windAcc>=1;){--this.windAcc;let D=n+i*Math.random()*1.5;this.emit((Math.random()*2-1)*r*1.1,D*-e.SLOPE+i*(.3+Math.random()*2.4),-D,(Math.random()-.5)*i*2,i*(.4+Math.random()*1.6),-i*(17+Math.random()*11),i*(.07+Math.random()*.13),.6+Math.random()*.5,i*4)}this.pc.setHex(16777215);","{let Q=AVW[this.avFx]||AVW.snow,RN=Math.random;this.windAcc=(this.windAcc||0)+Q[0]*AM*AM;for(;this.windAcc>=1;){--this.windAcc;let C=Q[1]?Q[1][Math.floor(RN()*Q[1].length)]:null;this.pc.setHex(C??this.sprayHex??16777215);let D=n+i*(Q[2]+RN()*Q[3]);this.emit((RN()*2-1)*r*1.1,D*-e.SLOPE+i*(Q[4]+RN()*Q[5]),-D,(RN()-.5)*i*Q[6],i*(Q[7]+RN()*Q[8]),i*(Q[9]+RN()*Q[10]),i*(Q[11]+RN()*Q[12]),Q[13]+RN()*Q[14],i*Q[15])}this.pc.setHex(16777215);if(this.avFx===`storm`&&AM>.05){a>(this.ltNext??0)&&(this.ltOn=a,this.ltNext=a+1.3+RN()*2.4,this.ltFlag=1);let f=Math.max(0,1-(a-(this.ltOn??-9))/.2);this.avalanche.material.emissive.setHex(this.avGlowHex??0).lerp(MZc.setHex(0xdfeaff),f*f)}}")
rep("this.effects.setChaseColors(r.chase.color,r.chase.glow,r.chase.style,!!r.chase.multi)","this.effects.setChaseColors(r.chase.color,r.chase.glow,r.chase.style,!!r.chase.multi,r.chase.label)")
rep("setChaseColors(e,t,n=`tumble`,M=!1){{let SN=!M&&e===16777215,KY=M?1:SN?2:0;this.avSnow=SN;if(KY!==this.avKey&&this.avTumble.instanceColor){","setChaseColors(e,t,n=`tumble`,M=!1,LB=``){{let FX=this.avFx=AVFX[LB]||(n===`flood`?`water`:n===`cloud`?`sand`:n===`swarm`?`ghost`:`snow`),DB=M?null:AVD[FX],SN=FX===`snow`,KY=M?`m`:FX;this.avSnow=SN;this.avGlowHex=t;this.ltFlag=0;this.ltNext=void 0;if(KY!==this.avKey&&this.avTumble.instanceColor){")
rep("SN&&k%3&&k%15===7?c.setHex(0x7a5232):SN&&k%3&&k%15===11?c.setHex(0x3a6e3c):SN&&k%3&&k%15===2?c.setHex(0x8fc8ff):","DB&&k%3&&k%15===7?c.setHex(DB[0]):DB&&k%3&&k%15===11?c.setHex(DB[1]):DB&&k%3&&k%15===2?c.setHex(DB[2]):")
rep("this.mist.visible=!1,this.mist.material.color.setHex(e).lerp(MZc.setHex(16777215),.55).multiply(MZc.setHex(15463167)),","this.mist.visible=!1,this.mist.material.color.setHex(e).lerp(MZc.setHex(16777215),.55).multiply(MZc.setHex(15463167)),AVM[this.avFx]&&this.mist.material.color.setHex(AVM[this.avFx]),")
rep("this.audio.avCrack(this.threat)),","this.audio.avCrack(this.threat,this.effects.avFx)),this.effects.ltFlag&&(this.effects.ltFlag=0,this.audio.avCrack(this.threat,`thunder`)),")
rep("avCrack(e){let g=.5+.5*e;","avCrack(e,x){let g=.5+.5*e,R=Math.random;if(x===`storm`)return;if(x===`thunder`){this.tone(`sine`,72,30,.9,.34*g),this.burstNoise(`lowpass`,900,80,.9,.3*g),this.burstNoise(`bandpass`,2600,500,.1,.12*g);return}if(x===`water`){this.burstNoise(`bandpass`,900,300,.5,.22*g),this.tone(`sine`,95,48,.4,.18*g);return}if(x===`lava`||x===`ash`){this.burstNoise(`highpass`,2500,1200,.35,.11*g),this.tone(`sine`,70+R()*30,36,.4,.22*g);return}if(x===`sand`||x===`wind`){this.burstNoise(`bandpass`,500,1400,.6,.16*g);return}if(x===`void`){this.tone(`triangle`,220,55,.7,.11*g);return}if(x===`neon`){this.tone(`square`,900,200,.12,.06*g),this.burstNoise(`highpass`,4e3,2e3,.08,.08*g);return}if(x===`ghost`){this.tone(`sine`,420+R()*80,640,.6,.06*g);return}if(x===`herd`){for(let k=0;k<3;k++)this.tone(`sine`,110+R()*30,44,.14,.22*g,k*.09);return}if(x===`toys`){this.tone(`sine`,240+R()*120,520,.16,.11*g),this.tone(`sine`,300,600,.14,.08*g,.12);return}")
# BB. waves and clouds roll, crest and throw off pieces the way the snow avalanche does, in their own shapes
rep("AS=CL?S0*S0*(3-2*S0):1,","RL=l!==`swarm`,AS=RL?S0*S0*(3-2*S0):1,")
rep("this.avalanche===this.avTumble&&(this.avalanche.count=CL?180:96);","this.avalanche===this.avTumble&&(this.avalanche.count=l!==`swarm`?180:96);")
rep("if(CL){let k1=Math.abs(Math.sin(t*12.9898)*43758.5453)%1,","if(RL){let k1=Math.abs(Math.sin(t*12.9898)*43758.5453)%1,")
rep("h=u*r*1.25+(k3-.5)*i*1.6}}else if(l===`flood`){","h=u*r*1.25+(k3-.5)*i*1.6}l===`flood`?t%3?(m*=.8,_*=.8):(_*=1.55,v*=.8,m*=1.1,w*=.5):l===`cloud`&&(t%3?(m*=1.8,v*=1.15,b*=.75,w*=.3):(v*=1.7,m*=1.25,w*=.4))}else if(l===`flood`){")
# BC. Endless gear quality starts at your furthest beaten world and climbs per lap from there
s="function GQ(g,n){return ENDL?Math.max(1,g.save.reached|0)+n-1:n}"+s
rep("this.giveGear(rollGear(n))","this.giveGear(rollGear(GQ(this,n)))",2)
rep("gearFind(){this.save.gearDryT=0;let e=this.giveGear(rollGear(ed(this.ball.d).lap+1));","gearFind(){this.save.gearDryT=0;let e=this.giveGear(rollGear(GQ(this,ed(this.ball.d).lap+1)));")
# BD. gear found in a world is at risk until you beat it: fail and you keep one random piece
s="function HOLD(g){return g.state===`playing`&&g.keepScores&&!g.autoplay&&!ENDL&&!g.dailyRun&&(g.save.reached|0)>=2&&!(g.worldsDone>0)}"+s
rep("this.worldsDone=0,this.runLap0=","this.worldsDone=0,this.held=[],this.heldMsg=``,this.heldNote=0,this.runLap0=")
rep("giveGear(e){let t=this.save.gear,","giveGear(e){if(HOLD(this)){(this.held||(this.held=[])).push(e);this.heldNote||(this.heldNote=1,this.toasts.push(`Beat this world to keep your gear!`));let I=this.gearInfo(e.slot,e.k,e.r);return{...I,name:`${I.name} (at risk)`,worn:!1,held:1}}let t=this.save.gear,")
rep("this.lapSeen=t,this.worldsDone++,","this.lapSeen=t,this.worldsDone++,this.flushHeld(),")
rep("finish(){this.state=`ended`,","finish(){this.state=`ended`,this.flushHeld(),")
rep("you keep 35% of the coins`]}","you keep 35% of the coins`,...(this.heldMsg?[this.heldMsg]:[])]}flushHeld(){let H=this.held||[];if(this.held=[],!H.length)return;let W=this.worldsDone>0,K=W?H:[H[Math.floor(Math.random()*H.length)]];this.runGear=K.map(e=>this.giveGear(e));if(W)this.state===`playing`&&this.toasts.push(`Gear secured! You keep all ${H.length}`);else{let g=this.runGear[0];this.heldMsg=`World not beaten: kept 1 of ${H.length} gear finds (${g.rname} ${g.name})`}}")
# BE. Endless button says Keep all loot
rep("q.textContent=L?`Reach World 3`:T&&T[0]?`Best: ${pdist(T[0][0])}`:`How far can you get?`;","q.textContent=L?`Reach World 3`:`Keep all loot`;")
# BF. tap the world name to see every world and its completion reward
rep("$(`world-prev`).addEventListener(`click`,()=>this.onWorldStep(-1)),","$(`world-prev`).addEventListener(`click`,()=>this.onWorldStep(-1)),document.querySelector(`#world-pick .world`).addEventListener(`click`,()=>this.onMaps&&this.onMaps()),$(`maps-close`).addEventListener(`click`,()=>$(`maps`).classList.add(`hidden`)),")
rep("this.ui.onWorldStep=e=>this.pickWorld(e),","this.ui.onWorldStep=e=>this.pickWorld(e),this.ui.onMaps=()=>this.showMaps(),")
rep("payK(){","showMaps(){if(this.state!==`title`)return;let R=this.save.reached|0,L=$(`maps-list`),C=[\"#2f8cff\",\"#ff5fa8\",\"#3fb15a\",\"#f59324\",\"#13aec4\",\"#8a5ad6\",\"#f0483e\",\"#4aa8f0\",\"#5b4fd6\",\"#ff6fd0\"],f=n=>n.toLocaleString(`en-US`),sel=this.pickDaily?-1:this.startLap;L.textContent=``;for(let i=0;i<=Eu;i++){let rx=i===Eu,lk=i>R,bt=!rx&&i<R,W=Math.min(Eu,i+1),r=document.createElement(`button`);r.type=`button`,r.className=`map-row`+(lk?` locked`:``)+(bt?` beaten`:``)+(i===sel?` sel`:``),r.style.setProperty(`--mc`,C[i%C.length]);let st=lk?`Locked`:rx?`Endless remix of every world`:bt?`Completed \\u2713`:`Not completed yet`,rw=rx?`+${f(150*Eu)}<small>coins \\u00b7 per new remix world</small>`:bt?`+${f(Math.round(150*W*.25))}<small>coins \\u00b7 repeat bonus</small>`:`+${f(150*W)}<small>${i===1?`coins \\u00b7 unlocks Endless`:`coins \\u00b7 first clear`}</small>`;r.innerHTML=`<span class=\"mn\">${lk?CI(`lock`):rx?`\\u221e`:i+1}</span><span class=\"mt\"><b>${rx?`Remix worlds`:zu(i).name}</b><small>${st}</small></span><span class=\"mr\">${rw}<i>coins</i></span>`;lk||r.addEventListener(`click`,()=>{this.pickDaily=!1,this.pickWorld(i-this.startLap),this.showPick(),$(`maps`).classList.add(`hidden`)});L.appendChild(r)}$(`maps`).classList.remove(`hidden`);let q=L.querySelector(`.sel`);q&&q.scrollIntoView({block:`center`})}payK(){")
h=open(D+'/index.html').read()
a2='<section id="settings" class="screen hidden">'
assert h.count(a2)==1
h=h.replace(a2,'<section id="maps" class="screen hidden"><div class="card maps-card"><h2>Worlds</h2><p class="maps-sub">Complete a world for its bonus, full coins and every bit of gear you found.</p><div id="maps-list"></div><button id="maps-close" class="btn alt" type="button">Done</button></div></section>'+a2)
assert h.count('</head>')==1
h=h.replace('</head>','<style>#maps{z-index:999;background:#0e1d3399;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);justify-content:center}#maps .card{background:#fff}#world-pick .world{cursor:pointer}#world-pick .world #world-name:after{content:"";display:inline-block;width:7px;height:7px;margin-left:7px;border-right:2.5px solid currentColor;border-bottom:2.5px solid currentColor;transform:translateY(-3px) rotate(45deg);opacity:.75}.maps-card{gap:10px!important;padding:22px 14px 18px!important}.maps-card h2{margin:0}.maps-sub{margin:0 6px;font-size:13px;line-height:1.3;text-align:center;opacity:.7}#maps-list{width:100%;display:flex;flex-direction:column;gap:7px;overflow-y:auto;max-height:62vh;padding:2px}.map-row{display:flex;align-items:center;gap:10px;width:100%;padding:8px 10px;border:0;border-radius:16px;background:#eef3fa;color:var(--ink);font:inherit;text-align:left;cursor:pointer}.map-row.sel{box-shadow:0 0 0 2.5px var(--mc)}.map-row.locked{opacity:.55;cursor:default}.map-row .mn{flex:none;width:34px;height:34px;border-radius:11px;background:var(--mc);color:#fff;font-weight:900;font-size:16px;display:flex;align-items:center;justify-content:center}.map-row.locked .mn{background:#b8c2d0}.map-row .mn .ci{width:18px;height:18px;filter:brightness(3)}.map-row .mt{flex:1;min-width:0;display:flex;flex-direction:column}.map-row .mt b{font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.map-row .mt small{font-size:11.5px;opacity:.65}.map-row.beaten .mt small{color:#1f9d55;opacity:1;font-weight:700}.map-row .mr{flex:none;text-align:right;font-weight:900;font-size:15px;color:#d48a00;display:flex;flex-direction:column;align-items:flex-end;line-height:1.1}.map-row .mr small{font-size:10.5px;font-weight:700;color:var(--ink);opacity:.6}.map-row .mr i{display:none}.map-row.beaten .mr{color:#8a96a8}</style></head>')
open(D+'/index.html','w').write(h)
rep('"button,a,input,textarea,#rank,#play-pager,#play-dots,.top-stack,.side-tab"','"button,a,input,textarea,#rank,#play-pager,#play-dots,.top-stack,.side-tab,#world-pick"')
# BG. Progress becomes a round flag button top-left, with a red dot for new missions
rep('{let q=document.getElementById("set-max");','{let b=document.getElementById("progress-btn");if(b){b.dataset.w||(b.dataset.w=1,b.setAttribute("aria-label","Progress"),b.addEventListener("click",()=>{this.save.x.mSeen=this.save.missions.map(m=>m.id),ZC(this.save),b.classList.remove("new")}));let S=this.save.x.mSeen||[];b.classList.toggle("new",this.save.missions.some(m=>!m.done&&!S.includes(m.id)))}}{let q=document.getElementById("set-max");')
h=open(D+'/index.html').read()
assert h.count('</head>')==1
FL="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M6.5%203.5v17%22%20stroke%3D%22white%22%20stroke-width%3D%222.6%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M7.5%204.5h10.5l-2.6%203.9%202.6%203.9H7.5z%22%20fill%3D%22white%22%20stroke%3D%22white%22%20stroke-width%3D%221.2%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E"
h=h.replace('</head>','<style>#progress-btn.side-tab{position:absolute!important;top:calc(env(safe-area-inset-top,0px) + 12px)!important;bottom:auto!important;left:6px!important;right:auto!important;width:42px!important;height:42px!important;min-height:0!important;padding:0!important;margin:0!important;border:0!important;border-radius:50%!important;background:#0e1d3366 url("'+FL+'") center/22px no-repeat!important;box-shadow:inset 0 0 0 1.5px #ffffff40!important;writing-mode:horizontal-tb!important;transform:none!important;font-size:0!important;color:transparent!important;z-index:3;filter:drop-shadow(0 1px 1px #0b1a3366)}#progress-btn.side-tab:active{background-color:#0e1d338c!important}#progress-btn.new:after{content:"";position:absolute;top:1px;right:1px;width:11px;height:11px;border-radius:50%;background:#ff3d2e;border:2px solid #fff}.lefty #progress-btn.side-tab{left:auto!important;right:6px!important}</style></head>')
open(D+'/index.html','w').write(h)
IGHTML='<section id="igloo" class="screen hidden"><div id="ig-pad"></div><div id="ig-joy"><i></i></div><div class="ig-top"><button id="ig-back" class="ig-round" type="button" aria-label="Back"></button><div class="ig-head"><b id="ig-name">Snow hut</b><span id="ig-cosy"></span></div><div class="ig-coins"><i class="ig-c"></i><b id="ig-coins">0</b></div></div><div id="ig-hint">Drag the way you want to roll<br>Roll through the cat flap to go in</div><div id="ig-bar"><button id="ig-go" class="ig-pill" type="button">Go inside</button><button id="ig-deco" class="ig-pill main" type="button">Decorate</button><button id="ig-mugq" class="ig-pill gold" type="button" hidden></button></div><div class="ig-sheet"><div class="ig-sh-top"><b id="ig-area">Decorate</b><button id="ig-done" class="ig-x" type="button">Done</button></div><button id="ig-mug" class="ig-mug" type="button"></button><div id="ig-spots" class="ig-spots"></div><div id="ig-items" class="ig-items"></div></div><div id="ig-msg"></div><div id="ig-fade"></div></section>'
IGCSS='#igloo-btn{-webkit-appearance:none;appearance:none;cursor:pointer;position:absolute;top:calc(env(safe-area-inset-top,0px) + 62px);left:6px;width:42px;height:42px;padding:0;border:0;border-radius:50%;background:#0e1d3366 url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M2.5%2019.5a9.5%209.5%200%200%201%2019%200z%22%20fill%3D%22%23fff%22%2F%3E%3Cpath%20d%3D%22M9%2019.5v-3a3%203%200%200%201%206%200v3z%22%20fill%3D%22%232c4468%22%2F%3E%3C%2Fsvg%3E") center/24px no-repeat;box-shadow:inset 0 0 0 1.5px #ffffff40;z-index:3;filter:drop-shadow(0 1px 1px #0b1a3366)}#igloo-btn:active{background-color:#0e1d338c}#igloo-btn.new:after{content:"";position:absolute;top:1px;right:1px;width:11px;height:11px;border-radius:50%;background:#ff3d2e;border:2px solid #fff}.lefty #igloo-btn{left:auto;right:6px}.ig-open #title{visibility:hidden!important}#igloo{z-index:8;padding:0!important;display:block!important;overflow:hidden}#igloo.hidden{display:none!important}#ig-pad{position:absolute;inset:0;touch-action:none}#ig-joy{position:absolute;width:92px;height:92px;margin:-46px 0 0 -46px;border-radius:50%;background:#ffffff2e;box-shadow:inset 0 0 0 2px #ffffff80;pointer-events:none;opacity:0;transition:opacity .15s}#ig-joy.on{opacity:1}#ig-joy i{position:absolute;left:50%;top:50%;width:40px;height:40px;margin:-20px 0 0 -20px;border-radius:50%;background:#ffffffd9;box-shadow:0 2px 6px #0b244540}#ig-fade{position:absolute;inset:0;background:#0e1d33;opacity:0;pointer-events:none}#ig-fade.on{animation:igf .55s both}@keyframes igf{0%{opacity:1}to{opacity:0}}.ig-top{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;gap:10px;padding:calc(env(safe-area-inset-top,0px) + 12px) 12px 0;pointer-events:none}.ig-top>*{pointer-events:auto}.ig-round{flex:none;width:42px;height:42px;border:0;border-radius:50%;background:#0e1d3366 url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M14.5%205.5L8%2012l6.5%206.5%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E") center/22px no-repeat;box-shadow:inset 0 0 0 1.5px #ffffff40;cursor:pointer}.ig-head{flex:1;display:flex;flex-direction:column;align-items:center;line-height:1.15;pointer-events:none!important}.ig-head b{font-size:21px;font-weight:900;color:#fff;background:#0e1d3373;border-radius:999px;padding:3px 14px 4px}.ig-head span{margin-top:4px;font-size:12px;font-weight:800;color:#fff;background:#0e1d3359;border-radius:999px;padding:2px 10px}.ig-coins{flex:none;display:flex;align-items:center;gap:5px;background:#fffffff0;border-radius:999px;padding:7px 12px;font-weight:900;font-size:14px;color:var(--ink)}.ig-c{display:inline-block;width:13px;height:13px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffe88a,#f2b21e);box-shadow:inset 0 0 0 1.5px #d48a00;margin-right:5px;vertical-align:-1px}.ig-coins .ig-c{margin:0}#ig-msg{position:absolute;left:50%;top:34%;transform:translateX(-50%);background:#0e1d33e0;color:#fff;padding:9px 18px;border-radius:999px;font-weight:800;font-size:14px;opacity:0;pointer-events:none;white-space:nowrap}#ig-msg.on{animation:igm 1.9s both}@keyframes igm{0%{opacity:0;transform:translate(-50%,8px)}12%,75%{opacity:1;transform:translate(-50%,0)}to{opacity:0;transform:translate(-50%,-6px)}}#ig-hint{position:absolute;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 86px);transform:translateX(-50%);background:#0e1d3373;color:#fff;padding:7px 16px;border-radius:999px;font-weight:800;font-size:13px;line-height:1.35;text-align:center;border-radius:16px;pointer-events:none;white-space:nowrap;transition:opacity .4s}#ig-hint.gone,#igloo.sheet #ig-hint{opacity:0}#ig-bar{position:absolute;left:0;right:0;bottom:calc(env(safe-area-inset-bottom,0px) + 18px);display:flex;justify-content:center;gap:8px;padding:0 10px;pointer-events:none;transition:transform .25s,opacity .2s}#ig-bar>*{pointer-events:auto}#igloo.sheet #ig-bar{transform:translateY(40px);opacity:0;pointer-events:none}#igloo.sheet #ig-bar>*{pointer-events:none}.ig-pill{border:0;border-radius:999px;padding:13px 18px;font:inherit;font-weight:900;font-size:15px;color:var(--ink);background:#fffffff2;box-shadow:0 4px 0 #b9c6d8,0 8px 18px #0b244533;cursor:pointer}.ig-pill.main{background:#2f8cff;color:#fff;box-shadow:0 4px 0 #1c64c4,0 8px 18px #0b244533}.ig-pill.gold{background:linear-gradient(#ffd66a,#ffb52e);color:#3a2a00;box-shadow:0 4px 0 #d48a00,0 8px 18px #0b244533}.ig-pill[hidden]{display:none}.ig-sheet{position:absolute;left:0;right:0;bottom:0;background:#fffffff7;border-radius:24px 24px 0 0;padding:10px 12px calc(env(safe-area-inset-bottom,0px) + 14px);display:flex;flex-direction:column;gap:8px;color:var(--ink);box-shadow:0 -8px 30px #0b244533;transform:translateY(105%);transition:transform .28s}#igloo.sheet .ig-sheet{transform:none}.ig-sh-top{display:flex;align-items:center;justify-content:space-between;padding:0 2px 0 6px}.ig-sh-top b{font-size:16px;font-weight:900}.ig-x{border:0;border-radius:999px;background:#e6edf7;color:var(--ink);font:inherit;font-weight:900;font-size:13px;padding:7px 16px;cursor:pointer}.ig-mug{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px 14px;border-radius:14px;background:#eef3fa;border:0;font:inherit;color:inherit;text-align:left;flex:none}.ig-mug b{font-size:14px}.ig-mug span{font-size:12.5px;font-weight:800;opacity:.7}.ig-mug.ready{background:linear-gradient(#ffd66a,#ffb52e);box-shadow:0 3px 0 #d48a00;cursor:pointer;color:#3a2a00}.ig-mug.ready span{opacity:1}.ig-spots{display:flex;gap:6px;overflow-x:auto;flex:none;padding:1px 1px 3px;scrollbar-width:none;touch-action:pan-x;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}.ig-spots::-webkit-scrollbar{display:none}.ig-chip{flex:none;position:relative;padding:8px 13px;border-radius:999px;border:0;background:#e6edf7;font:inherit;font-weight:800;font-size:13px;color:var(--ink);cursor:pointer}.ig-chip.on{background:#2f8cff;color:#fff}.ig-chip.locked{opacity:.55}.ig-chip .ci{width:12px;height:12px;margin-right:4px;vertical-align:-1px}.ig-chip.empty:after{content:"";position:absolute;top:2px;right:2px;width:8px;height:8px;border-radius:50%;background:#ffb52e;border:1.5px solid #fff}.ig-items{flex:none;display:flex;flex-direction:column;gap:6px;min-height:214px;max-height:248px;overflow-y:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;touch-action:pan-y;overscroll-behavior:contain}.ig-items::-webkit-scrollbar{display:none}.ig-row{display:flex;align-items:center;gap:10px;padding:8px 10px 8px 13px;border-radius:14px;background:#f1f5fb;flex:none}.ig-row.cur{box-shadow:inset 0 0 0 2px #2fb466}.ig-t{flex:1;min-width:0;display:flex;flex-direction:column}.ig-t b{font-size:14.5px}.ig-t small{font-size:11.5px;opacity:.65}.ig-buy{flex:none;min-width:96px;padding:8px 12px;border-radius:12px;border:0;font:inherit;font-weight:900;font-size:14px;background:#ffb52e;color:#3a2a00;box-shadow:0 3px 0 #d48a00;cursor:pointer}.ig-row.own .ig-buy{background:#2f8cff;color:#fff;box-shadow:0 3px 0 #1c64c4}.ig-row.cur .ig-buy,.ig-row.done .ig-buy{background:none;box-shadow:none;color:#1f9d55}.ig-row.later .ig-buy{background:#dfe6f0;color:#8a96a8;box-shadow:none}.ig-row.later .ig-c{filter:grayscale(1)}.ig-row.poor .ig-buy{opacity:.55}'
IGCSS+='.ig-row .ig-bud{margin-right:6px;background:#e8eef7!important;color:#2c4468!important;box-shadow:none!important}.ig-row .ig-bud.on{background:#3c7fd6!important;color:#fff!important}.ig-row.info{background:#fff7dc!important}.ig-row.info .ig-t small{white-space:normal}.ig-dot{display:inline-block;width:8px;height:8px;margin-left:5px;border-radius:50%;background:#ff3d2e;vertical-align:2px}'
IGCSS+='.ig-sheet{background:linear-gradient(#eaf3ff,#ffffff 38%)!important;padding-top:12px!important;gap:9px!important;border-top:3px solid #ffffff}.ig-sh-top{padding:0 2px 0 2px!important}#ig-area{display:flex;align-items:center;gap:7px;font-size:17px!important;font-weight:900;color:#17365c}#ig-area em{font-style:normal;font-size:12.5px;font-weight:900;color:#e0306a;background:#ffe3ee;padding:3px 9px;border-radius:999px}.ig-hi{width:26px;height:26px;border-radius:9px;background:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M12%2021s-8-5.2-8-11a4.5%204.5%200%200%201%208-2.8A4.5%204.5%200%200%201%2020%2010c0%205.8-8%2011-8%2011z%22%20fill%3D%22%23ff5a8a%22/%3E%3C/svg%3E") center/16px no-repeat,linear-gradient(#ff9ab8,#ff5a8a);box-shadow:0 2px 0 #c83a6a}.ig-x{background:#17365c!important;color:#fff!important;padding:8px 18px!important}.ig-mug{padding:7px 12px!important;gap:10px!important;justify-content:flex-start!important;background:linear-gradient(90deg,#fff4dc,#ffeccc)!important;box-shadow:inset 0 0 0 1.5px #ffd78a}.ig-mug.ready{background:linear-gradient(#ffe066,#ffb21a)!important;box-shadow:0 3px 0 #c88400!important}.ig-mugi{flex:none;width:34px;height:34px;border-radius:11px;background:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M5%208h11v8a4%204%200%200%201-4%204H9a4%204%200%200%201-4-4z%22%20fill%3D%22%23fff%22%20stroke%3D%22%23c88400%22%20stroke-width%3D%221.2%22/%3E%3Cpath%20d%3D%22M16%2010h1.5a2.5%202.5%200%200%201%200%205H16%22%20fill%3D%22none%22%20stroke%3D%22%23c88400%22%20stroke-width%3D%221.6%22/%3E%3Cellipse%20cx%3D%2210.5%22%20cy%3D%228.6%22%20rx%3D%225%22%20ry%3D%221.4%22%20fill%3D%22%237a4a24%22/%3E%3Cpath%20d%3D%22M8%205c0-1.5%201.5-1.5%201.5-3M11.5%205c0-1.5%201.5-1.5%201.5-3%22%20stroke%3D%22%23fff%22%20stroke-width%3D%221.2%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20opacity%3D%22.9%22/%3E%3C/svg%3E") center/26px no-repeat,#ffcf7a}.ig-mug.ready .ig-mugi{background-color:#fff3c4;animation:igwob 1.4s ease-in-out infinite}.ig-mt{display:flex;flex-direction:column;min-width:0}.ig-mt b{font-size:14px}.ig-mt span{font-size:11.5px;font-weight:800;opacity:.75}.ig-spots{gap:7px!important;padding:2px 2px 4px!important}.ig-chip{display:flex!important;flex-direction:column;align-items:center;gap:2px;width:68px;padding:5px 4px 6px!important;border-radius:16px!important;background:#fff!important;box-shadow:0 2px 0 #d5e0ee,inset 0 0 0 1.5px #e3ebf6;font-size:11px!important;line-height:1.1}.ig-chip span{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ig-chi{display:block;width:42px;height:42px;border-radius:12px;background:#eef4fb center/86% no-repeat}.ig-chip.on{background:linear-gradient(#4aa0ff,#2f74e0)!important;color:#fff!important;box-shadow:0 3px 0 #1c56b0!important}.ig-chip.on .ig-chi{background-color:#ffffff40}.ig-chip.locked .ig-chi{filter:grayscale(1);opacity:.5}.ig-chip.empty:after{top:3px!important;right:5px!important}.ig-items.ig-grid{display:grid!important;grid-template-columns:1fr 1fr;gap:8px!important;align-content:start;min-height:260px!important;max-height:min(330px,40vh)!important;padding:2px 2px 6px}.ig-ban{grid-column:1/-1;display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:16px;background:#eef4fb;box-shadow:inset 0 0 0 1.5px #dbe6f4}.ig-ban.gold{background:linear-gradient(90deg,#fff4cf,#ffe9b0);box-shadow:inset 0 0 0 1.5px #ffd36a}.ig-ban .ig-t small{white-space:normal}.ig-bi{flex:none;width:34px;height:34px;border-radius:11px;background:center/20px no-repeat}.ig-bi.cosy{background-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M12%2021s-8-5.2-8-11a4.5%204.5%200%200%201%208-2.8A4.5%204.5%200%200%201%2020%2010c0%205.8-8%2011-8%2011z%22%20fill%3D%22%23ff5a8a%22/%3E%3C/svg%3E");background-color:#fff}.ig-bi.rooms{background-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Crect%20x%3D%226%22%20y%3D%223%22%20width%3D%2212%22%20height%3D%2218%22%20rx%3D%221.5%22%20fill%3D%22%23fff%22/%3E%3Ccircle%20cx%3D%2215%22%20cy%3D%2212.5%22%20r%3D%221.2%22%20fill%3D%22%233c7fd6%22/%3E%3C/svg%3E");background-color:#3c7fd6}.ig-bi.sv{background-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M4%209l8-4%208%204v9l-8%204-8-4z%22%20fill%3D%22%23fff%22/%3E%3Cpath%20d%3D%22M4%209l8%204%208-4M12%2013v9%22%20stroke%3D%22%238a5ad6%22%20stroke-width%3D%221.4%22%20fill%3D%22none%22/%3E%3C/svg%3E");background-color:#8a5ad6}.ig-bi.lock{background-image:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Crect%20x%3D%225%22%20y%3D%2210.5%22%20width%3D%2214%22%20height%3D%2210%22%20rx%3D%222%22%20fill%3D%22%23fff%22/%3E%3Cpath%20d%3D%22M8%2010.5V8a4%204%200%200%201%208%200v2.5%22%20stroke%3D%22%23fff%22%20stroke-width%3D%222.2%22%20fill%3D%22none%22/%3E%3C/svg%3E");background-color:#9aa6b8}.ig-card{--tc:#9aa6b8;position:relative;display:flex;flex-direction:column;gap:4px;padding:7px 7px 8px;border-radius:18px;background:#fff;box-shadow:0 3px 0 #d5e0ee,inset 0 0 0 1.5px #e3ebf6;min-width:0}.ig-pic{position:relative;height:96px;border-radius:13px;background:radial-gradient(circle at 50% 60%,color-mix(in srgb,var(--tc) 30%,#fff) 0%,color-mix(in srgb,var(--tc) 12%,#fff) 70%);overflow:hidden}.ig-pic:before{content:"";position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M12%202.5l2.9%206%206.6.8-4.9%204.5%201.3%206.5L12%2017l-5.9%203.3%201.3-6.5L2.5%209.3l6.6-.8z%22%20fill%3D%22%23fff%22/%3E%3C/svg%3E") 12% 18%/12px no-repeat,url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M12%202.5l2.9%206%206.6.8-4.9%204.5%201.3%206.5L12%2017l-5.9%203.3%201.3-6.5L2.5%209.3l6.6-.8z%22%20fill%3D%22%23fff%22/%3E%3C/svg%3E") 88% 30%/9px no-repeat;opacity:.8}.ig-pic i{position:absolute;inset:6px;background:center/contain no-repeat;filter:drop-shadow(0 4px 3px #0b244533)}.ig-tag{position:absolute;top:6px;left:6px;padding:2px 8px;border-radius:999px;background:#2fb466;color:#fff;font-size:10.5px;font-weight:900;box-shadow:0 2px 0 #1f8a4a}.ig-lk{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#ffffff70}.ig-lk .ci{width:30px;height:30px;opacity:.8}.ig-q{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:40px;font-weight:900;color:#ffffffcc;text-shadow:0 2px 4px #0005}.ig-card.hid .ig-pic{background:linear-gradient(#5a6a85,#3a4660)}.ig-card.hid .ig-pic i{filter:brightness(0) opacity(.45)}.ig-card.dim .ig-pic i{filter:grayscale(.6) opacity(.6)}.ig-card.cur{box-shadow:0 3px 0 #1f9d55,inset 0 0 0 2.5px #2fb466;background:#f2fff6}.ig-ct{display:flex;flex-direction:column;align-items:flex-start;gap:1px;padding:0 3px;min-width:0}.ig-ct b{font-size:13.5px;font-weight:900;line-height:1.15;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ig-ct small{font-size:11px;font-weight:800;color:var(--tc);filter:brightness(.8)}.ig-ht{font-size:11px;font-weight:900;color:#e0306a}.ig-need{color:#8a96a8!important;filter:none!important;font-size:10.5px!important}.ig-cb{margin-top:auto;height:34px;border:0;border-radius:12px;background:linear-gradient(#ffd84a,#ffb21a);color:#4a2c00;font:inherit;font-weight:900;font-size:14px;box-shadow:0 3px 0 #c88400;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:2px}.ig-cb .ig-c{margin-right:4px}.ig-cb.blue{background:linear-gradient(#4aa0ff,#2f74e0);color:#fff;box-shadow:0 3px 0 #1c56b0}.ig-cb.alt{background:#e6edf7;color:#4a5a72;box-shadow:0 3px 0 #cbd6e4}.ig-cb.off{background:#e6edf7;color:#8a96a8;box-shadow:none;cursor:default}.ig-cb.off .ci{width:13px;height:13px;margin-right:3px;opacity:.6}.ig-cb.ok{background:none;color:#1f9d55}.ig-cb.poor{filter:saturate(.4);opacity:.7}.ig-cb:active:not(:disabled){transform:translateY(2px);box-shadow:0 1px 0 #0003}.ig-card.home .ig-pic{background:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20200%20120%22%20preserveAspectRatio%3D%22xMidYMid%20slice%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22s%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%220%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%237cc0ff%22/%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23dff0ff%22/%3E%3C/linearGradient%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%220%22%20y2%3D%221%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%23ffffff%22/%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23e6eef8%22/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect%20width%3D%22200%22%20height%3D%22120%22%20fill%3D%22url%28%23s%29%22/%3E%3Ccircle%20cx%3D%22160%22%20cy%3D%2222%22%20r%3D%2210%22%20fill%3D%22%23fff6c8%22%20opacity%3D%22.9%22/%3E%3Cg%20fill%3D%22%23fff%22%20opacity%3D%22.9%22%3E%3Cellipse%20cx%3D%2240%22%20cy%3D%2220%22%20rx%3D%2214%22%20ry%3D%225%22/%3E%3Cellipse%20cx%3D%2250%22%20cy%3D%2217%22%20rx%3D%229%22%20ry%3D%225%22/%3E%3Cellipse%20cx%3D%22120%22%20cy%3D%2214%22%20rx%3D%2211%22%20ry%3D%224%22/%3E%3Cellipse%20cx%3D%22128%22%20cy%3D%2212%22%20rx%3D%227%22%20ry%3D%224%22/%3E%3C/g%3E%3Cpath%20d%3D%22M-5%2070%20L22%2030%20L40%2052%20L62%2022%20L88%2058%20L108%2034%20L130%2060%20L152%2028%20L178%2056%20L205%2038%20L205%2080%20L-5%2080Z%22%20fill%3D%22%239db4d6%22/%3E%3Cpath%20d%3D%22M22%2030%20L15%2040%20L22%2037%20L28%2042Z%20M62%2022%20L54%2033%20L62%2030%20L69%2035Z%20M108%2034%20L101%2043%20L108%2040%20L114%2044Z%20M152%2028%20L145%2038%20L152%2035%20L159%2040Z%22%20fill%3D%22%23fff%22/%3E%3Cpath%20d%3D%22M-5%2078%20L18%2056%20L36%2070%20L58%2050%20L82%2072%20L104%2054%20L128%2074%20L150%2052%20L174%2072%20L205%2058%20L205%2090%20L-5%2090Z%22%20fill%3D%22%23b9cce6%22/%3E%3Cpath%20d%3D%22M58%2050%20L52%2057%20L58%2055%20L63%2058Z%20M150%2052%20L144%2059%20L150%2057%20L155%2060Z%20M18%2056%20L13%2062%20L18%2060%20L22%2063Z%22%20fill%3D%22%23fff%22/%3E%3Cg%20fill%3D%22%232f8f4e%22%3E%3Cpath%20d%3D%22M8%2082%20l5%20-12%20l5%2012z%22/%3E%3Cpath%20d%3D%22M14%2084%20l4%20-9%20l4%209z%22/%3E%3Cpath%20d%3D%22M176%2082%20l5%20-13%20l5%2013z%22/%3E%3Cpath%20d%3D%22M186%2084%20l4%20-9%20l4%209z%22/%3E%3Cpath%20d%3D%22M168%2085%20l3%20-7%20l3%207z%22/%3E%3C/g%3E%3Cpath%20d%3D%22M-5%2084%20Q50%2076%20100%2082%20T205%2080%20L205%20125%20L-5%20125Z%22%20fill%3D%22url%28%23g%29%22/%3E%3C/svg%3E") center/cover no-repeat}.ig-card.home .ig-pic:before{display:none}.ig-card.home .ig-pic i{inset:4px 2px 2px}#mh-tag{position:absolute;z-index:2;transform:translate(-50%,-100%);display:flex;align-items:center;gap:4px;padding:4px 10px 4px 5px;border:0;border-radius:999px;background:#fffffff2;color:#17365c;font:inherit;font-weight:900;font-size:12.5px;box-shadow:0 3px 0 #b8c8dc,0 4px 10px #0b1a3340;cursor:pointer;white-space:nowrap}#mh-tag:after{content:"";position:absolute;left:50%;bottom:-6px;margin-left:-6px;border:6px solid transparent;border-bottom:0;border-top-color:#fffffff2}#mh-tag i{width:20px;height:20px;border-radius:50%;background:#3c7fd6 url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M2.5%2019.5a9.5%209.5%200%200%201%2019%200z%22%20fill%3D%22%23fff%22%2F%3E%3Cpath%20d%3D%22M9%2019.5v-3a3%203%200%200%201%206%200v3z%22%20fill%3D%22%232c4468%22%2F%3E%3C%2Fsvg%3E") center/15px no-repeat}#mh-tag.new:before{content:"";position:absolute;top:-3px;right:-3px;width:10px;height:10px;border-radius:50%;background:#ff3d2e;border:2px solid #fff}.ig-open #mh-tag{display:none!important}@keyframes igwob{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}'
# BH. the igloo: a home to roll around in and spend coins on, with a daily cocoa mug
rep("function NW5(){",open(D+'/igloo_models.js').read()+"\nvar IGS=[`tub`,`bbq`,`rink`,`fountain`,`fish`,`slide`,`gazebo`,`fort`],IGI=[`stove`,`bed`,`rug`,`table`,`sofa`,`light`,`plant`,`art`],IGP=[[4.1,5.3,-1.8],[3.6,8.2,-1.4],[-3.9,4.2,1.5],[3.4,2.4,-1.3],[-3.9,8.4,1.75],[0,-60,0],[0,-60,0],[0,-60,0]],IGN=[3,4,5,5],IGNI=[4,6,7,8],IGC=[2,4,7,10],IGC0=[500,1500,3e3,5e3],IGW=[7,9,11,13],IGD=[6.5,8,9.5,11],IGHT=[3,3.4,3.7,4.4],IGHS=[3.2,3.2,3,2.6],IGE=[6,10.4,11.4,6.5],IGB=.2,IGSV=[`Snowy peak`,`Giant lollipop`,`Hay bale`,`Stone idol`,`Treasure chest`,`Desert urn`,`Lava lamp`,`Diving helmet`,`Jack-o\u2019-lantern`,`Dino egg`,`Toy robot`,`Arcade machine`,`Hot-air balloon`,`Toy rocket`],IGSVN=[3,5,7,9],IGCM=[[25,2,0],[60,4,1],[100,6,1],[150,8,2],[210,10,3]],IGWC=[0x2f8cff,0xff5fa8,0x3fb15a,0xf59324,0x13aec4,0x8a5ad6,0xf0483e,0x4aa8f0,0x5b4fd6,0xff6fd0,0x2f8cff,0xff5fa8,0x3fb15a,0xf59324],IGBZ=[1,.95,1.55,1.3,1.75],IGBD=[{id:`robin`,name:`Robin`,tag:`Quick little flapper`,cost:2500,hz:7},{id:`bluebird`,name:`Bluebird`,tag:`Loves a barrel roll`,cost:4e3,hz:7.5},{id:`owl`,name:`Snowy owl`,tag:`Silent glider`,cost:9e3,hz:3.2},{id:`parrot`,name:`Parrot`,tag:`Show-off loop-the-loops`,cost:14e3,hz:5},{id:`eagle`,name:`Golden eagle`,tag:`Huge swooping wings`,cost:22e3,hz:2.6}],IGBS={flap:[3,2,4,1],glide:[2.2,2,3.5,1],hover:[1,1.2,2,0],swoop:[1.2,1.6,1.8,1],loop:[.9,1.4,1.6,1],roll:[.9,.9,1.1,1],circle:[1,3,3.4,0],dive:[1,1.4,1.6,1]},IGFOV=80,IGCH=1.05,IGCT=.95,IGHW=[4.4,16.4,3.2],IGTW=[6.4,6.2,3.2],IGDZ=-.4,IGDZF=l=>-IGD[l]/2+3.67,IGWCh=w=>[0x8fd0ff,0xff8cc0,0x8fe08a,0x9ad08a,0x6fc8f0,0xf0d9a0,0xff7a3a,0x4aa8f0,0x9a6ad0,0x9ae07a,0xffd23a,0x4ff0ff,0xd6efff,0x6a7aff][w],IGTC=[`#8a96a8`,`#2fb466`,`#2f8cff`,`#b04ae8`],IGTN=[`Basic`,`Nice`,`Fancy`,`Deluxe`],IGPD={y:0,sp:0,fl:0,fk:0,rl:0,rk:0,hx:0,tx:0},IGPT=[{id:`penguin`,name:`Penguin chick`,tag:`Waddles about the garden`,cost:2e3,w:[.5,.2,.2,.1],fp:.1,hi:.25},{id:`bunny`,name:`Snow bunny`,tag:`Hops about and sits up`,cost:3e3,w:[.2,.35,.25,.2],fp:.12,hi:.4},{id:`cat`,name:`Cat`,tag:`Naps by the fire`,cost:4e3,w:[.15,.4,.4,.05],fp:.2,hi:.7},{id:`husky`,name:`Husky pup`,tag:`Wags when you roll by`,cost:8e3,w:[.25,.4,.2,.15],fp:.14,hi:.5,wag:1},{id:`fox`,name:`Fox`,tag:`Prowls and sniffs around`,cost:12e3,w:[.2,.35,.2,.25],fp:.14,hi:.3},{id:`bear`,name:`Polar bear cub`,tag:`Loves a long lie down`,cost:2e4,w:[.15,.35,.45,.05],fp:.1,hi:.6}],IGH=[{name:`Snow hut`,cost:0,cosy:0},{name:`Igloo`,cost:1e4,cosy:5},{name:`Big igloo`,cost:3e4,cosy:12},{name:`Ice palace`,cost:75e3,cosy:20}];function NW5(){")
rep("payK(){",open(D+'/igloo_game.js').read()+"payK(){")
rep("render(){if(this.world.commit(),","render(){if(this.igOn){this.igRender();return}if(this.world.commit(),")
rep('{let b=document.getElementById("progress-btn");if(b){','{let b=document.getElementById("igloo-btn");if(b){b.dataset.w||(b.dataset.w=1,b.addEventListener("click",()=>this.showIgloo()));b.classList.toggle("new",this.igMugReady())}}{let b=document.getElementById("progress-btn");if(b){')
h=open(D+'/index.html').read()
a2='<button id="progress-btn" class="mission-tab side-tab progress-tab" type="button">Progress</button>'
assert h.count(a2)==1
h=h.replace(a2,a2+'<button id="igloo-btn" type="button" aria-label="Your igloo"></button>')
a3='<section id="settings" class="screen hidden">'
assert h.count(a3)==1
h=h.replace(a3,IGHTML+a3)
assert h.count('</head>')==1
h=h.replace('</head>','<style>'+IGCSS+'</style></head>')
open(D+'/index.html','w').write(h)
# BI. the max-level test account also gets a million coins
rep('{let q=document.getElementById("set-max");q&&!q.dataset.arm&&(q.textContent=','{let X=this.save.x;X&&!X.mxc&&(X.maxOn||BC(this.save.xp||0).level>=50&&this.save.reached>=Eu)&&(X.mxc=1,this.save.coins=Math.max(this.save.coins||0,1e6),ZC(this.save),this.ui.setCoins&&this.ui.setCoins(this.save.coins))}{let q=document.getElementById("set-max");q&&!q.dataset.arm&&(q.textContent=')
rep("this.save.x.maxOn=0;this.save.xp=0;","this.save.x.maxOn=0;this.save.x.mxc=0;this.save.xp=0;")
# BJ: let swipes scroll the home's decoration lists (the page-level touch blocker was eating them)
rep("closest(`.card,#play-pager,.stats-card,.lvlup-card`)","closest(`.card,#play-pager,.stats-card,.lvlup-card,.ig-sheet,.tr-road`)")
# BK: the home matters to runs (cosy coins bonus, magnet time, souvenirs, pet presents, run buddy)
rep("payK(){if(ENDL)return","payK(){return this.payK0()*this.igPerk().k}payK0(){if(ENDL)return")
rep("if(ENDL)return[`Worlds beaten bonus: coins \\u00d7${this.payK().toFixed(1)}`]","if(ENDL)return[`Worlds beaten bonus: coins \\u00d7${this.payK0().toFixed(1)}`]")
rep("payRows(){if(!this.keepScores||this.dailyRun)return[];","payRows(){let R=this.payRows0(),P=this.keepScores?this.igPerk():null;P&&P.pct&&R.push(`Cosy home: +${P.pct}% coins`);return R.concat(this.keepScores&&this.homeRows||[])}payRows0(){if(!this.keepScores||this.dailyRun)return[];")
rep("finish(){this.state=`ended`,this.flushHeld(),","finish(){this.state=`ended`,this.flushHeld(),this.homeEnd(),")
rep("this.runCoins=0,this.runMissions=0,","this.runCoins=0,this.runMissions=0,this.rs0=this.save.reached|0,this.wT={},")
rep("this.beam=10,this.beamFull=10,this.beamName=`Magnet`,this.ui.banner(`Magnet!`,`Small things fly to you for 10 seconds`)","(()=>{let T=10+this.igPerk().s;this.beam=T,this.beamFull=T,this.beamName=`Magnet`,this.ui.banner(`Magnet!`,`Small things fly to you for ${T} seconds`)})()")
rep("render(){if(this.igOn){this.igRender();return}","render(){if(this.igOn){this.igRender();this.mhTick();return}this.budTick();this.mhTick();this.uiStack&&queueMicrotask(()=>this.uiStack());")
rep('b.classList.toggle("new",this.igMugReady())','b.classList.toggle("new",this.igMugReady()||this.igBadge())')

# BL: Brawl Stars style trophies from Endless + Trophy Road



s=s.replace("var IGS=[`fire`","var TRR=[[0,`Bronze I`,`#c8803a`],[50,`Bronze II`,`#c8803a`],[100,`Bronze III`,`#c8803a`],[150,`Silver I`,`#9aa6b8`],[225,`Silver II`,`#9aa6b8`],[300,`Silver III`,`#9aa6b8`],[400,`Gold I`,`#e8b020`],[500,`Gold II`,`#e8b020`],[600,`Gold III`,`#e8b020`],[750,`Diamond I`,`#2ab8f0`],[900,`Diamond II`,`#2ab8f0`],[1000,`Mythic I`,`#b04ae8`],[1150,`Mythic II`,`#b04ae8`],[1300,`Legendary I`,`#f0384e`],[1500,`Legendary II`,`#f0384e`],[1750,`Masters`,`#ff9a1a`]],TRD=[[10,`c`,200],[20,`g`,0],[35,`c`,400],[50,`g`,1],[75,`c`,600],[100,`g`,2],[125,`c`,800],[150,`g`,2],[200,`c`,1200],[250,`g`,3],[300,`c`,1600],[350,`g`,3],[400,`c`,2e3],[450,`g`,3],[500,`g`,4],[600,`c`,3500],[700,`g`,4],[800,`c`,4e3],[900,`g`,4],[1e3,`c`,6e3],[1100,`g`,5],[1250,`c`,8e3],[1400,`g`,5],[1500,`c`,1e4],[1750,`g`,5],[2e3,`c`,2e4]],TRCH=[`wood`,`iron`,`silver`,`gold`,`diamond`,`legend`],TRG=[`Common`,`Uncommon`,`Rare`,`Ultra rare`,`Super rare`,`Legendary`],IGS=[`fire`",1)

# BM: a celebratory level-up screen
rep("showMaps(){",open(D+'/levelup.js').read()+"showMaps(){")
rep("this.lvlQ=[];let d=document.getElementById(\"lvlup\");if(!d)return;","this.lvlQ=[];if(document.getElementById(\"lvx\"))return this.lvShow(q);let d=document.getElementById(\"lvlup\");if(!d)return;")
rep("return{text:`${c.name}: ${e.rname} ${e.name}${e.worn?","return{cid:c.id,img:e.img,gn:e.name,gr:e.rname,text:`${c.name}: ${e.rname} ${e.name}${e.worn?")
rep("return this.save.skins.push(s.id),{text:`${c.name}: new skin, ${s.name}!`,color:R?.color}","return this.save.skins.push(s.id),{cid:c.id,sk:s.name,text:`${c.name}: new skin, ${s.name}!`,color:R?.color}")
rep("closest(`.card,#play-pager,.stats-card,.lvlup-card,.ig-sheet,.tr-road`)","closest(`.card,#play-pager,.stats-card,.lvlup-card,.ig-sheet,.tr-road,.lvx-grid`)")
s=s.replace("IGS=[`tub`","MAPC=[[`#4aa0ff`,`#2a66c8`],[`#ff7ab8`,`#d8407e`],[`#5ac85a`,`#2f8a3a`],[`#3fae6a`,`#1f6e46`],[`#2ac0c8`,`#1a7a9a`],[`#f0b04a`,`#c8782a`],[`#ff6a3a`,`#b82a1a`],[`#3a8aff`,`#1a4ab8`],[`#9a6ad0`,`#5a2a8a`],[`#8ad04a`,`#4a8a2a`],[`#ffc83a`,`#e0782a`],[`#ff4fd8`,`#7a2ab8`],[`#7ac8ff`,`#4a8ae0`],[`#3a3a8a`,`#14143a`],[`#8a5ad6`,`#3a2a8a`]],LVCOIN=`url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2048%2048%22%3E%3Cellipse%20cx%3D%2224%22%20cy%3D%2238%22%20rx%3D%2215%22%20ry%3D%225.5%22%20fill%3D%22%23c88400%22/%3E%3Crect%20x%3D%229%22%20y%3D%2231%22%20width%3D%2230%22%20height%3D%227%22%20fill%3D%22%23e8a400%22/%3E%3Cellipse%20cx%3D%2224%22%20cy%3D%2231%22%20rx%3D%2215%22%20ry%3D%225.5%22%20fill%3D%22%23ffd84a%22/%3E%3Cellipse%20cx%3D%2217%22%20cy%3D%2224%22%20rx%3D%2213%22%20ry%3D%225%22%20fill%3D%22%23c88400%22/%3E%3Crect%20x%3D%224%22%20y%3D%2218%22%20width%3D%2226%22%20height%3D%226%22%20fill%3D%22%23e8a400%22/%3E%3Cellipse%20cx%3D%2217%22%20cy%3D%2218%22%20rx%3D%2213%22%20ry%3D%225%22%20fill%3D%22%23ffe066%22/%3E%3Cellipse%20cx%3D%2232%22%20cy%3D%2217%22%20rx%3D%2212%22%20ry%3D%224.6%22%20fill%3D%22%23c88400%22/%3E%3Crect%20x%3D%2220%22%20y%3D%2211%22%20width%3D%2224%22%20height%3D%226%22%20fill%3D%22%23e8a400%22/%3E%3Cellipse%20cx%3D%2232%22%20cy%3D%2211%22%20rx%3D%2212%22%20ry%3D%224.6%22%20fill%3D%22%23ffd84a%22/%3E%3Cellipse%20cx%3D%2232%22%20cy%3D%2211%22%20rx%3D%227%22%20ry%3D%222.6%22%20fill%3D%22none%22%20stroke%3D%22%23c88400%22%20stroke-width%3D%221.4%22/%3E%3C/svg%3E')`,IGS=[`tub`",1)
assert 'MAPC=[' in s

# BN: level rewards list climbs upwards (level 1 at the bottom)
rep("d.classList.remove(\"hidden\");let tg=L.querySelector(\".next\")||L.lastChild;L.scrollTop=Math.max(0,tg.offsetTop-120)}showStats(){","[...L.children].reverse().forEach(e=>L.appendChild(e)),L.classList.add(`up`),d.classList.remove(\"hidden\");let tg=L.querySelector(\".next\")||L.firstChild;{let a=tg.getBoundingClientRect(),b=L.getBoundingClientRect();L.scrollTop+=a.top+a.height/2-(b.top+b.height/2)}}showStats(){")

# BO: end screen shows only the high score, no dates
rep("endTopRows(){let T=this.save.x.endTop||[];return T.length?[`Your best endless runs`,...T.map((e,i)=>`${i+1}. ${pdist(e[0])} \\u00b7 ${new Date(e[1]).toLocaleDateString(`en-GB`,{day:`numeric`,month:`short`})}`)]:[]}","endTopRows(){let T=this.save.x.endTop||[];return T.length?[`High score: ${pdist(T[0][0])}`]:[]}")

# BP: Endless - every wall smashed makes you a little faster (+2% each, up to +40%)
rep("return n.SPEED_K*(this.r/r.scale)**+n.SPEED_POW*r.scale*i*zu(r.lap).twist.speed*q**(n.SIZE_SPEED_X||0)}","return n.SPEED_K*(this.r/r.scale)**+n.SPEED_POW*r.scale*i*zu(r.lap).twist.speed*q**(n.SIZE_SPEED_X||0)*(ENDL?EWK:1)}")
rep("+=Math.max(0,s)*Yu()*vDisp(this.shown(a.r))/Math.max(1e-9,a.cruiseSpeed()*Yu()),","+=Math.max(0,s)*Yu()*vDisp(this.shown(a.r))/Math.max(1e-9,a.cruiseSpeed()/(ENDL?EWK:1)*Yu()),")
rep("vDisp(this.shown(a.r))*Math.max(0,a.speed)/Math.max(1e-9,a.cruiseSpeed())*3.6;","vDisp(this.shown(a.r))*Math.max(0,a.speed)/Math.max(1e-9,a.cruiseSpeed()/(ENDL?EWK:1))*3.6;")
rep("this.world.remove(r),this.stats.walls++,this.tally.walls++,","this.world.remove(r),this.stats.walls++,this.tally.walls++,ENDL&&EWK<1.4&&(EWK=Math.min(1.4,EWK+.02),this.floatAtBall&&this.floatAtBall(`Speed +${Math.round((EWK-1)*100)}%`,!1)),")
rep("xStart(){this.bumpRef=void 0,","xStart(){EWK=1,this.bumpRef=void 0,")
rep("var DREMIX=-1,ENDL=0,","var EWK=1,DREMIX=-1,ENDL=0,")
rep("payK(){return this.payK0()","ewk(){return EWK}payK(){return this.payK0()")

# BQ: one big Play = Endless (World 1 until it's completed); worlds have their own Play buttons and a world run ends when that world is completed
rep("showMaps(){",open(D+'/playmode.js').read()+"showMaps(){")
rep("showMaps(){if(this.state!==`title`)return;let R=","showMaps(){return this.showMaps2()}showMaps0(){if(this.state!==`title`)return;let R=")
rep("startEndless(){if(this.state!==\"title\"||(this.save.reached??0)<2)return;","startEndless(){if(this.state!==\"title\"||(this.save.reached??0)<1)return;")
rep("showPick(){PAYCUT=","showPick(){setTimeout(()=>this.plMain&&this.plMain(),0);if(this.pickMain){this.plPick();return}this.state===`title`&&ENDL&&this.plOff();PAYCUT=")
rep("pickWorld(e){if(this.pickDaily){e>0&&(this.pickDaily=!1,this.showPick());return}if(e<0&&this.startLap===0){this.pickDaily=!0,this.showPick();return}","pickWorld(e){if(this.pickMain){e&&(this.pickMain=0,this.pickDaily=e<0,this.showPick());return}if(this.pickDaily){e>0&&(this.pickDaily=!1,this.pickMain=1,this.showPick());return}if(e<0&&this.startLap===0){this.pickMain=1,this.showPick();return}")
rep("hasPrev:!0,hasNext:e<Eu,dot:e===0&&!this.dailyDone()})}","hasPrev:!0,hasNext:e<Eu})}")
rep('{let b=document.getElementById("igloo-btn");if(b){','{this.plMain()}{let b=document.getElementById("igloo-btn");if(b){')
rep("this.lapSeen=t,this.worldsDone++,this.flushHeld(),","this.lapSeen=t,this.worldsDone++,this.wDone=1,this.flushHeld(),")
rep("(this.state===`dying`||this.state===`finishing`)&&(this.endTimer-=t,this.endTimer<=0&&this.xEnd())","this.wDone&&(this.wDone=0,this.state===`playing`&&this.completeWorld()),(this.state===`dying`||this.state===`finishing`)&&(this.endTimer-=t,this.endTimer<=0&&this.xEnd())")
rep("quit:{title:`Run ended`,subtitle:`You stopped in the ${o}. ${s}`}}[this.endKind]","quit:{title:`Run ended`,subtitle:`You stopped in the ${o}. ${s}`},complete:{title:`World complete!`,subtitle:`You completed ${zu(Math.max(0,ed(this.ball.d).lap-1)).name}. ${s}`}}[this.endKind]")
rep("lk||r.addEventListener(`click`,()=>{this.pickDaily=!1,this.pickWorld(i-this.startLap),this.showPick(),$(`maps`).classList.add(`hidden`)});L.appendChild(r)","lk||(r.addEventListener(`click`,()=>{this.pickDaily=!1,this.pickWorld(i-this.startLap),this.showPick(),$(`maps`).classList.add(`hidden`)}),(()=>{let q=document.createElement(`span`);q.className=`map-play`,q.setAttribute(`role`,`button`),q.innerHTML=`<i></i>Play`,q.addEventListener(`click`,e=>{e.stopPropagation(),this.pickDaily=!1,this.pickWorld(i-this.startLap),this.showPick(),$(`maps`).classList.add(`hidden`),this.state===`title`&&this.start()}),r.appendChild(q)})());L.appendChild(r)")

for x,y in [("`Endless: ${EUN.length} worlds in the mix","`Avalanche Run: ${EUN.length} worlds in the mix"),("`New endless record! `","`New record! `"),("` \\u00b7 new endless record!`","` \\u00b7 new record!`"),("` \\u00b7 endless best ${","` \\u00b7 best ${"),('row(p,"Endless best"','row(p,"Avalanche Run best"'),("`Endless best ${pdist(b)}`:`Endless best: not yet`","`Avalanche best ${pdist(b)}`:`Avalanche best: not yet`"),("rx?`Endless remix of every world`","rx?`Every world remixed`")]:
  assert s.count(x)==1,x;s=s.replace(x,y)

s=s.replace("function Lu(e){","function DTD(n,h,o){return{name:n,hint:h,speed:1,lane:1,jump:1,gravity:1,fog:1,plough:1,ramp:1,slide:1,wind:0,wall:1,...o}}var DTL=[DTD(`Avalanche fury`,`The avalanche is much faster`,{aval:1.22}),DTD(`Thick walls`,`Walls need a bigger ball`,{wall:1.14}),DTD(`Black ice`,`Super slippery steering`,{slide:2.4}),DTD(`Melting day`,`You melt really fast`,{melt:2.6}),DTD(`Turbo`,`Everything is much faster`,{speed:1.2}),DTD(`Gale`,`Strong wind shoves you around`,{wind:3.2}),DTD(`Whiteout`,`Thick fog, you can barely see`,{fog:.28}),DTD(`Tightrope`,`The lane is really narrow`,{lane:.66}),DTD(`No gear`,`Your equipment is switched off`,{nogear:1}),DTD(`Tiny ball`,`You grow much slower`,{growth:.6})];function DTC(t){let c=DTWM.get(t);return c&&c.twist===DTW?c:(c={...t,twist:DTW},DTWM.set(t,c),c)}function Lu(e){",1)
for x,y,c in [("var EWK=1,DREMIX=-1,ENDL=0,","var DTW=null,DTWM=new WeakMap,EWK=1,DREMIX=-1,ENDL=0,",1),
 ("return t||(t=Lu(e),Ru.set(K_,t)),t}","return t||(t=Lu(e),Ru.set(K_,t)),DTW?DTC(t):t}",1),
 ("DREMIX=Eu+this.xDay()%997,this._dailyArm=!0,","DREMIX=Eu+this.xDay()%997,DTW=this.dTw(),this._dailyArm=!0,",1),
 ("this.toasts.unshift(`\\u{1F4C5} Daily remix: ${zu(0).name}`)}","this.dApply(),this.ui.banner(`Daily: ${DTW.name}`,DTW.hint),this.toasts.unshift(`\\u{1F4C5} Today's rule: ${DTW.name}! ${DTW.hint}`)}",1),
 ("if(this.dailyRun){let t=this.xDay(),n=this.save.x.daily;","DTW&&(DTW=null,HS(this.save.gear.eq,BC(this.save.xp).level));if(this.dailyRun){let t=this.xDay(),n=this.save.x.daily;",1),
 ("DREMIX=-1,ENDL=0,this.pickDaily=!1","DREMIX=-1,ENDL=0,DTW&&(DTW=null,HS(this.save.gear.eq,BC(this.save.xp).level)),this.pickDaily=!1",1),
 ("`${zu(Eu+this.xDay()%997).name} \\u00b7 smash 2 walls to win`","`Today: ${this.dTw().name} \\u00b7 finish the level`",2),
 ("let t=ed(a.d).lap;if(this.keepScores&&!ENDL&&!this.dailyRun&&t>this.lapSeen)","let t=ed(a.d).lap;this.dailyRun&&t>0&&!this.dWin&&(this.dWin=1,this.wDone=1);if(this.keepScores&&!ENDL&&!this.dailyRun&&t>this.lapSeen)",1),
 ("if(!n.claimed&&this.stats.walls>=2){","if(!n.claimed&&this.dWin){",1),
 ("e.push(`\\u{1F4C5} Daily: smash 2 walls to win (you got ${this.stats.walls})`)","e.push(`\\u{1F4C5} Daily: reach the end of the level to win`)",1),
 ("complete:{title:`World complete!`","complete:{title:this.dailyRun?`Daily complete!`:`World complete!`",1),
 ("DTW=this.dTw(),this._dailyArm=!0,","DTW=this.dTw(),this.dWin=0,this._dailyArm=!0,",1)]:
  assert s.count(x)==c,x;s=s.replace(x,y)
x="ENDL=1,DREMIX=Eu+1+Math.floor(Math.random()*900),this._endArm=!0,this.startLap=0";assert s.count(x)==1;s=s.replace(x,"ENDL=1,DREMIX=this._pvR||Eu+1+Math.floor(Math.random()*900),this._pvR=0,this._endArm=!0,this.startLap=0")

# ---- BR: 30 worlds, no Remix
x="function Tu(e){return Cu.indexOf(e)}var Eu=wu.length,";assert s.count(x)==1;s=s.replace(x,open(D+'/worlds2.js').read()+"function Tu(e){return Cu.indexOf(e)}wu.push(...NW2());var Eu=wu.length,")
for x,y,c in [('"Black hole":"void"}','"Black hole":"void","Frost avalanche":"snow","Rolling boulders":"herd","Honey flood":"water","Ghost crew":"ghost","Power surge":"neon","Whirlpool":"water","Magma surge":"lava","Candyfloss avalanche":"sweet","Haunted toy avalanche":"toys","Wormhole":"void","Electric tide":"neon","Cattle stampede":"herd","Hurricane":"wind","Steam blast":"ash","Nightmare":"ghost","Supernova":"void"}',1),
 ("name:e<Eu?zu(e).name:`Remix worlds`,index:e+1,count:Eu+1,locked:e>this.save.reached,hasPrev:!0,hasNext:e<Eu})}","name:zu(e).name,index:e+1,count:Eu+1,locked:e>this.save.reached,hasPrev:!0,hasNext:e<Eu-1})}",1),
 ("let t=au(this.startLap+e,0,Eu);","let t=au(this.startLap+e,0,Eu-1);",1),
 ("payK0(){if(ENDL)return 1+.1*Math.min(Eu,this.save.reached|0);","payK0(){if(ENDL){let R=this.save.reached|0;return 1+.1*Math.min(Cu.length,R)+.025*Math.max(0,Math.min(Eu,R)-Cu.length)}",1),
 ("e<Eu&&(this.bookPage=e),this.showBook(0)}","e<Eu&&(this.bookPage=Math.max(0,Cu.indexOf(Su[zu(e).sources[0]].key))),this.showBook(0)}",1),
 ("start(){this.state===`ended`&&this.endRun&&!this._endArm&&","start(){setTimeout(()=>this.wRule&&this.wRule(),0);this.state===`ended`&&this.endRun&&!this._endArm&&",1)]:
  assert s.count(x)==c,x;s=s.replace(x,y)
for x,y,c in [("reset(t=0,n=0){qu(n),this.ball.reset(),","reset(t=0,n=0){qu(n),WSL=ed(Math.max(0,t)).lap,this.ball.reset(),",1),
 ("c=o===0&&s===0?1:cu(0,.14,a.t),l=od(i),u=sd(i),d=ad(i),f=d.stars;","c=(o===0||o===WSL)&&s===0?1:cu(0,.14,a.t),l=od(i),u=sd(i),d=ad(i),f=d.stars;",1),
 ("var DTW=null,DTWM=new WeakMap,","var WSL=0,WPX=[-.3,.3,.3,-.3],DTW=null,DTWM=new WeakMap,",1)]:
  assert s.count(x)==c,x;s=s.replace(x,y)

# ---- BS: unique models, souvenirs and rooms for worlds 15-30
x="mS.push(...NW5());";assert s.count(x)==1;s=s.replace(x,"mS.push(...NW5());mS.push(...NW6());")
x="function Tu(e){return Cu.indexOf(e)}wu.push(...NW2());";assert s.count(x)==1;s=s.replace(x,open(D+'/nw6.js').read()+x)
for x,y,c in [("function Bu(e,t){let n=e.sources.length;","function Bu(e,t){if(e.smap&&e.smap[t]!==void 0)return e.smap[t];let n=e.sources.length;",1),
 ("`Arcade machine`,`Hot-air balloon`,`Toy rocket`]","`Arcade machine`,`Hot-air balloon`,`Toy rocket`,`Aurora lantern`,`Golden idol`,`Honey pot`,`Ghost ship`,`Golden cog`,`Coral pyramid`,`Dino skull`,`Cotton candy`,`Jack-in-the-box`,`Flying saucer`,`Glow jellyfish`,`Cowboy hat`,`Toy airship`,`Frostfire crystal`,`Moon nightlight`,`Dark star`]",1),
 ("0x2f8cff,0xff5fa8,0x3fb15a,0xf59324],IGBZ=","0x2f8cff,0xff5fa8,0x3fb15a,0xf59324,0x5ad8c8,0x6ab84a,0xffc83a,0x3aa890,0x8a98b0,0x2ab0c0,0xff7a3a,0xffa8d8,0xb04ad8,0x5af0c0,0x2ad8e8,0xf0a050,0x6ab0ff,0x8ab8f0,0xa898f0,0x7a3ab0],IGBZ=",1),
 ("0xd6efff,0x6a7aff][w]","0xd6efff,0x6a7aff,0x5ad8c8,0xffe27a,0xffc93c,0x9fe8d8,0x40d8ff,0x5ad8c8,0xff5a14,0xffa8d8,0x9aff3a,0x5af0c0,0xff4ab8,0xffb870,0xfff0d0,0xff5a1a,0xffe08a,0xff4a6a][w]",1),
 ("IGHW=[4.4,16.4,3.2]","IGHW=[4.4,32.4,3.2]",1),
 ("payK0(){if(ENDL){let R=this.save.reached|0;return 1+.1*Math.min(Cu.length,R)+.025*Math.max(0,Math.min(Eu,R)-Cu.length)}","payK0(){if(ENDL){let R=this.save.reached|0;return 1+.1*Math.min(14,R)+.025*Math.max(0,Math.min(Eu,R)-14)}",1)]:
  assert s.count(x)==c,x;s=s.replace(x,y)

# ---- BT: full kits + book pages for worlds 15-30
for x,y,c in [("reward:150,defs:rC(mS.filter(e=>!e.special&&(e.world??0)===t))}}),{key:`secrets`","reward:150,defs:rC(mS.filter(e=>!e.special&&(e.world??0)===t))}}),...wu.slice(Cu.length).map((w,i)=>({key:w.key,name:w.name,reward:150,defs:rC(mS.filter(e=>!e.special&&e.world===Cu.length+i))})),{key:`secrets`",1),
 ("e<Eu&&(this.bookPage=Math.max(0,Cu.indexOf(Su[zu(e).sources[0]].key))),this.showBook(0)}","e<Eu&&(this.bookPage=e),this.showBook(0)}",1)]:
  assert s.count(x)==c,x;s=s.replace(x,y)

# ---- BU: world levels pay only the completion reward (no coins or gear during the run)
for x,y,c in [("function HOLD(g){","function WRN(g){return!ENDL&&!g.dailyRun}function HOLD(g){",1),
 ("xWall(e){if(!this.keepScores||this.autoplay)return;","xWall(e){if(!this.keepScores||this.autoplay)return;if(WRN(this)){e&&this.xStat(\"boss\",1);return}",1),
 ("xTick(e){if(!this.keepScores||this.autoplay||!(e>0))return;","xTick(e){if(!this.keepScores||this.autoplay||!(e>0)||WRN(this))return;",1),
 ("n=this.keepScores?Math.round((Math.max(0,WS(e)-WS(this.runStartR))+this.runCoins)*BS.coins*(this.stage.twist.coins||1)*this.payK()):0","n=this.keepScores?WRN(this)?this.wPay||0:Math.round((Math.max(0,WS(e)-WS(this.runStartR))+this.runCoins)*BS.coins*(this.stage.twist.coins||1)*this.payK()):0",1),
 ("this.flushHeld(),this.runCoins+=B,this.toasts.push(F?`World beaten for the first time! +${B} coins`:`World beaten! +${B} coins`)","this.flushHeld(),this.wPay=B,this.toasts.push(F?`World beaten for the first time! Reward: ${B} coins`:`World beaten! Reward: ${B} coins`)",1),
 ("this.runCoins=0,this.runMissions=0,","this.runCoins=0,this.wPay=0,this.runMissions=0,",1),
 ("P&&P.pct&&R.push(`Cosy home: +${P.pct}% coins`)","P&&P.pct&&!(WRN(this))&&R.push(`Cosy home: +${P.pct}% coins`)",1),
 ("if(this.worldsDone>0)return[`${this.worldsDone===1?`World`:`${this.worldsDone} worlds`} beaten: full coins`];return(this.save.reached|0)<2?[]:[`World not beaten: you keep 35% of the coins`,...(this.heldMsg?[this.heldMsg]:[])]}","return this.worldsDone>0?[]:[`No reward this time: complete the world to earn it`]}",1),
 ("}floatAtBall(e,t){","}wTx(t){return WRN(this)&&typeof t==`string`?t.replace(/ ?\\+[\\d,]+ coins?/i,``).replace(`Golden snowflake: bonus coins!`,`Golden snowflake!`):t}floatAtBall(e,t){if(WRN(this)&&typeof e==`string`){e=e.replace(/\\s*\\+\\d+ COINS!?/i,``).trim();if(!e)return}",1),
 ("this.ui.milestone(this.toasts.shift())","this.ui.milestone(this.wTx(this.toasts.shift()))",1)]:
  assert s.count(x)==c,(x[:60],s.count(x));s=s.replace(x,y)

# ---- BV: Avalanche Run = completed worlds only (incl. 15-30), no worlds-beaten coin bonus, explainer text
for x,y,c in [("function EUS(r){let n=Math.max(2,Math.min(Eu,(r|0)+1));EUN=Cu.slice(0,n).map(k=>Su.findIndex(e=>e.key===k)).filter(e=>e>=0);return EUN.length}","function EUS(r){let n=Math.max(1,Math.min(Eu,r|0));EUN=[];for(let i=0;i<n;i++)EUN.push(i<Cu.length?Su.findIndex(e=>e.key===Cu[i]):i);EUN=EUN.filter(e=>e>=0);return EUN.length}",1),
 ("SQ=E_&&EUN?EUN.map(e=>Su[e]):Su,","SQ=E_&&EUN?EUN.map(e=>e<Su.length?Su[e]:wu[e]):Su,",1),
 ("c=[],l=n()<.5?2:3;","c=[],l=Math.min(s.length,n()<.5?2:3);",1),
 ("payK0(){if(ENDL){let R=this.save.reached|0;return 1+.1*Math.min(14,R)+.025*Math.max(0,Math.min(Eu,R)-14)}","payK0(){if(ENDL)return 1;",1),
 ("if(ENDL)return[`Worlds beaten bonus: coins \\u00d7${this.payK0().toFixed(1)}`];","if(ENDL)return[];",1),
 ("this.toasts.unshift(`Avalanche Run: ${EUN.length} worlds in the mix \\u00b7 coins \\u00d7${this.payK().toFixed(1)}`)","this.toasts.unshift(`${EUN.length} completed world${EUN.length>1?`s`:``} mixed \\u00b7 coins and gear as you roll`)",1)]:
  assert s.count(x)==c,(x[:70],s.count(x));s=s.replace(x,y)

# ---- BW: in-game popups never overlap (stacking pass each frame)
x="payK(){return this.payK0()*this.igPerk().k}";assert s.count(x)==1;s=s.replace(x,open(D+'/uistack.js').read().strip()+x)

# ---- BX: home upgrades are level rewards (10/20/30)
for x,y,c in [("let w=Math.max(1,(this.save.reached??0)+1);e%10===0&&gg.push(","let w=Math.max(1,(this.save.reached??0)+1);HLV.indexOf(e)>0&&hm.push(HLV.indexOf(e));e%10===0&&gg.push(",1),
 ("let t=BC(this.save.xp);this.save.xp+=e;let n=BC(this.save.xp),r=0,i=[],gg=[],cr=0,ch=[];","let t=BC(this.save.xp);this.save.xp+=e;let n=BC(this.save.xp),r=0,i=[],gg=[],cr=0,ch=[],hm=[];",1),
 ("push({from:t.level,to:n.level,coins:r,skins:i,gear:gg,crates:cr,chests:ch})","push({from:t.level,to:n.level,coins:r,skins:i,gear:gg,crates:cr,chests:ch,homes:hm}),hm.length&&this.igHomeSync&&this.igHomeSync()",1),
 ("lvlParts(x){let p=[];","lvlParts(x){let p=[];HLV.indexOf(x)>0&&p.push(`${IGH[HLV.indexOf(x)].name} home`);",1),
 ("o.big=x%5===0||o.skins.length>0||o.unlock>0;","o.home=Math.max(0,HLV.indexOf(x));o.big=x%5===0||o.skins.length>0||o.unlock>0||o.home>0;",1),
 ("o.coins&&tl.append(tile(`<i class=\"lvl-coin\"></i>`,f(o.coins),\"coins\"));","o.coins&&tl.append(tile(`<i class=\"lvl-coin\"></i>`,f(o.coins),\"coins\"));o.home&&tl.append(tile(img(this.lvHomePic(o.home)),IGH[o.home].name,\"new home\",\"#2f9a4a\"));",1),
 ("o.gear>=0&&bits.push(`free ${GEAR_RARITY[o.gear].name} gear`);","o.home&&(pics.append(img(this.lvHomePic(o.home),\"ch\")),bits.unshift(`${IGH[o.home].name} home`));o.gear>=0&&bits.push(`free ${GEAR_RARITY[o.gear].name} gear`);",1),
 ("showLevels(){","lvHomePic(n){try{return this.igInit(),this.igThumb(`home${n}`,()=>this.ig.Mo.homeShot(n,IGHS[n],IGE[n]),-2.45)}catch(e){return``}}showLevels(){",1),
 ("var WSL=0,","var HLV=[0,15,30,45],WSL=0,",1)]:
  assert s.count(x)==c,(x[:70],s.count(x));s=s.replace(x,y)

# ---- BY: lodgers
for x,y,c in [("var HLV=[0,15,30,45],","var HLV=[0,15,30,45],IGLD=[{id:`chef`,name:`Penguin chef`,cosy:40,perk:`Daily presents give 25% more coins`,k:`mug`,v:.25},{id:`owl`,name:`Snow owl`,cosy:80,perk:`+5% XP from every run`,k:`xp`,v:.05},{id:`yeti`,name:`Yeti`,cosy:120,perk:`Start every run 5% bigger`,k:`start`,v:.05,out:1},{id:`fox`,name:`Arctic fox`,cosy:160,perk:`Find gear 10% more often`,k:`drop`,v:.1,out:1},{id:`spirit`,name:`Snow spirit`,cosy:200,perk:`+5% coins from Avalanche Run`,k:`coins`,v:.05,float:1}],",1),
 ("ounts].reduce((a,[k,v])=>a+(v>0&&!this.save.book[k]?5:0),0))*BS.xp),{before","ounts].reduce((a,[k,v])=>a+(v>0&&!this.save.book[k]?5:0),0))*BS.xp*this.ldK(`xp`)),{before",1),
 ("t>0?(this.ball.d=t,this.ball.r=rd(t)*BS.start):this.ball.r=e.START_RADIUS*BS.start","t>0?(this.ball.d=t,this.ball.r=rd(t)*BS.start*this.ldK(`start`)):this.ball.r=e.START_RADIUS*BS.start*this.ldK(`start`)",1),
 ("Math.random()<.12*BS.drop&&this.gearFind()","Math.random()<.12*BS.drop*this.ldK(`drop`)&&this.gearFind()",1),
 ("Math.random()<e/150*BS.drop","Math.random()<e/150*BS.drop*this.ldK(`drop`)",1),
 ("payK(){return this.payK0()*this.igPerk().k}","payK(){return this.payK0()*this.igPerk().k*(ENDL?this.ldK(`coins`):1)}",1),
 ("P&&P.pct&&!(WRN(this))&&R.push(`Cosy home: +${P.pct}% coins`)","P&&P.pct&&!(WRN(this))&&R.push(`Cosy home: +${P.pct}% coins`);ENDL&&this.keepScores&&this.ldK(`coins`)>1&&R.push(`Snow spirit: +${this.ldPc(4,this.ldT(4))}% coins`)",1)]:
  assert s.count(x)==c,(x[:70],s.count(x));s=s.replace(x,y)

# ---- BZ: pets are rewards (levels 5/10/20, rescue in worlds 5/10/20)
for x,y,c in [("{id:`penguin`,name:`Penguin chick`,","{id:`penguin`,lv:5,name:`Penguin chick`,",1),
 ("{id:`bunny`,name:`Snow bunny`,","{id:`bunny`,lv:10,name:`Snow bunny`,",1),
 ("{id:`cat`,name:`Cat`,","{id:`cat`,lv:20,name:`Cat`,",1),
 ("{id:`husky`,name:`Husky pup`,","{id:`husky`,wd:5,name:`Husky pup`,",1),
 ("{id:`fox`,name:`Fox`,","{id:`fox`,wd:10,name:`Fox`,",1),
 ("{id:`bear`,name:`Polar bear cub`,","{id:`bear`,wd:20,name:`Polar bear cub`,",1),
 ("HLV.indexOf(e)>0&&hm.push(HLV.indexOf(e));","HLV.indexOf(e)>0&&hm.push(HLV.indexOf(e));IGPT.forEach((d,j)=>d.lv===e&&pt.push(j));",1),
 (",ch=[],hm=[];",",ch=[],hm=[],pt=[];",1),
 ("chests:ch,homes:hm}),hm.length&&this.igHomeSync&&this.igHomeSync()","chests:ch,homes:hm,pets:pt}),hm.length&&this.igHomeSync&&this.igHomeSync(),pt.length&&this.ptSync&&this.ptSync()",1),
 ("lvlParts(x){let p=[];","lvlParts(x){let p=[];IGPT.forEach(d=>d.lv===x&&p.push(`${d.name} pet`));",1),
 ("o.home=Math.max(0,HLV.indexOf(x));o.big=","o.home=Math.max(0,HLV.indexOf(x));o.pet=IGPT.findIndex(d=>d.lv===x);o.big=o.pet>=0||",1),
 ("o.home&&tl.append(tile(img(this.lvHomePic(o.home)),IGH[o.home].name,\"new home\",\"#2f9a4a\"));","o.home&&tl.append(tile(img(this.lvHomePic(o.home)),IGH[o.home].name,\"new home\",\"#2f9a4a\"));o.pet>=0&&tl.append(tile(img(this.lvPetPic(o.pet)),IGPT[o.pet].name,\"new pet\",\"#e0559a\"));",1),
 ("o.home&&(pics.append(img(this.lvHomePic(o.home),\"ch\")),bits.unshift(`${IGH[o.home].name} home`));","o.home&&(pics.append(img(this.lvHomePic(o.home),\"ch\")),bits.unshift(`${IGH[o.home].name} home`));o.pet>=0&&(pics.append(img(this.lvPetPic(o.pet),\"ch\")),bits.unshift(`${IGPT[o.pet].name} pet`));",1),
 ("lvHomePic(n){","lvPetPic(n){try{return this.igInit(),this.igPortrait(`pt${n}`,()=>this.igPetGeo(n),.6)}catch(e){return``}}lvHomePic(n){",1),
 ("this.save.reached=t,ZC(this.save),this.toasts.push(`New world unlocked!`)","this.save.reached=t,ZC(this.save),this.toasts.push(`New world unlocked!`),this.ptSync&&this.ptSync(1)",1),
 ]:
  assert s.count(x)==c,(x[:70],s.count(x));s=s.replace(x,y)

# ---- Avalanche Run starts faster (EWB) with the avalanche matched
for x,y,c in [("EWK=1,DREMIX=-1","EWK=1,EWB=1.25,DREMIX=-1",1),
 ("(ENDL?EWK:1)}jump(","(ENDL?EWK*EWB:1)}jump(",1),
 ("a.cruiseSpeed()/(ENDL?EWK:1))*3.6","a.cruiseSpeed()/(ENDL?EWK*EWB:1))*3.6",1),
 ("*(this.stage.twist.aval||1)*(1+(ENDL?.02+.065*","*(this.stage.twist.aval||1)*(ENDL?1+(EWB-1)*.4:1)*(1+(ENDL?.02+.065*",1)]:
  assert s.count(x)==c,(x,s.count(x));s=s.replace(x,y)

# ---- snappier jumps: stronger gravity, faster fall
for x,y,c in [("JUMP_GRAVITY_K:42,","JUMP_GRAVITY_K:56,",1),
 ("this.airborne&&(this.vh-=this.gravityK*this.r*t,","this.airborne&&(this.vh-=this.gravityK*this.r*t*(this.vh<0?this.rampFlight?1.15:1.4:1),",1)]:
  assert s.count(x)==c,(x,s.count(x));s=s.replace(x,y)

# ---- distance always in metres
MF="toLocaleString(`en-GB`)"
for x,y,c in [("function EDS(m){return m<1e3?[String(Math.round(m)),` m`]:[(m/1e3).toFixed(2),` km`]}","function EDS(m){return[Math.round(m).toLocaleString(`en-GB`),` m`]}",1),
 ("function pdist(m){return m<1e3?`${Math.round(m/(m<100?1:10))*(m<100?1:10)} m`:`${(m/1e3).toFixed(m<1e5?1:0).replace(/\\.0$/,``)} km`}","function pdist(m){return m<1e3?`${Math.round(m/(m<100?1:10))*(m<100?1:10)} m`:`${(Math.round(m/10)*10).toLocaleString(`en-GB`)} m`}",1),
 ("text:`Roll 1 km in one run`","text:`Roll 1,000 m in one run`",1),("text:`Roll 10 km in total`","text:`Roll 10,000 m in total`",1),("text:`Roll 3 km in one run`","text:`Roll 3,000 m in one run`",1),
 ('desc:"Roll 10 km in total"','desc:"Roll 10,000 m in total"',1),('desc:"Roll 42 km in total"','desc:"Roll 42,195 m in total"',1),('desc:"Roll 5 km in one run"','desc:"Roll 5,000 m in one run"',1),
 ("`Roll ${T/1e3} km in ${run?`one run`:`total`}`","`Roll ${T.toLocaleString(`en-GB`)} m in ${run?`one run`:`total`}`",1),
 ("this.toasts.push(`${ML[mi-1]} km for the first time! Free ${nm}`)","this.toasts.push(`${(ML[mi-1]*1e3).toLocaleString(`en-GB`)} m for the first time! Free ${nm}`)",1),
 ("l=ch?`Chest at ${km} km`:`+${Math.round(25*this.payK())} coins · ${km} km`","l=ch?`Chest at ${(km*1e3).toLocaleString(`en-GB`)} m`:`+${Math.round(25*this.payK())} coins · ${(km*1e3).toLocaleString(`en-GB`)} m`",1)]:
  assert s.count(x)==c,(x[:60],s.count(x));s=s.replace(x,y)

# ---- distance counter matches Avalanche Run speed; per-1000 m bonus trimmed to keep coins level
for x,y,c in [("a.cruiseSpeed()/(ENDL?EWK:1)*Yu()","a.cruiseSpeed()/(ENDL?EWK*EWB:1)*Yu()",1),
 ("this.runCoins+=25*(km-(this.endKm||0))","this.runCoins+=21*(km-(this.endKm||0))",1),
 ("`+${Math.round(25*this.payK())} coins · ","`+${Math.round(21*this.payK())} coins · ",1)]:
  assert s.count(x)==c,(x,s.count(x));s=s.replace(x,y)

# ---- world levels: faster, easier early, harder late
for x,y,c in [("EWK=1,EWB=1.25,DREMIX=-1","EWK=1,EWB=1.25,WSPD=l=>1.12+.18*Math.min(l,29)/29,WAVF=l=>WSPD(l)*(.74+.014*Math.min(l,29)),WWL=l=>Math.min(1.4,.85+.022*l),DREMIX=-1",1),
 ("*(ENDL?EWK*EWB:1)}jump(","*(ENDL?EWK*EWB:DTW?1:WSPD(r.lap))}jump(",1),
 ("a.cruiseSpeed()/(ENDL?EWK*EWB:1))*3.6","a.cruiseSpeed()/(ENDL?EWK*EWB:DTW?1:WSPD(ed(a.d).lap)))*3.6",1),
 ("a.cruiseSpeed()/(ENDL?EWK*EWB:1)*Yu()","a.cruiseSpeed()/(ENDL?EWK*EWB:DTW?1:WSPD(ed(a.d).lap))*Yu()",1),
 ("*(ENDL?1+(EWB-1)*.4:1)*(1+(ENDL?.02+.065*(ed(a.d).lap+ed(a.d).zone/7):.02*Math.min(ed(a.d).lap,9)))","*(ENDL?1+(EWB-1)*.4:DTW?1:WAVF(ed(a.d).lap))*(1+(ENDL?.02+.065*(ed(a.d).lap+ed(a.d).zone/7):DTW?.02*Math.min(ed(a.d).lap,9):0))",1),
 ("r.lap===0?.93:r.lap===1?.97:1+.035*Math.min(r.lap-1,8)","DTW?r.lap===0?.93:r.lap===1?.97:1+.035*Math.min(r.lap-1,8):WWL(r.lap)",1)]:
  assert s.count(x)==c,(x,s.count(x));s=s.replace(x,y)

# ---- continue: 3 s shield bubble + avalanche held back
for x,y,c in [("this.avalancheOn&&(this.avalancheGap=Math.max(this.avalancheGap,20),this.surging=!1,this.hopeless=0)","this.avalancheOn&&(this.avalancheGap=EGAP,this.surging=!1,this.hopeless=0),this.contT=3,this.contG=EGAP",1),
 ("this.toasts.push(\"Continued: 3 seconds of safety\")","this.toasts.push(\"Shield on: 3 seconds of safety\")",1),
 ("this.freezeT>0&&(this.avalancheGap=Math.max(this.avalancheGap,this.freezeGap??0));let t=this.avalancheGap;","this.freezeT>0&&(this.avalancheGap=Math.max(this.avalancheGap,this.freezeGap??0)),this.contT>0&&(this.avalancheGap=Math.max(this.avalancheGap,this.contG||0));let t=this.avalancheGap;",1),
 ("updateRun(n,r){let i=e,a=this.ball;","updateRun(n,r){let i=e,a=this.ball;this.contT>0&&(this.contT=Math.max(0,this.contT-n),a.invuln=Math.max(a.invuln,Math.min(.3,this.contT)));this.shieldFx();",1),
 ("die(e){if(this.state!==`playing`)return;","die(e){if(this.state!==`playing`)return;this.contT=0,this._shM&&(this._shM.visible=!1);",1),
 ("xStart(){EWK=1,","xStart(){this.contT=0,this._shM&&(this._shM.visible=!1),EWK=1,",1),
 ("xNoContinue(){","shieldFx(){let b=this.ball,T=this.contT||0,S=this._shM;if(!S){if(T<=0)return;S=this._shM=new Wi(new Ea(1,3),new Mi({color:0x9fe4ff,transparent:!0,opacity:.3,depthWrite:!1}));let w=new Wi(new Ea(1,1),new Mi({color:0xffffff,wireframe:!0,transparent:!0,opacity:.5,depthWrite:!1}));S.add(w),S.userData.w=w,S.renderOrder=5,w.renderOrder=6}b.mesh.parent&&S.parent!==b.mesh.parent&&b.mesh.parent.add(S);S.visible=T>0&&b.mesh.visible;if(!S.visible)return;let t=performance.now()/1e3,fl=T<.8?Math.sin(t*28)>0?1:.25:1,k=b.r*b.pop*1.45*(1+.04*Math.sin(t*8));S.position.copy(b.mesh.position),S.scale.setScalar(k),S.material.opacity=(.2+.06*Math.sin(t*6))*fl,S.userData.w.material.opacity=.45*fl,S.userData.w.rotation.y=t*1.5,S.userData.w.rotation.x=t*.7}\nxNoContinue(){",1)]:
  assert s.count(x)==c,(x[:70],s.count(x));s=s.replace(x,y)

# ---- quieter music everywhere
for x,y,c in [("MUSIC_VOLUME:.24","MUSIC_VOLUME:.13",1)]:
  assert s.count(x)==c,(x,s.count(x));s=s.replace(x,y)

# ---- sharper picture: always antialias, crisper shadows, gentler auto-downscaling
for x,y,c in [("let i=(window.devicePixelRatio||1)<2;this.renderer=new iu({canvas:n,antialias:i,","let i=!0;this.renderer=new iu({canvas:n,antialias:i,",1),
 ("SHADOW_MAP_SIZE:1024","SHADOW_MAP_SIZE:2048",1),("MIN_PIXEL_RATIO:1","MIN_PIXEL_RATIO:1.5",1),("SLOW_FRAME_MS:21}","SLOW_FRAME_MS:25}",1)]:
  assert s.count(x)==c,(x,s.count(x));s=s.replace(x,y)

# ---- gear rebalance (CA)
R=[
 # odds: unchanged up to 10 worlds, keep improving to 30
 ("function gearOdds(e){let t=Math.min(1,Math.max(0,(e-1)/9));return GEAR_RARITY.map(n=>n.lo+(n.hi-n.lo)*t)}",
  "function gearOdds(e){let t=Math.min(1,Math.max(0,(e-1)/9)),u=Math.min(1,Math.max(0,(e-10)/20)),T=[8,22,30,22,12,6];return GEAR_RARITY.map((n,i)=>n.lo+(n.hi-n.lo)*t+(T[i]-n.hi)*u)}"),
 # new stat keys
 ("var BS={start:1,","var BS={wallNeed:1,rampBoost:0,discK:1,start:1,"),
 ("Object.assign(BS,{reach:1,","Object.assign(BS,{wallNeed:1,rampBoost:0,discK:1,reach:1,"),
 # caps
 ("e>=2&&n.ap[0](BS),e>=4&&n.ap[1]&&n.ap[1](BS)})}function US(","e>=2&&n.ap[0](BS),e>=4&&n.ap[1]&&n.ap[1](BS)}),BS.capd={};for(let[k,c]of[[`coins`,1.35],[`start`,1.3],[`gate`,1.5]])BS[k]>c&&(BS[k]=c,BS.capd[k]=1)}function US("),
 # Winter Warmer
 ('b:["Melt 50% slower","+8% growth"],ap:[B=>{B.melt*=.5}','b:["Melt 25% slower","+8% growth"],ap:[B=>{B.melt*=.75}'),
 # duplicates reworked
 ("{name:\"Magician\\'s hat\",icon:\"\\u{1F3A9}\",vis:11,v:[1.1,1.18,1.26,1.35,1.5,1.7],perk:v=>`Trick: gold discs appear ${gPct(v-1)}% more`,ap:(B,v)=>{B.secret*=v}}",
  "{name:\"Magician\\'s hat\",icon:\"\\u{1F3A9}\",vis:11,v:[.15,.25,.35,.5,.65,.8],perk:v=>`Trick: golden snowflakes give ${gPct(v)}% bigger rewards`,ap:(B,v)=>{B.discK*=1+v}}"),
 ("{name:\"Jet boots\",icon:\"\\u{1F680}\",vis:8,v:[1.1,1.18,1.26,1.35,1.45,1.55],perk:v=>`Blast: ${gPct(v-1)}% wider SLAM when landing off ramps`,ap:(B,v)=>{B.slam*=v}}",
  "{name:\"Jet boots\",icon:\"\\u{1F680}\",vis:8,v:[.06,.1,.14,.2,.26,.32],perk:v=>`Afterburner: ${gPct(v)}% faster for 2s after ramp landings`,ap:(B,v)=>{B.rampBoost=Math.max(B.rampBoost,v)}}"),
 ("{name:\"Parsnip nose\",icon:\"\\u{1F955}\",vis:8,v:[1,2,3,4,6,8],perk:v=>`Digger: +${v} coins per wall smashed`,ap:(B,v)=>{B.wallCoins+=v}}",
  "{name:\"Parsnip nose\",icon:\"\\u{1F955}\",vis:8,v:[.97,.95,.93,.9,.87,.84],perk:v=>`Battering ram: smash walls while ${gPct(1-v)}% smaller`,ap:(B,v)=>{B.wallNeed*=v}}"),
 # weak buffs
 ("{name:\"Trainers\",icon:\"\\u{1F45F}\",vis:6,v:[.4,.6,.8,1.1,1.4,1.8],perk:v=>`Warm-up: melting starts ${v}s later`",
  "{name:\"Trainers\",icon:\"\\u{1F45F}\",vis:6,v:[.8,1.2,1.6,2.2,2.8,3.6],perk:v=>`Warm-up: melting starts ${Math.round(v*10)/10}s later`"),
 ("{name:\"Knitted scarf\",vis:0,v:[.5,.8,1.1,1.5,2,2.5],perk:v=>`Warm: melting starts ${v}s later`",
  "{name:\"Knitted scarf\",vis:0,v:[1,1.6,2.2,3,4,5],perk:v=>`Warm: melting starts ${Math.round(v*10)/10}s later`"),
 ("{name:\"Frost crown\",icon:\"\\u{1F451}\",vis:13,v:[.97,.95,.93,.9,.87,.84]","{name:\"Frost crown\",icon:\"\\u{1F451}\",vis:13,v:[.94,.9,.86,.8,.74,.64]"),
 ("{name:\"Ice-pop nose\",icon:\"\\u{1F367}\",vis:3,v:[.97,.95,.93,.9,.87,.84]","{name:\"Ice-pop nose\",icon:\"\\u{1F367}\",vis:3,v:[.94,.9,.86,.8,.74,.64]"),
 # whole-number coin perks
 ("perk:v=>`Racer: +${v} coins per close call`,ap:(B,v)=>{B.closeCoins+=v}","perk:v=>`Racer: +${Math.round(v)} coins per close call`,ap:(B,v)=>{B.closeCoins+=Math.round(v)}"),
 ("perk:v=>`Daredevil: +${v} coins per close call`,ap:(B,v)=>{B.closeCoins+=v}","perk:v=>`Daredevil: +${Math.round(v)} coins per close call`,ap:(B,v)=>{B.closeCoins+=Math.round(v)}"),
 ("perk:v=>`Cool head: +${v} coins per close call`,ap:(B,v)=>{B.closeCoins+=v}","perk:v=>`Cool head: +${Math.round(v)} coins per close call`,ap:(B,v)=>{B.closeCoins+=Math.round(v)}"),
 ("perk:v=>`Collector: +${v} coins per wall smashed`,ap:(B,v)=>{B.wallCoins+=v}","perk:v=>`Collector: +${Math.round(v)} coins per wall smashed`,ap:(B,v)=>{B.wallCoins+=Math.round(v)}"),
 ("perk:v=>`Jolly: +${v} coins per wall smashed`,ap:(B,v)=>{B.wallCoins+=v}","perk:v=>`Jolly: +${Math.round(v)} coins per wall smashed`,ap:(B,v)=>{B.wallCoins+=Math.round(v)}"),
 # mechanics: wall size needed, ramp afterburner, golden snowflake rewards
 ("return t[r.zone].gateRadius*r.scale*i*zu(r.lap).twist.wall}","return t[r.zone].gateRadius*r.scale*i*zu(r.lap).twist.wall*(BS.wallNeed||1)}"),
 ("this.h<=0&&(this.h=0,this.vh=0,this.airborne=!1,this.landed=!0,","this.h<=0&&(this.rampFlight&&BS.rampBoost>0&&(this.rb=2),this.h=0,this.vh=0,this.airborne=!1,this.landed=!0,"),
 ("this.jumpCooldown>0&&(this.jumpCooldown-=t),","this.jumpCooldown>0&&(this.jumpCooldown-=t),this.rb>0&&(this.rb-=t),"),
 ("*(ENDL?EWK*EWB:DTW?1:WSPD(r.lap))}jump(","*(ENDL?EWK*EWB:DTW?1:WSPD(r.lap))*(this.rb>0?1+BS.rampBoost:1)}jump("),
 ("t<.4?(this.runCoins+=e.SECRET_GOLD_COINS,this.floatAtBall(`+${e.SECRET_GOLD_COINS} COINS!`,!0)","t<.4?(this.runCoins+=Math.round(e.SECRET_GOLD_COINS*BS.discK),this.floatAtBall(`+${Math.round(e.SECRET_GOLD_COINS*BS.discK)} COINS!`,!0)"),
 ("n.grow(n.r*1.1)","n.grow(n.r*(1+.1*BS.discK))"),
 # stats screen labels + (max)
 ('["gate","Wall size needed",1]','["gate","Growth from walls"],["wallNeed","Wall size needed",1],["discK","Golden snowflake rewards"]'),
 ('row(p,n,`${pc>0?"+":"−"}${Math.abs(pc)}%`,','row(p,n,`${pc>0?"+":"−"}${Math.abs(pc)}%${BS.capd&&BS.capd[k]?" (max)":""}`,'),
]
for x,y in R:
  assert s.count(x)==1,(x[:80],s.count(x));s=s.replace(x,y)

# ---- ramps: trigger matches the visible ramp (width incl. ball overlap, low hops, bigger balls, no frame skips)
for x,y,c in [("if(o===`ramp`){!t.airborne&&t.r<n.size*1.6&&Math.abs(l)<n.size&&c>-n.size*.3&&c<n.size*.9&&r.onRamp(n);continue}",
  "if(o===`ramp`){(!t.airborne||t.h<t.r*.35&&!t.rampFlight)&&t.r<n.size*2.2&&Math.abs(l)<n.size*1.15+t.r*.4&&c>-n.size*.45&&c<n.size*.95&&r.onRamp(n);continue}",1),
 ("onRamp(){this.state===`playing`&&this.ball.jump(","onRamp(){let B0=this.ball;B0.airborne&&!B0.rampFlight&&B0.h<B0.r*.35&&(B0.airborne=!1,B0.h=0,B0.vh=0);this.state===`playing`&&this.ball.jump(",1)]:
  assert s.count(x)==c,(x,s.count(x));s=s.replace(x,y)

# ---- softer backgrounds: smooth far peaks always, layered haze ridges, soft clouds (CB)
_i=s.find("let a=[];for(let e=0;e<9;e++){let t=-1.25+2.5*e/8");_j=s.find("this.backdrop.add(this.clouds);",_i)
assert _i>0 and _j>_i and s.count("let a=[];for(let e=0;e<9;e++){let t=-1.25+2.5*e/8")==1
s=s[:_i]+"""{let cv=document.createElement(`canvas`);cv.width=256,cv.height=128;let cx=cv.getContext(`2d`),pf=(x,y,r,a)=>{let g=cx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(255,255,255,${a})`),g.addColorStop(.6,`rgba(255,255,255,${a*.8})`),g.addColorStop(1,`rgba(255,255,255,0)`),cx.fillStyle=g,cx.beginPath(),cx.arc(x,y,r,0,7),cx.fill()};for(let[x,y,r,a]of[[72,82,44,.85],[118,64,56,.95],[168,76,48,.9],[140,92,40,.8],[96,96,38,.8],[204,92,30,.7],[44,98,28,.65],[150,52,34,.7]])pf(x,y,r,a);cx.globalCompositeOperation=`source-atop`;let sh=cx.createLinearGradient(0,34,0,128);sh.addColorStop(0,`rgba(255,255,255,0)`),sh.addColorStop(1,`rgba(165,180,200,.5)`),cx.fillStyle=sh,cx.fillRect(0,0,256,128);let tx=new _a(cv);tx.colorSpace=wt;let a=[];for(let e=0;e<9;e++){let t=-1.25+2.5*e/8+(uu(e,11)-.5)*.2,n=.2+uu(e,12)*.34,r=1.15,c=1+Math.floor(uu(e,14)*2);for(let k=0;k<c;k++){let w=.32+uu(e*7+k,15)*.34,tt=t+(k-(c-1)/2)*w*.55,l=new Oa(w,w*.5);uu(e*5+k,16)>.5&&l.scale(-1,1,1),l.rotateY(-tt),l.translate(Math.sin(tt)*r,n+(uu(e*5+k,17)-.5)*.04,-Math.cos(tt)*r),a.push(l)}}this.cloudMaterial=new Mi({map:tx,alphaToCoverage:!0,alphaTest:.02,fog:!1,depthTest:!1,depthWrite:!1,side:2});this.clouds=new Wi(pd(a,!1)??new bi,this.cloudMaterial),this.clouds.renderOrder=-3,this.clouds.frustumCulled=!1;let HZ=(R,b,top,amp,sd)=>{let N=180,P=[],C=[];for(let k=0;k<N;k++){let a0=-1.8+3.6*k/N,a1=-1.8+3.6*(k+1)/N,hf=q=>top+amp*(.55*Math.sin(q*5.3+sd)+.3*Math.sin(q*11.7+sd*2.1)+.15*Math.sin(q*23+sd*3.3)),q=(u,y)=>[Math.sin(u)*R,y,-Math.cos(u)*R],p0=q(a0,b),p1=q(a1,b),t0=q(a0,hf(a0)),t1=q(a1,hf(a1));P.push(...p0,...t0,...t1,...p0,...t1,...p1),C.push(0,1,1,0,1,0)}let g=new bi;g.setAttribute(`position`,new ai(new Float32Array(P),3)),g.setAttribute(`color`,new ai(new Float32Array(C.length*3).fill(1),3)),g.userData.fl=C;return g};this.hz=[[2.3,-.5,-.1,.1,1.3,-3.8],[1.85,-.5,-.19,.09,4.1,-3.6]].map(([R,b,tp,am,sd,ro])=>{let m=new Wi(HZ(R,b,tp,am,sd),new Mi({vertexColors:!0,fog:!1,depthTest:!1,depthWrite:!1,side:2}));m.renderOrder=ro,m.frustumCulled=!1,this.backdrop.add(m);return m})}"""+s[_j:]
for x,y,c in [("this.backdrops.forEach((e,t)=>e.visible=t===d.scenery.backdrop+(SETTINGS.smooth?`_s`:``)),","this.backdrops.forEach((e,t)=>e.visible=t===d.scenery.backdrop+`_s`),this.hz&&this.hz.forEach(m=>m.visible=!f&&!/city|blocks/.test(d.scenery.backdrop)),this.clouds.rotation.y=Math.sin(performance.now()*4e-5)*.06,",1),
 ("this.cloudMaterial.color.copy(bC).lerp(TC,.6);","this.cloudMaterial.color.copy(bC).lerp(TC,.75);this.hz&&this.hz.forEach((m,i)=>{let hc=m.material.color.copy(bC).lerp(yC,i?.3:.2).multiplyScalar(i?.78:.88),k=bC.getHex()+`|`+hc.getHex();if(m.userData.k===k)return;m.userData.k=k;let g=m.geometry,ca=g.getAttribute(`color`),fl=g.userData.fl,q=[bC.r/Math.max(.01,hc.r),bC.g/Math.max(.01,hc.g),bC.b/Math.max(.01,hc.b)].map(v=>Math.min(3,v));for(let j=0;j<fl.length;j++){let f=fl[j];for(let c=0;c<3;c++)ca.array[j*3+c]=f+(1-f)*q[c]}ca.needsUpdate=!0});",1)]:
  assert s.count(x)==c,(x[:60],s.count(x));s=s.replace(x,y)

# ---- daily text: win by reaching the end of the level
for x,y,c in [('this.toasts.push("Daily challenge: smash 2 walls to win!")','this.toasts.push("Daily challenge: reach the end of the level to win!")',1)]:
  assert s.count(x)==c,(x,s.count(x));s=s.replace(x,y)

# ---- new garden lineup: refund removed decorations once
for x,y,c in [("v.bd||(v.bd={});","v.bd||(v.bd={});if(!v.g2){v.g2=1;let c=0;for(let id of[`fire`,`seat`,`snowman`,`lamp`,`tree`,`sled`,`post`]){let o=v.own[id];if(o)for(let i of o)c+=IGC0[i]||0;delete v.own[id],delete v.use[id]}c&&(this.save.coins+=c,v.g2c=c,ZC(this.save))}if(!v.g3){v.g3=1;let c=0;for(let id of[`slide`,`gazebo`,`fort`]){let o=v.own[id];if(o)for(let i of o)c+=IGC0[i]||0;delete v.own[id],delete v.use[id]}c&&(this.save.coins+=c,v.g2c=(v.g2c||0)+c,ZC(this.save))}",1),
 ("this.igBuild(),this.igPetSync(1),this.igDaily(),this.igGiftPlace()","this.igBuild(),this.igPetSync(1),this.igDaily(),this.igGiftPlace(),(()=>{let v=this.igSave(),c=v.g2c;c&&(v.g2c=0,ZC(this.save),setTimeout(()=>this.igOn&&this.igMsg(`Your garden got a makeover! ${c.toLocaleString(`en-GB`)} coins back for the old decorations`),1500))})()",1)]:
  assert s.count(x)==c,(x[:60],s.count(x));s=s.replace(x,y)

# ---- smooth, higher-detail home furniture (GHD build flag)
for x,y,c in [("function R(e,t,n,r,i={}){return xd(new xa(e,t,n),r,i,t/2)}","var GHD=0;function R(e,t,n,r,i={}){return xd(new xa(e,t,n),r,i,t/2)}",1),
 ("function z(e,t,n,r,i={},a=6){return xd(new Ca(e,t,n,a,1),r,i,n/2)}","function z(e,t,n,r,i={},a=6){return xd(new Ca(e,t,n,GHD&&a>=5?Math.max(a,18):a,1),r,i,n/2)}",1),
 ("function B(e,t,n,r={},i=6){return xd(new wa(e,t,i,1),n,r,t/2)}","function B(e,t,n,r={},i=6){return xd(new wa(e,t,GHD&&i>=5?Math.max(i,18):i,1),n,r,t/2)}",1),
 ("function V(e,t,n={},r=0){return xd(new Ea(e,SETTINGS&&SETTINGS.smooth&&r<1?1:r),t,n,0)}","function V(e,t,n={},r=0){return xd(new Ea(e,GHD?Math.max(r,2):SETTINGS&&SETTINGS.smooth&&r<1?1:r),t,n,0)}",1),
 ("function U(e,t,n,r={},i=10,a=5){let o=new ja(e,t,a,i);","function U(e,t,n,r={},i=10,a=5){let o=new ja(e,t,GHD?Math.max(a,10):a,GHD&&i>=9?Math.max(i,28):i);",1),
 ("function G(e,t,n,r,i,a=6){return Dd(new Ca(t,e,Od(r,i),a,1),r,i,n)}","function G(e,t,n,r,i,a=6){return Dd(new Ca(t,e,Od(r,i),GHD&&a>=5?Math.max(a,12):a,1),r,i,n)}",1)]:
  assert s.count(x)==c,(x[:60],s.count(x));s=s.replace(x,y)

# ---- quieter music on the menu and in the home
for x,y,c in [("this.bus.gain.value=this.enabled?CS:0","this.bus.gain.value=this.enabled?CS*MKV:0",1),
  ("e?CS*(this.style?.level??1):0","e?CS*MKV*(this.style?.level??1):0",1),
  ("this.bus.gain.setTargetAtTime(CS*e.level,t,.1)","this.bus.gain.setTargetAtTime(CS*MKV*e.level,t,.1)",1),
  ("CS=e.MUSIC_VOLUME*e.MASTER_VOLUME,","CS=e.MUSIC_VOLUME*e.MASTER_VOLUME,MKV=1,",1),
  ("setUrgency(e){","setScene(k){MKV=k,this.ctx&&this.enabled&&this.bus.gain.setTargetAtTime(CS*k*(this.style?.level??1),this.ctx.currentTime,.4)}setUrgency(e){",1),
  ("this.xInit(),this.audio.setMuted(!this.save.sound),this.audio.setMusicOn(this.save.music),","this.xInit(),this.audio.setMuted(!this.save.sound),this.audio.setMusicOn(this.save.music),setInterval(()=>{let k=this.state===`title`||this.igOn?.45:1;k!==this._mk&&(this._mk=k,this.audio.music.setScene(k))},250),",1)]:
  assert s.count(x)==c,(x[:70],s.count(x));s=s.replace(x,y)

for x,y,c in [("this.contT=3,this.contG=EGAP","this.contT=3+(this.ipSum&&this.save.x&&this.save.x.ig?this.ipSum(`shd`):0),this.contG=EGAP",1)]:
  assert s.count(x)==c,(x[:70],s.count(x));s=s.replace(x,y)

for x,y,c in [("var BS={wallNeed","var HSP=null,BS={wallNeed",1),
  (",BS.capd={};for(let[k,c]of[[`coins`,1.35]",",typeof HSP==`function`&&HSP(BS),BS.capd={};for(let[k,c]of[[`coins`,1.35]",1),
  ("setInterval(()=>{let k=this.state===`title`","HSP=B=>{try{this.petBS(B)}catch(e){}},HS(this.save.gear.eq,BC(this.save.xp).level),setInterval(()=>{let k=this.state===`title`",1)]:
  assert s.count(x)==c,(x[:70],s.count(x));s=s.replace(x,y)

x="for(let k in M)for(let id of M[k].split(` `))for(let d of mS)d.id===id&&!d.special&&(d.anim=+k)})();"
assert s.count(x)==1;s=s.replace(x,x+open(D+'/anim_new.js').read())

for x,y,c in [("}else s.def.anim&&!s.scenery&&s.d-t<80*r&&(m=!0);","}else(s.def.anim||s.scenery&&s.def.motion)&&s.d-d<80*r&&(m=!0);",1),("let AN=e.scenery?0:e.def.anim,","let AN=e.def.anim||(e.scenery&&e.def.motion?1:0),",1)]:
  assert s.count(x)==c,(x[:70],s.count(x));s=s.replace(x,y)

for x,y,c in [("xDay(){return this.daily().today}",open(D+'/tourney.js').read()+"xDay(){return this.daily().today}",1),("this.endIsRec=D>P&&D>50}","this.endIsRec=D>P&&D>50,this.tnPre&&this.tnPre()}",1),("plMain(){this.igHomeSync&&this.igHomeSync();","plMain(){this.tnWire&&this.tnWire();this.igHomeSync&&this.igHomeSync();",1),(".stats-card,.lvlup-card,.ig-sheet,.tr-road,.lvx-grid`)",".stats-card,.lvlup-card,.ig-sheet,.tr-road,.lvx-grid,#tn`)",1),("render(){if(this.igOn){this.igRender();this.mhTick();return}this.budTick();this.mhTick();","render(){if(this.igOn){this.igRender();this.mhTick();this.tnTick&&this.tnTick();return}this.budTick();this.mhTick();this.tnTick&&this.tnTick();",1)]:
  assert s.count(x)==c,(x[:70],s.count(x));s=s.replace(x,y)

for x,y,c in [("xDay(){return this.daily().today}",open(D+'/casespin.js').read()+"xDay(){return this.daily().today}",1),
 ("this.lastChest=c.id,ZC(this.save),this.cratesOpened++,e.rarity>=3?this.audio.fanfare():this.audio.chime(),this.showShop(),","this.lastChest=c.id,ZC(this.save),this.cratesOpened++,this.showShop(),this.csCrate(c),",1),
 ("this.cratesOpened++,this.audio.fanfare(),this.showShop(),this.ui.setCoins(this.save.coins)}openCrate(){","this.cratesOpened++,this.showShop(),this.csCrate({gold:1}),this.ui.setCoins(this.save.coins)}openCrate(){",1),
 ("ZC(this.save),this.lastCrate=n,this.cratesOpened++,n.picture?this.audio.fanfare():this.audio.chime(),this.showShop(),","ZC(this.save),this.lastCrate=n,this.cratesOpened++,this.showShop(),this.csCrate(CHESTS.find(c=>c.id===`iron`)),",1),("freeChest(id){let c=CHESTS.find(e=>e.id===id);if(!c||c.classic)return null;","freeChest(id){let g=this.freeChest0(id);g&&this.csQueue&&this.csQueue(id,g);return g}freeChest0(id){let c=CHESTS.find(e=>e.id===id);if(!c||c.classic)return null;",1),("this.budTick();this.mhTick();this.tnTick&&this.tnTick();","this.budTick();this.mhTick();this.tnTick&&this.tnTick();this.csTick&&this.csTick();",1)]:
  assert s.count(x)==c,(x[:70],s.count(x));s=s.replace(x,y)

for x,y,c in [('"id": "wood", "name": "Wooden chest", "price": 400, "min": 0, "max": 2','"id": "wood", "b": 0.25, "name": "Wooden chest", "price": 500, "min": 0, "max": 1',1),
 ('"id": "iron", "name": "Iron chest", "price": 650','"id": "iron", "name": "Iron chest", "price": 800',1),('"desc": "Gear, coins or XP"','"desc": "Common to Rare gear, coins or XP"',1),('"desc": "Common or Uncommon gear, small chance of Rare"','"desc": "Common or Uncommon gear"',1),
 ('"id": "silver", "b": 1.3, "name": "Silver chest", "price": 1000','"id": "silver", "b": 0.5, "name": "Silver chest", "price": 1500',1),
 ('"id": "gold", "b": 1.5, "skin": [0.15, 0.04, 0.01], "name": "Gold chest", "price": 1500','"id": "gold", "b": 0.7, "skin": [0.035, 0.01, 0.005], "name": "Gold chest", "price": 3500',1),
 ('"id": "diamond", "b": 1.6, "fl": [0, 0, 0, 0, 0.06, 0.02], "skin": [0.15, 0.07, 0.03], "name": "Diamond chest", "price": 2200','"id": "diamond", "b": 0.75, "fl": [0, 0, 0, 0, 0.05, 0.025], "skin": [0.15, 0.07, 0.03], "name": "Diamond chest", "price": 8000',1),
 ('"id": "legend", "b": 1.8, "fl": [0, 0, 0, 0, 0.15, 0.05], "skin": [0.14, 0.1, 0.06], "name": "Legend chest", "price": 3200','"id": "legend", "b": 0.8, "fl": [0, 0, 0, 0, 0.08, 0.03], "skin": [0.14, 0.1, 0.06], "name": "Legend chest", "price": 6000',1),
 ("}else if(t.kind===`gear`){let e=this.giveGear(rollGear((this.save.reached??0)+1));","}else if(t.kind===`gear`){let e=this.giveGear(rollGear((this.save.reached??0)+1,0,2));",1),("$(`rank-title`).textContent=e.title","$(`rank-title`).textContent=(window.__snowball&&__snowball.game&&__snowball.game.pName?__snowball.game.pName():e.title)",1),('tx.append(nm,ds);','tx.append(nm,ds);{let GG=window.__snowball&&__snowball.game,O=GG&&GG.csOdds?GG.csOdds(c):null;if(O){let od=document.createElement("div");od.className="chest-odds",od.innerHTML=O.map(o=>`<span style="--g:${o[1]}"><i></i>${o[0]} ${o[2]}</span>`).join(""),tx.append(od)}}',1)]:
  assert s.count(x)==c,(x[:70],s.count(x));s=s.replace(x,y)

# --- missions & achievements rebalance + tournaments ---
_g0=s.index('n=[{id:`walls3`');_g1=s.index('text:`Roll 3,000 m in one run`}]',_g0)+len('text:`Roll 3,000 m in one run`}]')
assert s.count('n=[{id:`walls3`')==1
s=s[:_g0]+open(D+'/missions.js').read().strip()+s[_g1:]
_a0=s.index('var ACH=[{id:"wall1"');_a1=s.index('}];',_a0)+3
s=s[:_a0]+open(D+'/ach.js').read().strip()+s[_a1:]
for x,y,c in [
 ("mT=()=>({walls:0,streak:0,slams:0,absorb:0,secrets:0,freeze:0,time:0,worlds:0,grow:0,dist:0})","mT=()=>({walls:0,streak:0,slams:0,absorb:0,secrets:0,freeze:0,time:0,worlds:0,grow:0,dist:0,tnruns:0,tndist:0,tntop10:0,tntop3:0})",1),
 ("if(!e.some(e=>e.id===a.id)){","if(!e.some(e=>e.id===a.id)&&!(a.av&&(this.save.reached|0)<1)){",2),
 ("r=[30,40,50,60,80,100,150]","r=[60,80,100,130,160,200,300]",1),
 ("function MSC(d,m){if(!d)return d;","function MSC(d,m){if(!d)return d;if(d.nf){let f=m&&m.f||1;return f===1?d:{...d,reward:Math.max(5,Math.round(d.reward*f/5)*5)}}",1),
 ("k===`dist`?Math.min(run?5e3:1e5,","k===`dist`||k===`tndist`?Math.min(run?5e3:1e5,",1),
 ("Math.min(k===`walls`&&run?10:k===`streak`?6:","Math.min(k===`walls`&&run?7:k===`streak`?4:",1),
 ("k===`time`?Math.min(300,","k===`time`?Math.min(240,",1),
 (":k===`dist`?`Roll ${T.toLocaleString(`en-GB`)} m in ${run?`one run`:`total`}`",":k===`tnruns`?(T===1?`Play a tournament Avalanche Run`:`Play ${T} tournament Avalanche Runs`):k===`tndist`?`Add ${T.toLocaleString(`en-GB`)} m to your tournament total`:k===`dist`?`Roll ${T.toLocaleString(`en-GB`)} m in ${run?`one run`:`total`}`",1),
 ("this.payK()):0;this.checkMissions(),this.claimDaily();","this.payK()):0;this.tnPre&&this.tnPre(),this.checkMissions(),this.claimDaily();",1),
 ("this.addXp(75),t.push(`\\u{1F3C6} ${n.name}: ${r} · +75 XP`)","let X=n.gear?250:(n.coins||0)<=300?100:n.coins<=1000?200:n.coins<=3000?400:800;this.addXp(X),t.push(`\\u{1F3C6} ${n.name}: ${r} · +${X} XP`)",1),
 ('this.xMax("world",(this.save.reached??0)+1),','this.xMax("world",(this.save.reached??0)+1),this.save.x.tn&&this.save.x.tn.top&&this.xMax("tnleague",1+Math.max(this.save.x.tn.top[0]|0,this.save.x.tn.top[1]|0)),',1),
 ('f.textContent=r?"Done":e.gear?"Free gear":`${e.coins} coins`','f.textContent=r?"Done":e.gear?(CHESTS.find(c=>c.id===e.gear)?.name||"Free gear"):`${e.coins.toLocaleString("en-GB")} coins`',1),
 ("n.gear){let e=this.giveGear(rollGear((this.save.reached??0)+1));r=`${e.rname} ${e.name}`}","n.gear){let c=typeof n.gear==`string`&&this.freeChest?this.freeChest(n.gear):null;if(c)r=c.text||CHESTS.find(q=>q.id===n.gear).name;else{let e=this.giveGear(rollGear((this.save.reached??0)+1));r=`${e.rname} ${e.name}`}}",1),
 ("r=`+${n.coins} coins`","r=`+${n.coins.toLocaleString(`en-GB`)} coins`",1),
 ("e.km?`${pdist(i)} / ${pdist(e.n)}`:","e.km?`${pdist(i)} / ${pdist(e.n)}`:e.lg?`${this.tnL()[Math.max(0,i-1)].n} / ${this.tnL()[e.n-1].n}`:",1),
]:
  assert s.count(x)==c,(x[:60],s.count(x)); s=s.replace(x,y)

# --- daily challenge uses Avalanche Run speed ---
for x,y,c in [
 ("(ENDL?EWK*EWB:DTW?1:","(ENDL||DTW?EWK*EWB:",3),
 ("ENDL&&EWK<1.4&&(EWK=Math.min(1.4,EWK+.02),","(ENDL||DTW)&&EWK<(DTW&&DTW.speed>1?1.25:1.4)&&(EWK=Math.min(DTW&&DTW.speed>1?1.25:1.4,EWK+.02),",1),
 ("DTD(`Turbo`,`Everything is much faster`,{speed:1.2})","DTD(`Turbo`,`Everything is much faster`,{speed:1.12})",1),
]:
  assert s.count(x)==c,(x,s.count(x)); s=s.replace(x,y)

# --- pricier shop skins (p0 keeps the old price as the pattern seed so looks don't change) ---
_SKP={'bubblegum':600,'mint':900,'sunset':1200,'camo':1600,'cookie':2000,'tennis':2500,'polka':3000,'pumpkin':3600,'lime':4200,'ice':5000,'bee':6000,'peppermint':7000,'basketball':8000,'beach':9500,'football':11000,'melon':13000,'gold':16000,'rainbow':20000,'neongrid':25000}
_i=s.index('l=[{id:`snow`,name:`Snowball`');_j=s.index('}]',_i)
_seg=s[_i:_j]
import re as _re
def _f(m):
  k=m.group(1)
  if k not in _SKP: return m.group(0)
  return m.group(0).replace('price:'+m.group(2)+',','price:%d,p0:%s,'%(_SKP[k],m.group(2)))
_seg2,_n=_re.subn(r'\{id:`([a-z]+)`,name:`[^`]+`,price:([0-9.e]+),',_f,_seg)
assert _seg2.count('p0:')==len(_SKP),_seg2.count('p0:')
s=s[:_i]+_seg2+s[_j:]
_x="SKN(x,y,z,2.1,e.price*.001+1.7)"
assert s.count(_x)==1
s=s.replace(_x,"SKN(x,y,z,2.1,(e.p0??e.price)*.001+1.7)")
_x="skinRows(){let e=BC(this.save.xp).level;return l.map(t=>{"
assert s.count(_x)==1
s=s.replace(_x,"skinRows(){let e=BC(this.save.xp).level,K=t=>t.level?1:t.crate?2:0;return l.map((t,i)=>[t,i]).sort((a,b)=>K(a[0])-K(b[0])||(K(a[0])?a[1]-b[1]:a[0].price-b[0].price)).map(x=>x[0]).map(t=>{")

# --- chest-only skins label ---
assert s.count("t.crate?`Gold chest`:``")==1
s=s.replace("t.crate?`Gold chest`:``","t.crate?`Chest drops`:``")

# --- remove gear sets ---
for x,y,c in [
 ("B=>{B.coins*=1.25}]}];function gearSetCounts","B=>{B.coins*=1.25}]}];GEAR_SETS.length=0;function gearSetCounts",1),
 ("setShopTab(e){for(let t of pw)","setShopTab(e){e===`sets`&&(e=`upgrades`);for(let t of pw)",1),
 ("xCheckAch(){","xCheckAch(){this.save.x.ach.done=this.save.x.ach.done.filter(i=>ACH.some(a=>a.id===i));",1),
]:
  assert s.count(x)==c,(x,s.count(x)); s=s.replace(x,y)

# --- steering sensitivity setting removed (fixed at 100%) ---
for x,y,c in [
 ("SETTINGS.sens=e.sens,","SETTINGS.sens=1,",1),
 ('t("set-sens-v",t=>t.textContent=Math.round(e.sens*100)+"%"),','t("set-sens-v",t=>t.parentNode.style.display="none"),',1),
]:
  assert s.count(x)==c,(x,s.count(x)); s=s.replace(x,y)

# --- paid continue goes back to the last smashed wall ---
for x,y,c in [
 ("xDay(){return this.daily().today}",open(D+'/ck.js').read()+"xDay(){return this.daily().today}",1),
 ('let t=this.ball,n=this.endKind;if(n==="gate"){','let t=this.ball,n=this.endKind,CK=this.ckBack&&this.ckBack();if(!CK&&n==="gate"){',1),
 ('n==="shattered"&&(t.r=Math.max(t.r,this.stageStartR*.85,e.MIN_RADIUS*3))','!CK&&n==="shattered"&&(t.r=Math.max(t.r,this.stageStartR*.85,e.MIN_RADIUS*3))',1),
 ("o.r*=1+a.GATE_BONUS*BS.gate*o.aheadDamp(),","o.r*=1+a.GATE_BONUS*BS.gate*o.aheadDamp(),this.ckSet&&this.ckSet(n),",1),
 ("this.ball.syncTransform(),this.runStartR=this.shown(this.ball.r),","this.ball.syncTransform(),this.ck={d:this.ball.d,r:this.ball.r,dist:0},this.runStartR=this.shown(this.ball.r),",1),
 ("this.lastD=Xu(this.lastD),","this.lastD=Xu(this.lastD),this.ck&&(this.ck.d=Xu(this.ck.d),this.ck.r*=e),",1),
 ('document.getElementById("cont-sub").textContent=t==="gate"?`Bust through the ${this.stage.gateName} and keep going`:t==="buried"?"Dig out and outrun the avalanche":"Pull yourself back together and keep rolling"','document.getElementById("cont-sub").textContent=this.stats.walls>0?"Go back to just after the last wall you smashed":"Go back to the start of this world"',1),
]:
  assert s.count(x)==c,(x[:50],s.count(x)); s=s.replace(x,y)

# --- only 3 chests: Silver, Gold, Diamond ---
for x,y,c in [
 ("function lvSmall(L){return L<15?`wood`:L<30?`silver`:`gold`}function lvChest(L){return L<10?`silver`:L<20?`gold`:L<30?`diamond`:`legend`}","var CHK=[`silver`,`gold`,`diamond`],CHMAP={wood:`silver`,iron:`silver`,legend:`diamond`};function lvSmall(L){return L<30?`silver`:`gold`}function lvChest(L){return L<10?`silver`:L<20?`gold`:`diamond`}",1),
 ("let TI=[`wood`,`silver`,`gold`,`diamond`,`legend`]","let TI=[`silver`,`silver`,`gold`,`diamond`,`diamond`]",1),
 ("gear=rank<=(L<2?1:3)?[`wood`,`silver`,`gold`,`diamond`,`legend`]","gear=rank<=(L<2?1:3)?[`silver`,`silver`,`gold`,`diamond`,`diamond`]",1),
 ("freeChest(id){let g=","freeChest(id){id=CHMAP[id]||id;let g=",1),
 ('for(let c of CHESTS){let r=document.createElement("div");','for(let c of CHESTS){if(!CHK.includes(c.id))continue;let r=document.createElement("div");',1),
 ('lc=CHESTS.find(c=>c.id===(e.chest||"iron"))','lc=CHESTS.find(c=>c.id===(CHK.includes(e.chest)?e.chest:"silver"))',1),
 ('gear:"wood"','gear:"silver"',2),
]:
  assert s.count(x)==c,(x[:60],s.count(x)); s=s.replace(x,y)

# --- diamond chest skin chance 10% ---
assert s.count('"skin": [0.15, 0.07, 0.03], "name": "Diamond chest"')==1
s=s.replace('"skin": [0.15, 0.07, 0.03], "name": "Diamond chest"','"skin": [0.06, 0.028, 0.012], "name": "Diamond chest"')

# --- chest odds listed highest chance first ---
_x='od.innerHTML=O.map(o=>'
assert s.count(_x)==1
s=s.replace(_x,'od.innerHTML=O.slice().sort((a,b)=>parseFloat(b[2])-parseFloat(a[2])).map(o=>')

# --- crisp, smooth snow line on far peaks (per-pixel) ---
_x="this.peakMaterial=new Mi({vertexColors:!0,fog:!1,depthTest:!1,depthWrite:!1});"
assert s.count(_x)==1
s=s.replace(_x,_x+"this.peakMaterial.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace(`#include <common>`,`#include <common>\nattribute vec3 snowS;attribute float snowH;varying vec3 vSnowS;varying float vSnowH;`).replace(`#include <color_vertex>`,`#include <color_vertex>\nvSnowS=snowS;vSnowH=snowH;`),sh.fragmentShader=sh.fragmentShader.replace(`#include <common>`,`#include <common>\nvarying vec3 vSnowS;varying float vSnowH;`).replace(`#include <color_fragment>`,`#include <color_fragment>\n{float sw=max(fwidth(vSnowH)*.8,1e-6);diffuseColor.rgb=diffuse*mix(vColor.rgb,vSnowS,smoothstep(-sw,sw,vSnowH));}`)};")

# --- up to 2 paid revives in world levels (1 in the daily), 2nd costs double ---
for x,y,c in [
 ("this.runGear=[],this.continued=!1,","this.runGear=[],this.continued=!1,this.contN=0,",1),
 ("xEnd(){let t=this.endKind,n=100+50*ed(this.ball.d).lap;if(this.keepScores&&!this.endRun&&!this.autoplay&&!this.continued&&","xEnd(){let t=this.endKind,n=(100+50*ed(this.ball.d).lap)*((this.contN|0)>0?2:1);if(this.keepScores&&!this.endRun&&!this.autoplay&&(this.contN|0)<(this.dailyRun||DTW?1:2)&&",1),
 ("this.ui.setCoins(this.save.coins),this.continued=!0;let t=this.ball","this.ui.setCoins(this.save.coins),this.continued=!0,this.contN=(this.contN|0)+1;let t=this.ball",1),
 ('document.getElementById("cont-sub").textContent=this.stats.walls>0?','document.getElementById("cont-sub").textContent=((this.contN|0)>0?"Last revive! ":"")+(this.stats.walls>0?',1),
 ('"Go back to just after the last wall you smashed":"Go back to the start of this world"','"Go back to just after the last wall you smashed":"Go back to the start of this world")',1),
]:
  assert s.count(x)==c,(x[:60],s.count(x)); s=s.replace(x,y)

# --- no gear drops during runs (gear comes from chests/rewards); drop perks become XP ---
for x,y,c in [
 ("(this.runGear||[]).length<4&&Math.random()<.12*BS.drop*this.ldK(`drop`)&&this.gearFind();","",1),
 ('this.runCoins+=100;let r=this.giveGear(rollGear(GQ(this,n)));this.xStat("boss",1),this.toasts.push("\\u{1F451} Boss wall smashed! +100 coins + gear"),this.runExtras.push(`\\u{1F451} Boss wall: +100 coins & ${r.rname} ${r.name}`)','this.xStat("boss",1)',1),
 ("if(t===5||t===10||t===15){let r=this.giveGear(rollGear(GQ(this,n)));this.toasts.push(`\\u{1F525} ${t}-wall streak! Gear: ${r.name}`),this.runExtras.push(`\\u{1F525} ${t}-wall streak: ${r.rname} ${r.name}`)}","",1),
 ("(Math.random()<e/150*BS.drop*this.ldK(`drop`)||this.save.gearDryT>=300)&&this.gearFind()}gearFind(){","}gearFind(){",1),
 ("mixed \\u00b7 coins and gear as you roll`","mixed \\u00b7 earn coins as you roll`",1),
 ("Earn coins and gear as you roll &ndash;","Earn coins as you roll &ndash;",1),
 ("earn coins and gear as you roll</span>","earn coins as you roll</span>",1),
 ("let GX=W=>{","let GX=W=>``,GX0=W=>{",1),
 ("perk:`Find gear 10% more often`,k:`drop`,v:.1","perk:`+10% XP from every run`,k:`xp`,v:.1",1),
 ("`Find gear ${p}% more often`,`+${p}% coins from Avalanche Run`][i]","`+${p}% XP from every run`,`+${p}% coins from Avalanche Run`][i]",1),
 ("`+${p}% gear finds`,`+${p}% Avalanche coins`][i]","`+${p}% XP`,`+${p}% Avalanche coins`][i]",1),
 ("`Find gear 4–16% more often`","`+4–16% XP from every run`",1),
 ("k:`drop`,v:[0,3,6,9],t:p=>`Find gear ${p}% more often`,c:p=>`+${p}% gear finds`","k:`xp`,v:[0,3,6,9],t:p=>`+${p}% XP from every run`,c:p=>`+${p}% XP`",1),
 ("fox:[`drop`,5,`Find gear 5% more often`,`+5% gear finds`]","fox:[`xp`,5,`+5% XP from every run`,`+5% XP`]",1),
]:
  assert s.count(x)==c,(x[:70],s.count(x)); s=s.replace(x,y)
_a=s.index('r.append(n("div","gear-odds-title",');_b=s.index('Uncommon and better items have their own ★ perk.`))',_a)+len('Uncommon and better items have their own ★ perk.`))')
s=s[:_a]+'r.append(n("div","gear-tip",`Get gear from chests in the Shop and from rewards. Chests roll for your furthest world (World ${e.best}), so later worlds give better gear. Uncommon and better items have their own ★ perk.`))'+s[_b:]

# --- lower gear wear levels; drop misleading rarity "unlocks" from world cards ---
for x,y,c in [
 ("var GEAR_REQ=[1,1,5,10,20,30];","var GEAR_REQ=[1,1,3,7,14,22];",1),
 ("if(W>1){let A=gearOdds(W),Bq=gearOdds(W-1);A.forEach((v,k)=>v>0&&!(Bq[k]>0)&&u.push(`<em style=\"color:${GEAR_RARITY[k].color}\">●</em> ${GEAR_RARITY[k].name} gear`))}","",1),
]:
  assert s.count(x)==c,(x[:60],s.count(x)); s=s.replace(x,y)

# --- world stars, world skins, big chest every 5 worlds ---
_i=s.index('l=[{id:`snow`,name:`Snowball`');_j=s.index('}]',_i)+1
s=s[:_j]+open(D+'/wskins.txt').read().strip()+s[_j:]
for x,y,c in [
 ("xDay(){return this.daily().today}",open(D+'/stars.js').read()+"xDay(){return this.daily().today}",1),
 ("this.wDone=1,this.flushHeld(),this.wPay=B,","this.wDone=1,this.flushHeld(),this.wPay=B,this.wClear&&this.wClear(t,F),",1),
 ("c=n.def.zone>=t.length-1;if(i){","c=n.def.zone>=t.length-1;i&&c&&(this._bq=wkg(this.shown(o.r))/Math.max(1e-9,wkg(this.shown(n.need||o.r))));if(i){",1),
 ("this.runGear=[],this.continued=!1,this.contN=0,","this.runGear=[],this.continued=!1,this.contN=0,this._bq=0,",1),
 ("K=t=>t.level?1:t.crate?2:0","K=t=>t.level?1:t.world||t.hall?2:t.crate?3:0",1),
 ("t.level?`Level ${t.level}`:t.crate?`Chest drops`:``","t.level?`Level ${t.level}`:t.world?`Beat World ${t.world}`:t.hall?`Grand Prize`:t.crate?`Chest drops`:``",1),
 ("affordable:n||!t.level&&!t.crate&&","affordable:n||!t.level&&!t.crate&&!t.world&&!t.hall&&",1),
 ("(!t.crate||this.save.skins.includes(e))","(!t.crate&&!t.world&&!t.hall||this.save.skins.includes(e))",1),
 ("bt?`Completed ✓`","bt?`Completed ${this.wsStars(i)}`",1),
 ("u.push(`${wu[i].name} room`);","u.push(`${wu[i].name} room`);{let sk=l.find(k=>k.world===W);sk&&u.push(`${sk.name} skin`);W%5===0&&u.push(W<=15?`Gold chest`:`Diamond chest`)}",1),
 ("card({ex:UX(i)+GX(W),","card({ex:UX(i)+GX(W)+this.wsCard(i,bt),",1),
 ('worlds completed</span><span class="mp-bar"><i style="width:${Math.round(100*done/Eu)}%"></i></span>`','worlds completed</span><span class="mp-bar"><i style="width:${Math.round(100*done/Eu)}%"></i></span>`+(()=>{let w=this.wsS(),T=this.wsTot(),nx=((w.paid|0)+1)*10;return`<span class="mp-stars">⭐ ${T} / ${Eu*3} stars <small>· ${nx<=Eu*3?`free chest at ${nx}`:`all star chests collected`}</small></span>`})()',1),
 ("plMain(){this.tnWire&&this.tnWire();","plMain(){this.tnWire&&this.tnWire();this.wsS&&this.wsS();",1),
]:
  assert s.count(x)==c,(x[:60],s.count(x)); s=s.replace(x,y)

# --- world completion coins scale with stars: 3 stars = full + 20% ---
for x,y,c in [
 ("B=Math.round(150*W*(F?1:.25));","B=Math.round(150*W*(F?1:.25)*[1.2,.85,.7][Math.min(2,this.contN|0)]);",1),
 ("rw:lk?null:f(bt?Math.round(150*W*.25):150*W),","rw:lk?null:f(Math.round((bt?150*W*.25:150*W)*1.2)),",1),
]:
  assert s.count(x)==c,(x[:60],s.count(x)); s=s.replace(x,y)

# --- last tutorial hint 1s shorter ---
assert s.count("n===4&&this.tutT>3&&this.tutOk()")==1
s=s.replace("n===4&&this.tutT>3&&this.tutOk()","n===4&&this.tutT>2&&this.tutOk()")

# --- mission slots unlock every 5 levels; later slots refresh slower but pay more; Next world button ---
for x,y,c in [
 ("dealMissions(){let e=this.save.missions,t=n.length-7,r=!1;for(;e.length<5;){","mSlots(){return Math.min(5,1+Math.floor(BC(this.save.xp).level/5))}dealMissions(){let e=this.save.missions,t=n.length-7,r=!1,SL=this.mSlots();e.length>SL&&(e.length=SL,r=!0);e.forEach((m,i)=>m.k=MK[i]);for(;e.length<SL;){",1),
 ("e.push({id:a.id,progress:0,done:!1,f:MF(BC(this.save.xp).level)})","e.push({id:a.id,progress:0,done:!1,f:MF(BC(this.save.xp).level),k:MK[e.length]})",1),
 ("e[i]={id:a.id,progress:0,done:!1,f:MF(BC(this.save.xp).level)}","e[i]={id:a.id,progress:0,done:!1,f:MF(BC(this.save.xp).level),k:MK[i]}",1),
 ("(i>2?MLOCK2:MLOCK)","MLK(i)",1),
 ("(this.save.missions.indexOf(e)>2?MLOCK2:MLOCK)","MLK(this.save.missions.indexOf(e))",1),
 ("function MSC(d,m){","var MK=[1,1.25,1.5,1.75,2],MLK=i=>[15,30,45,60,90][Math.max(0,Math.min(4,i))]*6e4;function MSC(d,m){let r=MSC0(d,m),k=m&&m.k||1;return!r||k===1?r:{...r,reward:Math.round(r.reward*k/5)*5}}function MSC0(d,m){",1),
 ("return t}bookFound(){","{let SL=this.mSlots();SL<5&&t.push({lv:1,text:`Another mission unlocks at level ${SL*5}`})}return t}bookFound(){",1),
 ("for(let n of e){if(n.until&&n.until>Date.now()){","for(let n of e){if(n.lv){let L=document.createElement(`div`);L.className=`mission locked`,L.innerHTML=`${CI(`lock`)}<span class=\"what\">${n.text}</span>`,t.appendChild(L);continue}if(n.until&&n.until>Date.now()){",1),
 ("this.ui.onRestart=()=>this.start(),","this.ui.onRestart=()=>{this._nextW&&(this.startLap=this._nextW),this._nextW=0,this.start()},",1),
 ("this.ui.showEnd({...c,gear:","this.nwSet&&this.nwSet(),this.ui.showEnd({...c,gear:",1),
 ("xDay(){return this.daily().today}","nwSet(){let n=this.startLap+1,ok=this.endKind===`complete`&&!ENDL&&!this.dailyRun&&n<Eu&&n<=(this.save.reached|0);this._nextW=ok?n:0;let b=document.getElementById(`again-btn`);b&&(b.textContent=ok?`Next world ›`:`Roll again`)}xDay(){return this.daily().today}",1),
]:
  assert s.count(x)==c,(x[:60],s.count(x)); s=s.replace(x,y)

# --- Avalanche Run end screen: big blue line shows distance, no grey "Rolled" line ---
_x="$(`end-distance`).textContent=`Rolled ${e.distance}`,$(`end-unit`).textContent=e.unit;"
assert s.count(_x)==1
s=s.replace(_x,_x+"{let L=$(`end-size`).previousElementSibling,D=$(`end-distance`),m=ENDL&&String(e.distance).match(/^([\\d,.]+)\\s*(k?m)/);L&&(L.textContent=m?`Rolled:`:`Size:`),m&&($(`end-size`).textContent=m[1],$(`end-unit`).textContent=m[2]),D.style.display=m?`none`:``,$(`end-title`).style.display=m?`none`:``}")

# --- slower early levels (x1.5 at the start, easing back to normal by level 15) ---
for x,y,c in [
 ("zC=e=>e<=4?Math.round(zC4(e)*[.6,.7,.8,.9][e-1]/10)*10:zC4(e),","zC=e=>Math.round(zC4(e)*Math.max(1,1.5-Math.max(0,e-5)*.05)/10)*10,",1),
 ("UC=e=>Math.max(50,Math.round(zC(e-1)/50)*5)","UC=e=>Math.max(50,Math.round(zC4(e-1)/50)*5)",1),
]:
  assert s.count(x)==c,(x[:60],s.count(x)); s=s.replace(x,y)

# --- no random twists (low gravity etc.) in Avalanche Run ---
_x="twist:i<w.length?w[i]:w[Fu(w.length,i,47)]};"
assert s.count(_x)==1
s=s.replace(_x,"twist:E_&&!DTW?C:i<w.length?w[i]:w[Fu(w.length,i,47)]};")

# --- one paid revive in Avalanche Run ---
for x,y,c in [
 ("if(this.keepScores&&!this.endRun&&!this.autoplay&&(this.contN|0)<(this.dailyRun||DTW?1:2)&&","if(this.keepScores&&!this.autoplay&&(this.contN|0)<(this.endRun||this.dailyRun||DTW?1:2)&&",1),
 ('"Go back to just after the last wall you smashed":"Go back to the start of this world")','"Go back to just after the last wall you smashed":this.endRun?"Go back to the start of the run":"Go back to the start of this world")',1),
]:
  assert s.count(x)==c,(x[:60],s.count(x)); s=s.replace(x,y)

# --- Avalanche Run revive cost grows with distance ---
_x="xEnd(){let t=this.endKind,n=(100+50*ed(this.ball.d).lap)*((this.contN|0)>0?2:1);"
assert s.count(_x)==1
s=s.replace(_x,"xEnd(){let t=this.endKind,n=this.endRun?100+Math.round(Math.max(0,this.distance)*.04)*10:(100+50*ed(this.ball.d).lap)*((this.contN|0)>0?2:1);")

# ---- cosmetics: trails, smash effects, name styles + gear perk re-roll
for x,y,c in [('function HS(e,t=1){',open(D+'/cosm.js').read()+'\nfunction HS(e,t=1){',1),
 ("xDay(){return this.daily().today}",open(D+'/cosm_m.js').read()+"xDay(){return this.daily().today}",1),
 ('r.r>0&&a.ap(BS,a.v[r.r])','r.r>0&&(PK=>PK.ap(BS,PK.v[r.r]))(i.kinds[(RRP||{})[`${n}:${r.k}:${r.r}`]]||a)',1),
 ('perk:r>0?K.perk(K.v[r]):``','perk:r>0?(PK=>PK.perk(PK.v[r]))(G.kinds[(RRP||{})[`${t}:${k}:${r}`]]||K):``,rrd:(RRP||{})[`${t}:${k}:${r}`]!=null',1),
 ('n("div","gear-perk",r.worn.perk?"★ "+r.worn.perk:"No ★ perk on Common gear"))','(()=>{let q=n("div","gear-perk",r.worn.perk?"★ "+r.worn.perk:"No ★ perk on Common gear");this.rrFlash===`${r.slot}:${r.worn.k}:${r.worn.rarity}`&&(q.classList.add("rr-new"),this.rrFlash=null);return q})()),r.worn.rarity>0&&mode==="equip"&&t.append((()=>{let G=window.__snowball&&__snowball.game,c=G?G.rrCost(r.worn.rarity):0,b=bt("gear-rr","","rr",r.slot,r.worn);b.innerHTML=`🎲 New perk <span class="rr-c"><i></i>${fm(c)}</span>`;b.disabled=!G||G.save.coins<c;return b})())',1),
 ('Uncommon and better items have their own ★ perk.','Uncommon and better items have their own ★ perk. Tap 🎲 New perk on worn gear to swap it for a random different one.',1),
 ('gearAction(e,t,k,n){let r=this.save.gear;','gearAction(e,t,k,n){if(e==="rr")return this.rrDo(t,k,n);let r=this.save.gear;',1),
 ('this.ball.setGear(this.save.gear.eq),this.xInit(),','this.ball.setGear(this.save.gear.eq),this.xInit(),this.stApply(),',1),
 ('<div class="tn-row${r.me?` me`:``}','<div class="tn-row${r.me?` me`+this.nsRow():``}',1),
 ('${r.me?`${this.pName()}<em class="tn-you">YOU</em>`:r.n}','${r.me?`<b class="ns-t${this.nsT()}">${this.pName()}</b><em class="tn-you">YOU</em>`:r.n}',1),
 ('pw=[`crates`,`boosts`,`upgrades`,`sets`,`skins`]','pw=[`crates`,`boosts`,`upgrades`,`sets`,`skins`,`trails`,`smash`,`names`]',1),
 ('this.skinList.hidden=e!==`skins`}','this.skinList.hidden=e!==`skins`,$(`style-list`).hidden=![`trails`,`smash`,`names`].includes(e),[`trails`,`smash`,`names`].includes(e)&&window.__snowball&&__snowball.game.stFill(e)}',1),
 
 ('this.updateTrail(t)}','this.updateTrail(t),TRLF(this,e,t)}',1),
 ('n.copyWithin(0,6)','(n.copyWithin(0,6),TRSH())',3),
 ('reset(){this.life.fill(0),this.mesh.instanceMatrix.array.fill(0)','reset(){CF.clear(),this.life.fill(0),this.mesh.instanceMatrix.array.fill(0)',1),
 ('this.world.remove(r),this.stats.walls++','SMF(this.effects,o.x,dd(n.d)+n.size,-n.d,n.size,o.r,o.speed),this.world.remove(r),this.stats.walls++',1)]:
  assert s.count(x)==c,(x[:60],s.count(x));s=s.replace(x,y)

# ---- small-looking models: scale geometry up so look matches absorb size
for x,y,c in [('function HS(e,t=1){',open(D+'/vsg.js').read()+'\nfunction HS(e,t=1){',1),
 ('makePool(e){let t=e.build();','makePool(e){let t=VSG(e);',1),
 ('HBM(i.build()))','HBM(VSG(i)))',1)]:
  assert s.count(x)==c,(x[:60],s.count(x));s=s.replace(x,y)

# ---- distance chest: Avalanche distance fills a Diamond chest on the main menu (replaces first-time distance chests)
for x,y,c in [('function HS(e,t=1){',open(D+'/dchest_g.js').read()+'\nfunction HS(e,t=1){',1),
 ("xDay(){return this.daily().today}",open(D+'/dchest.js').read()+"xDay(){return this.daily().today}",1),
 ('if(mi>(x.endMs||0)){','if(0&&mi>(x.endMs||0)){',1),
 ('ch=this.keepScores&&ML[mi]===km','ch=0',1),
 ('this.tally.dist=D;','this.tally.dist=D;this.dMax=Math.max(this.dMax||0,D);',1),
 ('this.endRun=!!this._endArm,','this.endRun=!!this._endArm,this.dMax=0,',1),
 ('this.budTick();this.mhTick();this.tnTick&&this.tnTick();','this.budTick();this.mhTick();this.tnTick&&this.tnTick();this.dcTick&&this.dcTick();',1),
 ('endRecord(){if(!this.keepScores)return;','endRecord(){if(!this.keepScores)return;this.endRun&&!this.dailyRun&&this.dcAdd(Math.max(this.dMax||0,this.distance));',1)]:
  assert s.count(x)==c,(x[:60],s.count(x));s=s.replace(x,y)

# ---- release cached object templates not used for a few runs (memory)
for x,y,c in [('function HS(e,t=1){',open(D+'/prune.js').read()+'\nfunction HS(e,t=1){',1),
 ('poolOf(e){return this.pools.get(e.id)??this.makePool(e)}','poolOf(e){let p=this.pools.get(e.id)??this.makePool(e);p.lr=this.runN|0;return p}',1),
 ('this.pools.set(e.id,n),this.poolList.push(n)','n.did=e.id,n.lr=this.runN|0,this.pools.set(e.id,n),this.poolList.push(n)',1),
 ('reset(n,r=0){for(let e of this.poolList)e.reset();','reset(n,r=0){for(let e of this.poolList)e.reset();this.runN=(this.runN|0)+1,PRN(this);',1)]:
  assert s.count(x)==c,(x[:60],s.count(x));s=s.replace(x,y)

# ---- audit fixes
for x,y,c in [(r'this.toasts.push("\u{1F451} Boss wall ahead: big reward!")',r'this.toasts.push("\u{1F451} Boss wall ahead!")',1)]:
  assert s.count(x)==c,(x[:60],s.count(x));s=s.replace(x,y)

# ---- harder worlds: survive at least one hit (avalanche eases to World-10 pace briefly after a hit)
for x,y,c in [('function HS(e,t=1){',open(D+'/hitk.js').read()+'\nfunction HS(e,t=1){',1),
 ('this.avalancheOn=!1,this.avWorldT=0,','this.avalancheOn=!1,this.avWorldT=0,this.hitAt=-99,',1),
 ('hurt(t,n){let r=this.ball;this.stats.hits++,','hurt(t,n){let r=this.ball;this.hitAt=this.stats.time,this.stats.hits++,',1),
 ('*(ENDL?1+(EWB-1)*.4:DTW?1:WAVF(ed(a.d).lap))*','*(ENDL?1+(EWB-1)*.4:DTW?1:WAVF(ed(a.d).lap)*HITK(this,ed(a.d).lap))*',1)]:
  assert s.count(x)==c,(x[:60],s.count(x));s=s.replace(x,y)

# ---- distances: exact metres everywhere so numbers always agree
for x,y,c in [('function pdist(m){return m<1e3?`${Math.round(m/(m<100?1:10))*(m<100?1:10)} m`:`${(Math.round(m/10)*10).toLocaleString(`en-GB`)} m`}','function pdist(m){return`${Math.round(m).toLocaleString(`en-GB`)} m`}',1)]:
  assert s.count(x)==c,(x[:60],s.count(x));s=s.replace(x,y)
# ---- silent-switch fix (iOS): play sound even when the phone is on silent
_i=s.index('silentMode(){');_j=s.index('}start(){this.silentMode();')
assert s.count('silentMode(){')==1 and s.count('}start(){this.silentMode();')==1
s=s[:_i]+'silentMode(){this.want=1;SMSess();if(!this.keep){let a=this.keep=document.createElement(`audio`);a.src=`data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjYwLjE2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAYAAAKggAbGxsbJSUlJS8vLy85OTk5QkJCQkxMTExWVlZWVmBgYGBqampqdHR0dH5+fn6IiIiIkpKSkpKcnJycpqamprCwsLC6urq6xMTExM7Ozs7O2NjY2OLi4uLs7Ozs9vb29v////8AAAAATGF2YzYwLjMxAAAAAAAAAAAAAAAAJAJkAAAAAAAACoLz2DamAAAAAAD/+xDEAAPAAAGkAAAAIAAANIAAAARMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVf/7EsQpg8AAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVf/7EMRTg8AAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBV//sSxH0DwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBV//sQxKcDwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFX/+xLE0IPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFX/+xDE1gPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVf/7EsTVg8AAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVf/7EMTWA8AAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBV//sSxNWDwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBV//sQxNYDwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFX/+xLE1YPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFX/+xDE1gPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVf/7EsTVg8AAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMuMTAwVf/7EMTWA8AAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBV//sSxNWDwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBV//sQxNYDwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFX/+xLE1YPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjEwMFX/+xDE1gPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EsTVg8AAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EMTWA8AAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sSxNWDwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQxNYDwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xLE1YPAAAGkAAAAIAAANIAAAARVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=`,a.loop=!0,a.volume=1,a.setAttribute(`playsinline`,``),a.setAttribute(`webkit-playsinline`,``),a.setAttribute(`x-webkit-airplay`,`deny`),a.disableRemotePlayback=!0,a.preload=`auto`;let g=()=>{if(document.hidden||!this.want)return;let c=this.ctx;c&&c.state!==`running`&&c.state!==`closed`&&c.resume().catch(()=>{});this.keep.paused&&SMPlay(this.keep)};for(let v of[`touchend`,`click`,`keydown`,`pointerup`])document.addEventListener(v,g,{capture:!0,passive:!0})}this.keep.paused&&SMPlay(this.keep)'+s[_j:]
for x,y,c in [
 ('suspend(){this.ctx&&this.ctx.state===`running`&&this.ctx.suspend(),this.keep&&this.keep.pause()}','suspend(){this.want=0,this.ctx&&this.ctx.state===`running`&&this.ctx.suspend(),this.keep&&this.keep.pause()}',1),
 ('function HS(e,t=1){','function SMSess(){try{let A=navigator.audioSession;A&&A.type!==`playback`&&(A.type=`playback`)}catch{}}function SMPlay(a){try{let p=a.play();p&&p.catch&&p.catch(()=>{})}catch{}}SMSess();function HS(e,t=1){',1),
]:
    assert s.count(x)==c,(x[:60],s.count(x)); s=s.replace(x,y)
# ---- home controls: ball goes exactly where the stick points (no self-steering), no stuck stick
for x,y,c in [
 ('else{Math.abs(jx)>.1&&(g.cy+=jx*1.9*dt);let fw=-jy;fw<0&&(fw*=.75);let fx=Math.sin(g.cy),fz=-Math.cos(g.cy);tx=(-fz*jx+fx*fw)*3.1,tz=(fx*jx+fz*fw)*3.1}',
  'else{let jm=Math.hypot(jx,jy);jm<.15?(jx=jy=0):(jx*=(jm-.15)/.85/jm,jy*=(jm-.15)/.85/jm);Math.abs(jx)>.1&&(g.cy+=jx*1.9*dt);let fw=-jy;fw<0&&(fw*=.75);let fx=Math.sin(g.cy),fz=-Math.cos(g.cy);tx=(-fz*jx+fx*fw)*3.1,tz=(fx*jx+fz*fw)*3.1}',1),
 ('if(g.auto>0)g.auto-=dt,jx=0,','if(g.auto>0)g.auto-=dt,g.cyL=null,jx=0,',1),
 ('g.hd=g.cy,g.vx=g.vz=0,g.sp=0,g.auto=0,g.idle=0,g.snap=1,g.sel=-1,g.dk=0;','g.hd=g.cy,g.cyL=null,g.vx=g.vz=0,g.sp=0,g.auto=0,g.idle=0,g.snap=1,g.sel=-1,g.dk=0;',1),
 ('pad.addEventListener(`pointerup`,end),pad.addEventListener(`pointercancel`,end);',
  'pad.addEventListener(`pointerup`,end),pad.addEventListener(`pointercancel`,end),pad.addEventListener(`lostpointercapture`,end),window.addEventListener(`pointerup`,end,!0),window.addEventListener(`pointercancel`,end,!0);{let off=()=>{g.jp=null,g.joy=[0,0],g.keys={},g.cyL=null,joy.classList.remove(`on`)};window.addEventListener(`blur`,off),document.addEventListener(`visibilitychange`,()=>document.hidden&&off()),window.addEventListener(`touchend`,e=>{e.touches&&e.touches.length===0&&g.jp&&off()},!0)}',1),
]:
    assert s.count(x)==c,(x[:60],s.count(x)); s=s.replace(x,y)
open(D+'/game.js','w').write(s)
r=subprocess.run(['node','--check',D+'/game.js'],capture_output=True,text=True)
print('syntax ok' if r.returncode==0 else r.stderr[-1500:])
h=open(D+'/index.html').read()
a4='<section id="settings" class="screen hidden">'
assert h.count(a4)==1
h=h.replace(a4,'<section id="lvx" class="hidden"><div class="lvx-bg"></div><div class="lvx-rays"></div><div id="lvx-conf" class="lvx-conf"></div><div class="lvx-in"><div class="lvx-top"><span>LEVEL UP!</span></div><div id="lvx-badge" class="lvx-badge"></div><div id="lvx-title" class="lvx-title"></div><div class="lvx-xp"><i id="lvx-xpf"></i><span id="lvx-xpt"></span></div><div class="lvx-rw">REWARDS</div><div id="lvx-grid" class="lvx-grid"></div><div id="lvx-luck" class="lvx-luck"></div><div id="lvx-next" class="lvx-next"></div><button id="lvx-ok" class="lvx-ok" type="button">Collect!</button></div></section>'+a4)
h=h.replace('</head>','<style>'+'#lvx{position:absolute;inset:0;z-index:1000;pointer-events:auto;display:flex;align-items:center;justify-content:center;overflow:hidden;color:#fff}#lvx.hidden{display:none}.lvx-bg{position:absolute;inset:0;background:radial-gradient(circle at 50% 32%,#3a78d8 0%,#1b3f86 40%,#0b1a3a 85%)}.lvx-rays{position:absolute;left:50%;top:27%;width:900px;height:900px;margin:-450px 0 0 -450px;background:repeating-conic-gradient(from 0deg,#ffe06655 0deg 8deg,#0000 8deg 20deg);-webkit-mask:radial-gradient(#000 8%,#0000 60%);mask:radial-gradient(#000 8%,#0000 60%);animation:lvxspin 14s linear infinite;opacity:0}#lvx.on .lvx-rays{animation:lvxspin 14s linear infinite,lvxfade .6s .2s forwards}.lvx-conf{position:absolute;inset:0;pointer-events:none}.lvx-conf i{position:absolute;top:-20px;width:9px;height:14px;border-radius:2px;opacity:0}#lvx.on .lvx-conf i{animation-name:lvxfall;animation-timing-function:linear;animation-fill-mode:forwards}.lvx-in{position:relative;width:min(360px,92vw);max-height:96%;display:flex;flex-direction:column;align-items:center;gap:9px;padding:calc(env(safe-area-inset-top,0px) + 6px) 4px calc(env(safe-area-inset-bottom,0px) + 6px)}.lvx-top span{display:inline-block;font-size:34px;font-weight:900;letter-spacing:2px;color:#fff;padding:6px 22px;border-radius:18px;background:linear-gradient(#ffd84a,#ff8a1a);box-shadow:0 5px 0 #b85a00,0 10px 24px #0007;text-shadow:0 2px 0 #b85a00;transform:rotate(-3deg)}#lvx.on .lvx-top span{animation:lvxdrop .6s cubic-bezier(.2,1.5,.4,1) both,lvlwob 1.8s .8s ease-in-out infinite}.lvx-badge{margin:34px 0 18px;transform:scale(1.75);filter:drop-shadow(0 0 18px #ffe066cc)}#lvx.on .lvx-badge{animation:lvxpop .7s .15s cubic-bezier(.2,1.6,.4,1) both}.lvx-badge.bump .lvb{animation:lvxbump .25s ease}.lvx-title{margin-top:6px;font-size:20px;font-weight:900;color:#ffe066;text-shadow:0 2px 0 #0007}.lvx-xp{position:relative;width:86%;height:20px;border-radius:10px;background:#0008;box-shadow:inset 0 0 0 1.5px #ffffff26;overflow:hidden}#lvx-xpf{display:block;height:100%;width:0;border-radius:10px;background:linear-gradient(#7dd8ff,#3c8cff)}#lvx-xpt{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:900;text-shadow:0 1px 2px #000a}.lvx-rw{margin-top:4px;font-size:12px;font-weight:900;letter-spacing:3px;opacity:.7}.lvx-grid{width:100%;display:flex;flex-wrap:wrap;justify-content:center;gap:8px;max-height:36vh;-webkit-mask:linear-gradient(#000 85%,#0008);mask:linear-gradient(#000 85%,#0008);overflow-y:auto;padding:4px;touch-action:pan-y;overscroll-behavior:contain;scrollbar-width:none}.lvx-grid::-webkit-scrollbar{display:none}.lvx-t{--tc:#9ad0ff;width:104px;min-height:112px;padding:8px 5px 7px;border-radius:16px;background:linear-gradient(#ffffff26,#ffffff0d);box-shadow:inset 0 0 0 2px var(--tc),0 0 14px color-mix(in srgb,var(--tc) 45%,transparent);display:flex;flex-direction:column;align-items:center;text-align:center;gap:2px;opacity:0;transform:scale(.3)}#lvx.on .lvx-t{animation:lvxtile .5s cubic-bezier(.2,1.6,.4,1) forwards}.lvx-t b{font-size:13px;font-weight:900;line-height:1.1;overflow-wrap:anywhere;text-shadow:0 1px 2px #000a}.lvx-t small{font-size:10px;font-weight:800;opacity:.75;line-height:1.1}.lvx-t.lk-coin b{font-size:17px;color:#ffe066}.lvx-ti{width:54px;height:54px;background:center/contain no-repeat;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 3px 2px #0007)}.lvx-sw{display:block;width:48px;height:48px;border-radius:50%;box-shadow:inset -6px -8px 12px #0005,inset 4px 5px 8px #fff8,0 0 0 2px #fff}.lvx-unl{display:flex;width:48px;height:48px;border-radius:14px;align-items:center;justify-content:center;background:var(--tc)}.lvx-unl .ci{width:30px;height:30px;filter:brightness(4)}.lvx-ch{position:relative;display:block;width:54px;height:54px;background:center/contain no-repeat}.lvx-ch em{position:absolute;right:-12px;bottom:-4px;width:22px;height:22px;background:center/contain no-repeat;filter:drop-shadow(0 1px 1px #0008)}.lvx-luck{font-size:13px;font-weight:800;color:#7dff6a}.lvx-luck .ci{width:1.2em;height:1.2em;vertical-align:-.27em;margin-right:.2em}.lvx-next{max-width:92%;padding:7px 14px;border-radius:14px;background:#ffffff1a;box-shadow:inset 0 0 0 1.5px #ffffff26;font-size:12.5px;font-weight:700;text-align:center}.lvx-next b{color:#ffe066;margin-right:4px;font-weight:900}.lvx-next:empty{display:none}.lvx-ok{margin-top:6px;width:86%;height:56px;border:0;border-radius:18px;background:linear-gradient(#7dff6a,#2fc84a);color:#0a3a12;font:inherit;font-weight:900;font-size:21px;letter-spacing:1px;box-shadow:0 5px 0 #1a8a2e,0 10px 20px #0006;cursor:pointer}#lvx.on .lvx-ok{animation:lvxtile .5s 1.2s cubic-bezier(.2,1.6,.4,1) both}.lvx-ok:active{transform:translateY(3px);box-shadow:0 2px 0 #1a8a2e}@keyframes lvxspin{to{transform:rotate(360deg)}}@keyframes lvxfade{to{opacity:1}}@keyframes lvxfall{0%{opacity:1;transform:translate(0,0) rotate(0)}100%{opacity:1;transform:translate(var(--dx),110vh) rotate(var(--r))}}@keyframes lvxdrop{0%{transform:translateY(-120px) rotate(-3deg);opacity:0}100%{transform:translateY(0) rotate(-3deg);opacity:1}}@keyframes lvxpop{0%{transform:scale(.2);opacity:0}100%{transform:scale(1.75);opacity:1}}@keyframes lvxbump{50%{transform:scale(1.18)}}@keyframes lvxtile{0%{opacity:0;transform:scale(.3)}100%{opacity:1;transform:scale(1)}}@media(max-height:700px){.lvx-top span{font-size:26px}.lvx-badge{transform:scale(1.35);margin:20px 0 10px}@keyframes lvxpop{0%{transform:scale(.2);opacity:0}100%{transform:scale(1.35);opacity:1}}.lvx-title{margin-top:8px;font-size:17px}.lvx-t{width:96px;min-height:100px}.lvx-ti{width:44px;height:44px}.lvx-ok{height:48px}}'+'</style></head>')
open(D+'/index.html','w').write(h)
h=open(D+'/index.html').read()
h=h.replace('</head>','<style>.lvl-list.up .lvl-row.next::before{background:linear-gradient(#d5e2f2 50%,#4fc06d 50%)}.lvl-list.up .lvl-sec{padding:6px 4px 14px 50px}</style></head>')
open(D+'/index.html','w').write(h)
h=open(D+'/index.html').read()
h=h.replace('</head>','<style>#title .title-wrap .logo,#title .title-wrap .tag{display:none!important}</style></head>')
open(D+'/index.html','w').write(h)
h=open(D+'/index.html').read()
h=h.replace('</head>','<style>#igloo-btn{display:none!important}</style></head>')
open(D+'/index.html','w').write(h)
h=open(D+'/index.html').read()
h=h.replace('</head>','<style>'+'#title #play-pager.duo,#play-pager,#play-dots{display:none!important}#play-main{width:min(100%,348px)!important;margin:0 auto!important;height:70px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;background:linear-gradient(color-mix(in srgb,var(--wt,#2f8cff) 75%,#fff),var(--wt,#2378ee))!important;box-shadow:0 6px color-mix(in srgb,var(--wt,#2378ee) 70%,#000),0 14px 26px #17365c73!important}#play-main .dl-row{font-size:26px}#play-main small{font-size:12px;font-weight:800;opacity:.9}#maps{background:radial-gradient(120% 80% at 50% 0%,#2a5aa8,#132e66 55%,#0b1a3a)!important;padding:0!important;display:block!important}#maps.hidden{display:none!important}#maps .maps-card{position:absolute;inset:0;width:auto!important;max-width:none!important;border-radius:0!important;background:none!important;box-shadow:none!important;color:#fff;display:flex;flex-direction:column;align-items:stretch;padding:calc(env(safe-area-inset-top,0px) + 14px) 12px calc(env(safe-area-inset-bottom,0px) + 12px)!important;gap:10px!important}#maps h2{text-align:center;font-size:26px;letter-spacing:2px;color:#ffe066;text-shadow:0 2px 0 #a86a00,0 4px 10px #0006;text-transform:uppercase}#maps .maps-sub{display:flex;flex-direction:column;align-items:center;gap:6px;opacity:1!important;margin:0!important}.mp-prog{font-size:13px;font-weight:800;opacity:.85}.mp-prog b{color:#7dff6a;font-size:15px}.mp-bar{width:70%;height:10px;border-radius:6px;background:#0007;overflow:hidden;box-shadow:inset 0 0 0 1.5px #ffffff22}.mp-bar i{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,#7dff6a,#2fc84a)}#maps-list{flex:1;max-height:none!important;display:flex;flex-direction:column;gap:10px!important;overflow-y:auto;padding:4px 2px 10px!important;touch-action:pan-y;overscroll-behavior:contain;scrollbar-width:none}#maps-list::-webkit-scrollbar{display:none}.mp-card{position:relative;flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:9px 10px 9px 9px;border-radius:20px;background:linear-gradient(110deg,var(--c1),var(--c2));box-shadow:0 4px 0 #0005,inset 0 1px 0 #ffffff55;overflow:hidden}.mp-card:before{content:"";position:absolute;right:-30px;top:-40px;width:150px;height:150px;border-radius:50%;background:#ffffff1c}.mp-card.sel{box-shadow:0 0 0 3px #ffe066,0 4px 0 #0005}.mp-card.lock{background:linear-gradient(110deg,#3a4660,#2a3450);opacity:.85}.mp-pic{position:relative;flex:none;width:74px;height:74px;border-radius:16px;background:radial-gradient(circle at 50% 40%,#ffffffcc,#ffffff55);box-shadow:inset 0 0 0 2px #ffffff66;display:flex;align-items:center;justify-content:center}.mp-pic i{position:absolute;inset:4px;background:center/contain no-repeat;filter:drop-shadow(0 3px 2px #0004)}.mp-pic em{font-style:normal;font-size:40px;font-weight:900;color:var(--c2);text-shadow:0 2px 0 #fff}.mp-card.lock .mp-pic{background:#ffffff1a}.mp-card.lock .mp-pic i{filter:brightness(0) opacity(.35)}.mp-lk{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}.mp-lk .ci{width:28px;height:28px;filter:brightness(4);opacity:.9}.mp-num{position:absolute;left:-4px;top:-4px;min-width:24px;height:24px;padding:0 5px;border-radius:12px;background:#fff;color:#17365c;font-weight:900;font-size:13px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 0 #0003}.mp-t{position:relative;flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.15;text-shadow:0 1px 2px #0005}.mp-t small{font-size:11px;font-weight:800;opacity:.85;text-transform:uppercase;letter-spacing:.5px}.mp-t b{font-size:17px;font-weight:900}.mp-st{font-size:11.5px;font-weight:800;opacity:.9}.mp-card.done .mp-st{color:#d8ffd0}.mp-r{position:relative;flex:none;display:flex;flex-direction:column;align-items:flex-end;gap:5px}.mp-rw{display:flex;align-items:center;gap:3px;padding:2px 8px;border-radius:10px;background:#0003;font-size:12.5px;font-weight:900;color:#ffe066}.mp-coin{width:12px;height:12px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffe88a,#f2b21e);box-shadow:inset 0 0 0 1.5px #d48a00}.mp-go{min-width:76px;height:36px;padding:0 12px;border:0;border-radius:12px;background:#fff;color:#17365c;font:inherit;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 3px 0 #0004;cursor:pointer}.mp-go i{width:0;height:0;border-left:10px solid #2fb44a;border-top:6px solid transparent;border-bottom:6px solid transparent}.mp-go.off{background:#ffffff33;color:#fff;box-shadow:none}.mp-go .ci{width:16px;height:16px;filter:brightness(4)}.mp-go:active:not(:disabled){transform:translateY(2px);box-shadow:0 1px 0 #0004}#title-best{display:none!important}.mp-ball{width:52px;height:52px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff 0 30%,#e4f0ff 55%,#a9c6e8);box-shadow:0 4px 6px #0003,inset -4px -5px 8px #7fa4d055}.mp-card.main{min-height:96px}.mp-card.main .mp-t b{font-size:19px}#play-main.off{filter:grayscale(.7) brightness(.95);opacity:.85}#play-main .dl-row .ci{width:20px;height:20px;margin-right:6px;filter:brightness(4);vertical-align:-2px}#play-main.main{position:relative;overflow:hidden;background:linear-gradient(#fbfdff,#d4e7f6)!important;box-shadow:0 6px #8fb0cc,0 14px 26px #17365c4d!important;color:#17365c!important;text-shadow:none!important}#play-main.main:after{content:"";position:absolute;top:0;bottom:0;width:36px;left:-60px;background:#ffffffb3;transform:skewX(-20deg);animation:pmsh 6s ease-in-out infinite;pointer-events:none}@keyframes pmsh{0%{left:-60px}30%,100%{left:115%}}#play-main.main .dl-row,#play-main.main small{position:relative;z-index:1}#play-main.main small{opacity:.75}#play-main.main .dl-row{display:inline-flex;align-items:center;gap:6px}.pm-fl{width:22px;height:22px;color:#3a86d6}#play-main.main.off{background:linear-gradient(#e8eef4,#8a95a8)!important;color:#fff!important}#play-main.main.off:after{display:none}.mp-ex{position:relative;flex-basis:100%;display:flex;flex-direction:column;gap:4px;margin-top:-2px;padding:7px 8px 6px;border-radius:13px;background:#00000026;text-shadow:none}.mp-un{display:flex;flex-wrap:wrap;align-items:center;gap:4px;font-size:10.5px;font-weight:800}.mp-un b{font-size:10px;text-transform:uppercase;letter-spacing:.5px;opacity:.85;margin-right:2px}.mp-un span{padding:2px 7px;border-radius:999px;background:#ffffff2e}.mp-un span em{font-style:normal;text-shadow:0 0 2px #fff}.mp-gh{font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.5px;opacity:.85;margin-top:2px}.mp-gb{display:flex;height:7px;border-radius:4px;overflow:hidden;background:#0003}.mp-gb i{display:block;height:100%}.mp-gc{display:flex;flex-wrap:wrap;gap:3px 9px;font-size:10.5px;font-weight:800}.mp-gc span{display:inline-flex;align-items:center;gap:3px}.mp-gc i{width:7px;height:7px;border-radius:50%;background:var(--g);box-shadow:0 0 0 1.5px #fff8}.mp-card.lock .mp-ex{opacity:.8}.mp-st2{display:block;text-transform:none;letter-spacing:0;font-size:11px;font-weight:700;opacity:.88;margin-top:3px;line-height:1.2;white-space:normal}#avx{position:absolute;inset:0;z-index:1100;pointer-events:auto;display:flex;align-items:center;justify-content:center;background:#0b1a3299;opacity:0;transition:opacity .25s}#avx.on{opacity:1}.avx-card{width:min(86%,330px);background:#fff;border-radius:24px;padding:22px 20px 16px;text-align:center;box-shadow:0 18px 40px #0006;transform:scale(.9);transition:transform .25s}#avx.on .avx-card{transform:none}.avx-card .mp-ball{display:block;margin:0 auto 8px;width:64px;height:64px}.avx-card small{display:block;font-size:11px;font-weight:900;letter-spacing:.6px;text-transform:uppercase;color:#3a86d6}.avx-card h2{margin:4px 0 8px;font-size:22px;font-weight:900;color:#17365c}.avx-card p{margin:0 0 16px;font-size:14px;font-weight:700;line-height:1.4;color:#4a5a70}.avx-card button{display:block;width:100%;border:0;border-radius:16px;font:inherit;font-weight:900;cursor:pointer}.avx-go{height:52px;font-size:19px!important;color:#fff;background:linear-gradient(#5ab0ff,#2f7ae0);box-shadow:0 5px #1d5fb3}.avx-go:active{transform:translateY(2px);box-shadow:0 3px #1d5fb3}.avx-ok{height:40px;margin-top:10px;font-size:15px!important;color:#17365c;background:#e8eef6}#gold-rush{transition-property:opacity,transform!important}#hud #milestone{position:absolute!important;left:0;right:0;top:0;margin:0!important;bottom:auto!important}#banner>div{width:fit-content;max-width:100%;margin-left:auto;margin-right:auto}#maps-close{flex:none;height:52px;border-radius:16px!important;background:#ffffff!important;color:#17365c!important;font-weight:900}'+'</style></head>')
open(D+'/index.html','w').write(h)
h=open(D+'/index.html').read()
h=h.replace('<button id="ig-deco" class="ig-pill main" type="button">Decorate</button>','<button id="ig-deco" class="ig-pill main" type="button">Decorate</button><button id="ig-fr" class="ig-pill fr" type="button">Pets</button>',1)
h=h.replace('</head>','<style>#ig-bar{gap:7px!important;padding:0 8px!important}#ig-bar .ig-pill{padding:13px 14px;white-space:nowrap}.ig-pill.fr{position:relative;background:#ff6fa8;color:#fff;box-shadow:0 4px 0 #cf3f7a,0 8px 18px #0b244533}.ig-pill.fr.dot:after{content:"";position:absolute;top:-3px;right:-2px;width:13px;height:13px;border-radius:50%;background:#ff3b30;box-shadow:0 0 0 2.5px #fff}</style></head>')
h=h.replace('</head>','<style>'+'''#ig-mug,#ig-mugq{display:none!important}
#igloo.shop .ig-items{min-height:0!important;max-height:none!important}
.ig-shop,.ig-set{grid-column:1/-1}
.ig-shop{display:flex;flex-direction:column;gap:8px;padding:2px 0}
.sh-head{display:flex;justify-content:space-between;align-items:baseline;padding:0 4px}.sh-head b{font-size:17px;font-weight:900}.sh-head span{font-size:12px;font-weight:800;color:#6b7c95}
.sh-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;padding-top:3px}
.sh-t{position:relative;border:0;padding:0 0 4px;border-radius:14px;background:#fff;box-shadow:0 2px 0 #d5e0ee,inset 0 0 0 1.5px #e3ebf6;display:flex;flex-direction:column;align-items:center;font:inherit;cursor:pointer;overflow:hidden;transition:transform .15s}
.sh-t i{display:block;width:100%;height:58px;background:color-mix(in srgb,var(--tc) 14%,#fff) center/contain no-repeat}
.sh-t em{font-style:normal;font-size:11px;font-weight:900;color:#5a6b85;display:flex;align-items:center;gap:2px;height:17px}
.sh-t em .ig-c{width:11px;height:11px;margin-right:2px}.sh-t em .ci{width:12px;height:12px;opacity:.6}
.sh-t.on{box-shadow:0 3px 0 #1a5fc4,inset 0 0 0 3px #2f8cff;transform:translateY(-2px)}
.sh-t.cur em{color:#1f9d55}
.sh-t.lk i{filter:grayscale(.7) opacity(.55)}
.sh-info{padding:0 4px;display:flex;flex-direction:column;gap:5px}
.sh-n{display:flex;align-items:center;gap:8px}.sh-n b{font-size:17px;font-weight:900}
.sh-try{font-size:10.5px;font-weight:900;color:#fff;background:#2f8cff;padding:2px 8px;border-radius:999px;animation:shtry 1.4s ease-in-out infinite}
@keyframes shtry{50%{opacity:.6}}
.sh-tags{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.sh-fl{font-size:13px;font-weight:700;color:#55657d;font-style:italic;padding:0 2px}.sh-pb{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:16px;background:linear-gradient(90deg,#fff0f6,#eaf3ff);box-shadow:inset 0 0 0 1.5px #ffd0e2}.sh-pp{flex:none;width:52px;height:52px;border-radius:14px;background:#fff center/contain no-repeat;box-shadow:0 2px 0 #f2c6d8}.sh-pt{display:flex;flex-direction:column;gap:1px;min-width:0}.sh-pl{font-size:10.5px;font-weight:900;color:#d0306f;text-transform:uppercase;letter-spacing:.04em}.sh-pt b{font-size:15px;font-weight:900;color:#1d2b44}.sh-st{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:900;color:#2f6fd0}.ig-pips{display:inline-flex;gap:3px}.ig-pips i{width:12px;height:6px;border-radius:3px;background:#d6e0ee}.ig-pips i.on{background:linear-gradient(90deg,#ffb21a,#ff7a1a)}.ig-chip2{display:inline-flex;align-items:center;gap:6px;margin-top:4px;font-size:11px;font-weight:900;padding:3px 8px;border-radius:999px}.ig-chip2.pk{background:#ffe6f0;color:#c2185b}.ig-chip2.bl{background:#e3efff;color:#2364c4}.ig-chip3{font-size:10.5px;font-weight:800;color:#7a8698;margin-top:2px}.sh-nx{font-size:12px;font-weight:800;color:#7a8698}.sh-pet{font-size:11px;font-weight:900;padding:2px 8px;border-radius:999px;background:#ffe1ee;color:#c2185b}.sh-perk{flex-basis:100%;font-size:12px;font-weight:800;color:#3d6fb0}.sh-gv{font-size:12px;font-weight:700;color:#7a8698}.sh-gv:empty{display:none}
.sh-tier{font-size:11px;font-weight:900;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,var(--tc) 18%,#fff);color:color-mix(in srgb,var(--tc) 70%,#000)}
.sh-set{font-size:11px;font-weight:900;padding:2px 8px;border-radius:999px;background:color-mix(in srgb,var(--sc) 14%,#fff);color:color-mix(in srgb,var(--sc) 65%,#000);box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--sc) 35%,#fff)}
.sh-set.on{background:var(--sc);color:#fff;box-shadow:none}
.ig-cb.sh-buy{height:46px;font-size:16px;margin-top:2px;flex:none}
.ig-set{display:flex;align-items:center;gap:10px;width:100%;border:0;font:inherit;text-align:left;padding:8px 10px;border-radius:16px;background:#fff;box-shadow:0 2px 0 #d5e0ee,inset 0 0 0 1.5px #e3ebf6;color:var(--ink);cursor:pointer;flex:none}
.ig-set.on{background:color-mix(in srgb,var(--sc) 10%,#fff);box-shadow:0 2px 0 color-mix(in srgb,var(--sc) 60%,#000),inset 0 0 0 2px var(--sc)}
.ig-set.lk{opacity:.72}
.st-pics{display:grid;grid-template-columns:repeat(4,30px);gap:3px;flex:none}
.st-pics i{width:30px;height:30px;border-radius:8px;background:#eef3fa center/contain no-repeat;filter:grayscale(.85) opacity(.45)}
.st-pics i.y{filter:none;background-color:color-mix(in srgb,var(--sc) 18%,#fff)}
.st-t{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.st-t b{font-size:13.5px;font-weight:900;line-height:1.1}.st-t small{font-size:11px;font-weight:700;color:#6b7c95}
.st-bar{display:block;height:6px;border-radius:3px;background:#e6edf7;overflow:hidden;margin-top:1px}.st-bar i{display:block;height:100%;background:var(--sc);border-radius:3px}
.st-r{flex:none;font-size:12px;font-weight:900;color:#d63c72;background:#ffe8f0;padding:4px 7px;border-radius:999px}
.ig-set.on .st-r{background:var(--sc);color:#fff}'''.replace('\n','')+'</style></head>')
_a='A new mixed-up map every day. Smash 2 walls to win bonus coins.';assert h.count(_a)==1;h=h.replace(_a,'A new challenge every day. Reach the end of the level to win bonus coins.')
open(D+'/index.html','w').write(h)

# ---- tournaments: page + menu button + styles
h=open(D+'/index.html').read()
for x,y in [('<button id="progress-btn" class="mission-tab side-tab progress-tab" type="button">Progress</button>','<button id="progress-btn" class="mission-tab side-tab progress-tab" type="button">Progress</button><button id="tn-btn" type="button" aria-label="Tournaments"></button>'),
 ('<section id="maps" class="screen hidden">','<section id="tn" class="screen hidden"><div class="tn-card"></div></section><section id="maps" class="screen hidden">'),
 ('</style>',open(D+'/tourney.css').read()+open(D+'/casespin.css').read()+open(D+'/stars.css').read()+'#tab-sets{display:none!important}</style>')]:
  assert h.count(x)>=1,x[:50];h=h.replace(x,y,1)
open(D+'/index.html','w').write(h)

# ---- cosmetics: Style tab + css
h=open(D+'/index.html').read()
for x,y in [('<button id="tab-skins" class="tab" type="button">Skins</button>','<button id="tab-skins" class="tab" type="button">Skins</button><button id="tab-trails" class="tab" type="button">Trails</button><button id="tab-smash" class="tab" type="button">Smash</button><button id="tab-names" class="tab" type="button">Names</button>'),
 ('<div id="skin-list" hidden></div>','<div id="skin-list" hidden></div><div id="style-list" hidden></div>'),
 ('</style>',open(D+'/cosm.css').read().replace('\n','')+'</style>')]:
  assert h.count(x)>=1,x[:50];h=h.replace(x,y,1)
open(D+'/index.html','w').write(h)

# ---- distance chest css
h=open(D+'/index.html').read()
assert h.count('</style>')>=1
h=h.replace('</style>',open(D+'/dchest.css').read().replace('\n','')+'</style>',1)
open(D+'/index.html','w').write(h)

# =================== RELEASE PREP (1: remove test button, 2: portrait / back button / loading screen)
s=open(D+'/game.js').read()
_a=s.index('document.getElementById("set-max")?.addEventListener("click",v=>{');_b=s.index('MXA(this,q)}),',_a)+len('MXA(this,q)}),')
assert s.count('document.getElementById("set-max")?.addEventListener')==1 and _b-_a<1500
s=s[:_a]+s[_b:]
for x,y,c in [
 ('{let X=this.save.x;X&&!X.mxc&&(X.maxOn||BC(this.save.xp||0).level>=50&&this.save.reached>=Eu)&&(X.mxc=1,this.save.coins=Math.max(this.save.coins||0,1e6),ZC(this.save),this.ui.setCoins&&this.ui.setCoins(this.save.coins))}','',1),
 ('{let q=document.getElementById("set-max");q&&!q.dataset.arm&&(q.textContent=this.save.x&&(this.save.x.maxOn||BC(this.save.xp||0).level>=50&&this.save.reached>=Eu)?"Back to level 1 (test)":"Unlock level 50 + all worlds")}','',1),
 ('function HS(e,t=1){',r'''function BKV(b){if(!b||b.disabled||b.hidden||!b.checkVisibility||!b.checkVisibility({checkVisibilityCSS:!0,checkOpacity:!0}))return 0;for(let p=b;p;p=p.parentElement)if(p.classList&&p.classList.contains(`hidden`))return 0;let r=b.getBoundingClientRect();if(r.width<2||r.height<2)return 0;let x=Math.min(innerWidth-1,Math.max(0,r.left+r.width/2)),y=Math.min(innerHeight-1,Math.max(0,r.top+r.height/2)),e=document.elementFromPoint(x,y);return e&&(e===b||b.contains(e))?1:0}function BKB(g){let $=id=>document.getElementById(id),hit=b=>BKV(b)?(b.click(),1):0;if(BKV($(`cont-yes`))||BKV($(`cont-no`)))return;if(g.igOn){hit($(`ig-done`))||hit($(`ig-back`));return}if(hit($(`lvx-ok`))||hit($(`lvlup-ok`)))return;let R=/^(done|back|close|nice!?|collect!?|ok|okay|got it|cancel|no thanks|maybe later|not now|×|✕|✖)$/i,L=[...document.querySelectorAll(`button,[role=button]`)].filter(b=>{if(b.closest(`#title`)&&!b.closest(`.screen:not(#title)`))return 0;let t=(b.getAttribute(`aria-label`)||b.textContent||``).replace(/\s+/g,` `).trim(),k=b.id||``,c=typeof b.className==`string`?b.className:``;return(R.test(t)||/(^|-)(close|back|done)$/.test(k)||/(^|[\s-])(close|back|x)(\s|$)/.test(c))&&BKV(b)});if(L.length){L[L.length-1].click();return}let ok=b=>b&&!b.disabled&&!b.hidden&&b.checkVisibility&&b.checkVisibility({checkVisibilityCSS:!0}),S=[...document.querySelectorAll(`section.screen:not(#title)`)].filter(e=>!e.classList.contains(`hidden`)&&e.checkVisibility()).sort((a,b)=>(parseInt(getComputedStyle(a).zIndex)||0)-(parseInt(getComputedStyle(b).zIndex)||0));for(let k=S.length-1;k>=0;k--){let sc=S[k];if(sc.id===`continue`)return;if(sc.id===`pause`){hit($(`resume-btn`))||$(`resume-btn`).click();return}if(sc.id===`end`){$(`menu-btn`).click();return}let C=[...sc.querySelectorAll(`button`)].filter(b=>{let t=(b.getAttribute(`aria-label`)||b.textContent||``).replace(/\s+/g,` `).trim(),k=b.id||``,c=typeof b.className==`string`?b.className:``;return(R.test(t)||/(^|-)(close|back|done|ok)$/.test(k)||/(^|[\s-])(close|back|x)(\s|$)/.test(c))&&ok(b)});if(C.length){(C.find(b=>/(close|back|done)$/.test(b.id||``))||C[C.length-1]).click();return}}if(g.state===`playing`&&!g.paused){g.pause();return}let A=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.App;A&&(A.minimizeApp?A.minimizeApp():A.exitApp&&A.exitApp())}function BKI(g){window.__back=()=>BKB(g);try{let A=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.App;A&&A.addListener&&A.addListener(`backButton`,()=>BKB(g))}catch{}try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock(`portrait`).catch(()=>{})}catch{}try{let M=matchMedia(`(orientation:landscape) and (max-height:520px) and (hover:none)`),f=()=>{M.matches&&g.state===`playing`&&!g.paused&&g.pause()};M.addEventListener?M.addEventListener(`change`,f):M.addListener(f)}catch{}let x=()=>{let B=document.getElementById(`boot`);if(!B)return;clearTimeout(window.__bootT),B.classList.add(`gone`),setTimeout(()=>B.remove(),600)};requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(x,120)))}function HS(e,t=1){''',1),
 ('window.__snowball={game:n,','BKI(n),window.__snowball={game:n,',1),
]:
    assert s.count(x)==c,(x[:60],s.count(x)); s=s.replace(x,y)
assert 'set-max' not in s and '1e6),ZC' not in s
open(D+'/game.js','w').write(s)
h=open(D+'/index.html').read()
x=' <button id="set-max" class="switch" type="button">Unlock level 50 + all worlds</button>'
assert h.count(x)==1; h=h.replace(x,'')
BOOTCSS='''#boot{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;background:linear-gradient(180deg,#3f8fea 0%,#7cc0f7 45%,#d9efff 72%,#fff 100%);transition:opacity .45s ease;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;overflow:hidden;-webkit-user-select:none;user-select:none}#boot.gone{opacity:0;pointer-events:none}#boot:before{content:"";position:absolute;left:-10%;right:-10%;bottom:-6%;height:34%;background:#fff;border-radius:50% 50% 0 0/40% 40% 0 0;box-shadow:0 -18px 40px #ffffff99}.bt-t{position:relative;text-align:center;line-height:1;color:#fff;font-weight:900;letter-spacing:.5px;text-shadow:0 3px 0 #1d4fa8,0 5px 0 #173f86,0 8px 14px #0b2a5c66}.bt-t b{display:block;font-size:min(9.5vw,52px)}.bt-t i{display:block;font-style:normal;font-size:min(7.5vw,34px);margin-top:8px;color:#ffe066}.bt-ball{position:relative;width:132px;height:132px}.bt-ball:before{content:"";position:absolute;inset:16px;border-radius:50%;border:3px dashed #ffffff8c}.bt-orb{position:absolute;inset:0;animation:btorb 1.5s linear infinite}.bt-orb:after{content:"";position:absolute;inset:6px;border-radius:50%;background:conic-gradient(from 250deg,#fff0 0deg,#ffffffe6 106deg,#fff0 107deg);-webkit-mask:radial-gradient(closest-side,#0000 calc(100% - 22px),#000 calc(100% - 21px),#000 calc(100% - 9px),#0000 calc(100% - 8px));mask:radial-gradient(closest-side,#0000 calc(100% - 22px),#000 calc(100% - 21px),#000 calc(100% - 9px),#0000 calc(100% - 8px))}.bt-orb s,.bt-orb b{position:absolute;left:50%;top:-4px;width:44px;height:44px;margin-left:-22px;border-radius:50%;z-index:1}.bt-orb s{background:radial-gradient(circle at 50% 50%,#fff0 0 26%,#f6faff99 27% 52%,#fff0 53%),conic-gradient(from 10deg,#fff 0 48deg,#f2f7fe 48deg 101deg,#fff 101deg 163deg,#eef4fc 163deg 214deg,#fbfdff 214deg 268deg,#f0f6fd 268deg 322deg,#fff 322deg);box-shadow:0 0 0 1px #ffffffcc;animation:btspin 1.5s linear infinite}.bt-orb b{background:radial-gradient(circle at 32% 28%,#fff0 0 34%,#c4d9f330 60%,#7fa6d877 100%);box-shadow:0 7px 10px -4px #1b3f7a55;animation:btlit 1.5s linear infinite}@keyframes btorb{to{transform:rotate(360deg)}}@keyframes btspin{to{transform:rotate(1080deg)}}@keyframes btlit{to{transform:rotate(-360deg)}}.bt-bar{position:relative;width:min(62vw,260px);height:12px;border-radius:9px;background:#ffffffb3;box-shadow:inset 0 0 0 2px #fff,0 2px 6px #1b3f7a33;overflow:hidden}.bt-bar u{position:absolute;top:0;bottom:0;width:40%;border-radius:9px;background:linear-gradient(90deg,#4aa3ff,#2f7ae0);animation:btbar 1.2s ease-in-out infinite}@keyframes btbar{0%{left:-40%}100%{left:100%}}#bt-msg{position:relative;margin:-10px 0 0;color:#2a5b9e;font-weight:700;font-size:15px}#rotate{display:none;position:fixed;inset:0;z-index:2147483001;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;color:#fff;font:800 20px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:linear-gradient(180deg,#3f8fea,#9fd3ff)}#rotate i{width:46px;height:78px;border:5px solid #fff;border-radius:10px;animation:rtt 1.8s ease-in-out infinite}@keyframes rtt{0%,30%{transform:rotate(-90deg)}60%,100%{transform:rotate(0)}}#rotate small{font-weight:600;font-size:14px;opacity:.9}@media (orientation:landscape) and (max-height:520px) and (hover:none){#rotate{display:flex}}'''
BOOTHTML='''<div id="boot"><div class="bt-t"><b>AVALANCHE RUN</b><i>ROLL &amp; GROW</i></div><div class="bt-ball"><span class="bt-orb"><s></s><b></b></span></div><div class="bt-bar"><u></u></div><p id="bt-msg">Loading…</p><script>window.__bootT=setTimeout(function(){var m=document.getElementById("bt-msg");if(m){m.textContent="Taking a while… tap to try again";m.style.cursor="pointer";document.getElementById("boot").onclick=function(){location.reload()}}},25000);</script></div><div id="rotate"><i></i>Turn your phone upright<small>Avalanche Run plays in portrait</small></div>'''
assert h.count('</style>')>=1 and len(__import__('re').findall(r'<body[^>]*>',h))==1
h=h.replace('</style>',BOOTCSS+'</style>',1)
import re as _re
h=_re.sub(r'(<body[^>]*>)',lambda m:m.group(1)+BOOTHTML,h,count=1)
open(D+'/index.html','w').write(h)

# ---- gear: nose sits on the face above the scarf (scarf moved down, nose moved up)
s=open(D+'/game.js').read()
import math as _m
for x,y,c in [
 ('y0=.28,y1=.52','y0=-.02,y1=.22',1),
 ('kn.position.set(Math.sin(K)*1.03,.43,Math.cos(K)*1.03)','kn.position.set(Math.sin(K)*(sr(.13)+.127),.13,Math.cos(K)*(sr(.13)+.127))',1),
 ('y=.36-u*L','y=.06-u*L',1),
 ('if(a>=0){let e=NCo??','let NB=t.children.length;if(a>=0){let e=NCo??',1),
 ('}let c=e?.boots??-1;','}for(let k=NB;k<t.children.length;k++){let m=t.children[k];m.position.y+=.08,m.position.z+=%s}let c=e?.boots??-1;'%round(_m.sqrt(1-.35**2)-_m.sqrt(1-.43**2),4),1),
 ('scarf:[0,.42,0,1.02],nose:[0,.35,-1.05,.3]','scarf:[0,.12,0,1.06],nose:[0,.43,-.98,.3]',1),
]:
    assert s.count(x)==c,(x[:60],s.count(x)); s=s.replace(x,y)
open(D+'/game.js','w').write(s)

# ---- tutorial: waits (in slow-mo) until the player actually does each action; prompt pulses if they don't
s=open(D+'/game.js').read()
for x,y,c in [
 ('if(n===0){this.tutA+=Math.abs(a.targetX-this.tutX),this.tutX=a.targetX,(this.tutA>a.r*2.5||this.tutT>25)&&this.tutOk()}else if(n===1){(this.stats.absorbs-this.tutE>=3||this.tutT>25)&&this.tutOk()}',
  'if((n===0||n===1||n===3)&&performance.now()-(this.tutW||0)>5e3){let T=document.getElementById("tut");T&&!T.classList.contains("nudge")&&T.classList.add("nudge")}if(n===0){this.tutA+=Math.abs(a.targetX-this.tutX),this.tutX=a.targetX,this.tutA>a.r*2.5&&this.tutOk()}else if(n===1){this.stats.absorbs-this.tutE>=3&&this.tutOk()}',1),
 ('else if(n===3){(a.h>a.r*.3||this.tutT>25)&&this.tutOk()}','else if(n===3){this.tutJ&&a.h>a.r*.2&&this.tutOk()}',1),
 ('this.tutShow(S[n],n,S.length),this.tutT=0,','this.tutShow(S[n],n,S.length),this.tutW=performance.now(),this.tutT=0,',1),
 ('tutOk(){let T=document.getElementById("tut");this.tutDone=1,','tutOk(){let T=document.getElementById("tut");T.classList.remove("nudge"),this.tutDone=1,',1),
 ('T.classList.remove("on","ok"),T.offsetWidth,T.classList.add("on")}','T.classList.remove("on","ok","nudge"),T.offsetWidth,T.classList.add("on")}',1),
 ('this.contT>0&&(this.avalancheGap=Math.max(this.avalancheGap,this.contG||0));let t=this.avalancheGap;','this.contT>0&&(this.avalancheGap=Math.max(this.avalancheGap,this.contG||0)),this.tut>=0&&!this.tutDone&&this.state===`playing`&&(this.tutG=Math.min(18,(this.tutG??this.avalancheGap)+r),this.avalancheGap=Math.max(this.avalancheGap,this.tutG));let t=this.avalancheGap;',1),
 ('this.tutW=performance.now(),this.tutT=0,','this.tutW=performance.now(),this.tutG=null,this.tutIn=0,this.tutJ=0,this.tutT=0,',1),
 ('u&&a.jump()&&this.audio.jump(!1)','u&&a.jump()&&(this.tutJ=1,this.audio.jump(!1))',1),
 ('let l=this.input.consumeDrag(),u=this.input.consumeJump();','let l=this.input.consumeDrag(),u=this.input.consumeJump();this.tut===0&&!this.tutDone&&(this.tutIn=(this.tutIn||0)+Math.abs(l)+Math.abs(this.input.keyAxis)*t*.3);',1),
 ('this.tutA>a.r*2.5&&this.tutOk()','(this.tutIn||0)>.06&&this.tutOk()',1),
]:
    assert s.count(x)==c,(x[:60],s.count(x)); s=s.replace(x,y)
open(D+'/game.js','w').write(s)
h=open(D+'/index.html').read()
h=h.replace('</style>','#tut.on.nudge{animation:tutn 1.1s ease-in-out infinite}@keyframes tutn{0%,100%{transform:translateX(-50%) scale(1)}50%{transform:translateX(-50%) scale(1.09)}}</style>',1)
open(D+'/index.html','w').write(h)

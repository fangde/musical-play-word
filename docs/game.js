import * as THREE from 'three';
import {icon} from './instrument-icons.js';
import {GLTFLoader} from './assets/GLTFLoader.js';
const $=id=>document.getElementById(id);
const ids=['flute','clarinet','harp','violin','cello','bassoon','horn','trombone','timpani','cymbals'];
const names=['长笛萌可','单簧管萌可','竖琴萌可','小提琴萌可','大提琴萌可','巴松萌可','圆号萌可','长号萌可','定音鼓萌可','钹萌可'];
const family=['木管 · 清亮','木管 · 温柔','拨弦 · 波光','高音弦乐 · 灵动','低音弦乐 · 深沉','木管 · 醇厚','铜管 · 辽阔','铜管 · 雄壮','打击乐 · 浪涌','打击乐 · 飞溅'];
const pools=[[0,1,2,3],[3,4,0,1],[4,6,7,8],[3,4,5,7],[6,7,8,9,3,0,2]];
const chapters=['晴光微波','浪花汇聚','水之山峦','逆流','海岸'];
const music=$('music'),canvas=$('stage'),wrap=canvas.parentElement;
let state='ready',score=0,combo=0,mistakes=0,index=0,notes=[],duration=327.6,readyModel=false,readyAudio=false,noiseContext,muted=false;
const windowSize=.58,preview=1.45;
const scene=new THREE.Scene();scene.fog=new THREE.Fog(0xa9dce2,28,90);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.22;
const camera=new THREE.OrthographicCamera(-11,11,8,-8,.1,120);camera.position.set(0,12,18);camera.lookAt(0,.2,0);
scene.add(new THREE.HemisphereLight(0xe5ffff,0x548282,2.4));const sun=new THREE.DirectionalLight(0xfff1d4,3);sun.position.set(-5,10,9);scene.add(sun);const rim=new THREE.DirectionalLight(0xd0efff,1.5);rim.position.set(8,5,-6);scene.add(rim);
const water=new THREE.Mesh(new THREE.PlaneGeometry(180,180),new THREE.MeshStandardMaterial({color:0x94cdd5,roughness:.55,metalness:.15}));water.rotation.x=-Math.PI/2;water.position.y=-.68;scene.add(water);
// Wide, translucent rings form ripples around the island.
const ripples=[];for(let i=0;i<5;i++){const r=new THREE.Mesh(new THREE.RingGeometry(10+i*2.5,10.05+i*2.5,100),new THREE.MeshBasicMaterial({color:0xdef6f3,transparent:true,opacity:.35,side:THREE.DoubleSide}));r.rotation.x=-Math.PI/2;r.scale.y=.68;r.position.y=-.66;scene.add(r);ripples.push(r);}
const roots=[],labels=[],rings=[],bases=[],materials=[];let band;
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
new GLTFLoader().load('./assets/moko-band.glb',g=>{
 band=g.scene;scene.add(band);
 ids.forEach((id,i)=>{
  const root=band.getObjectByName('moko_'+id);if(!root)throw Error('缺少角色 '+id);roots[i]=root;bases[i]=root.position.clone();materials[i]=[];
  root.traverse(o=>{if(o.isMesh){o.userData.member=i;o.material=o.material.clone();materials[i].push(o.material);}});
  const ring=new THREE.Mesh(new THREE.RingGeometry(.87,1.05,64),new THREE.MeshBasicMaterial({color:0xffdb86,transparent:true,opacity:0,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(root.position.x,.145,root.position.z);scene.add(ring);rings[i]=ring;
  const label=document.createElement('button');label.className='moko-label';label.innerHTML=icon(id);label.title=names[i];label.setAttribute('aria-label','演奏'+names[i]);label.addEventListener('click',()=>hit(i));$('labels').appendChild(label);labels[i]=label;
 });readyModel=true;$('loading').style.display='none';unlock();resize();
},undefined,e=>{$('loading').textContent='乐队模型未能加载，请刷新重试。';console.error(e);});
function resize(){const w=wrap.clientWidth,h=wrap.clientHeight;renderer.setSize(w,h,false);const aspect=w/h;const span=aspect<1.25?10.2:10.4;camera.left=-span;camera.right=span;camera.top=span/aspect;camera.bottom=-span/aspect;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(wrap);
function unlock(){if(readyModel&&readyAudio){$('play').disabled=false;$('play').textContent='开始演奏';$('restart').disabled=false;}}
function chartFallback(){return Array.from({length:Math.floor((duration-5)/2.1)},(_,j)=>({time:3+j*2.1,member:pools[Math.min(4,Math.floor((3+j*2.1)/duration*5))][j%pools[Math.min(4,Math.floor((3+j*2.1)/duration*5))].length]}));}
async function loadChart(){try{const r=await fetch('./assets/audio-analysis.json');if(!r.ok)throw Error('chart');const d=await r.json();duration=d.duration;notes=d.notes;}catch(e){notes=chartFallback();$('feedback').textContent='已启用基础谱面，跟随亮起的萌可演奏。';}readyAudio=true;unlock();}
loadChart();music.addEventListener('loadedmetadata',()=>{if(Number.isFinite(music.duration))duration=music.duration;$('duration').textContent=format(duration);});
music.addEventListener('error',()=>{state='error';$('play').disabled=true;$('feedback').textContent='音频无法读取，请刷新页面重试。';});
function format(s){s=Math.max(0,Math.floor(s));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
function updateStats(){$('score').textContent=String(score).padStart(4,'0');$('combo').textContent=combo;$('lives').textContent=Array.from({length:5},(_,i)=>i<5-mistakes?'●':'○').join(' ');$('lives').setAttribute('aria-label',`剩余${5-mistakes}次容错`);}
function fx(kind){wrap.classList.remove('good','bad');void wrap.offsetWidth;wrap.classList.add(kind);}
function noise(){if(muted||!noiseContext)return;const ctx=noiseContext;const buffer=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.18),ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);const source=ctx.createBufferSource();source.buffer=buffer;const filter=ctx.createBiquadFilter();filter.type='bandpass';filter.frequency.value=750;filter.Q.value=.7;const gain=ctx.createGain();gain.gain.setValueAtTime(.2,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.18);source.connect(filter).connect(gain).connect(ctx.destination);source.start();source.stop(ctx.currentTime+.19);}
function fail(message){if(state!=='playing')return;mistakes++;combo=0;noise();fx('bad');$('feedback').textContent=message;updateStats();if(mistakes>=5)stop('lost');}
function hit(member){if(state!=='playing')return;const note=notes[index],t=music.currentTime;if(note&&note.member===member&&Math.abs(t-note.time)<=windowSize){const perfect=Math.abs(t-note.time)<.22;combo++;score+=(perfect?100:70)+Math.min(combo*5,100);note.hit=true;index++;updateStats();fx('good');$('feedback').textContent=`${perfect?'漂亮的一拍':'跟上了'} · ${names[member]} · ${combo} 连击`;roots[member].userData.hitUntil=performance.now()+300;}else fail(note&&note.member===member?'节奏早了或晚了，等光圈收拢再点击。':'这次点错了，跟随亮起的萌可。');}
wrap.addEventListener('pointerdown',e=>{const r=wrap.getBoundingClientRect();const tip=document.createElement('span');tip.className='baton-stroke';tip.style.left=(e.clientX-r.left)+'px';tip.style.top=(e.clientY-r.top)+'px';wrap.appendChild(tip);setTimeout(()=>tip.remove(),450);});
canvas.addEventListener('pointerdown',e=>{if(state!=='playing')return;const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const intersect=raycaster.intersectObjects(roots,true).find(h=>h.object.userData.member!==undefined);if(intersect)hit(intersect.object.userData.member);});
document.addEventListener('keydown',e=>{if($('analysis').open||e.repeat)return;if(/^[0-9]$/.test(e.key)){e.preventDefault();hit(e.key==='0'?9:Number(e.key)-1);}if(e.code==='Space'&&e.target===document.body){e.preventDefault();togglePlay();}});
async function togglePlay(){if(!readyAudio||!readyModel)return;if(state==='playing'){music.pause();state='paused';$('play').textContent='继续演奏';$('cueTitle').textContent='海风暂停了。';$('feedback').textContent='已暂停，继续后跟上原来的节奏。';return;}if(state==='lost'||state==='won')reset();if(!noiseContext)noiseContext=new(window.AudioContext||window.webkitAudioContext)();try{await noiseContext.resume();await music.play();state='playing';$('play').textContent='暂停演奏';$('cueTitle').textContent='这一拍，点击…';$('feedback').textContent='看好亮起的萌可，在光圈收拢时点击。';}catch(e){$('feedback').textContent='音乐暂时无法播放，请再点击开始。';}}
function stop(result){music.pause();state=result;$('play').textContent='再演奏一次';$('cueTitle').textContent=result==='lost'?'海风也需要休息。':'演出完成！';$('targetName').textContent=result==='lost'?'本场演出已停奏':'谢谢你的指挥';$('targetFamily').textContent=`得分 ${score} · 错误 ${mistakes}/5`;$('feedback').textContent=result==='lost'?'累计 5 次错误，音乐停止。重新开始，再试一次。':`海之赞歌演出完成！最终得分 ${score}。`;}
function reset(){music.pause();music.currentTime=0;score=0;combo=0;mistakes=0;index=0;notes.forEach(n=>delete n.hit);state='ready';updateStats();$('play').textContent='开始演奏';$('cueTitle').textContent='下一拍，交给你。';$('targetName').textContent='点击开始演奏';$('targetFamily').textContent='跟随亮起的萌可，点击演奏';$('cueIcon').textContent='♫';$('countdownBar').style.width='0%';$('feedback').textContent='准备好，海风正在等待你的第一拍。';}
$('play').addEventListener('click',togglePlay);$('restart').addEventListener('click',reset);$('sound').addEventListener('click',()=>{muted=!muted;music.muted=muted;$('sound').textContent=muted?'声音 关':'声音 开';$('sound').setAttribute('aria-label',muted?'开启声音':'静音音乐');});
music.addEventListener('ended',()=>{if(state==='playing')stop('won');});document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')togglePlay();});
$('analysisButton').addEventListener('click',()=>{if(state==='playing')togglePlay();$('analysis').showModal();});$('closeAnalysis').addEventListener('click',()=>$('analysis').close());
const projectPoint=new THREE.Vector3();
function frame(now){requestAnimationFrame(frame);const t=music.currentTime;
 if(state==='playing'){while(notes[index]&&t>notes[index].time+windowSize&&state==='playing'){index++;fail('漏掉一拍了，注意下一位亮起的萌可。');}}
 const note=notes[index],upcoming=state==='playing'&&note&&note.time-t<=preview;
 if(state==='playing'||state==='paused'){$('targetName').textContent=upcoming?names[note.member]:state==='paused'?'演奏已暂停':'等待下一拍';$('targetFamily').textContent=upcoming?'跟随光圈，挥动指挥棒':'跟随音乐，等待光圈';$('cueIcon').innerHTML=upcoming?icon(ids[note.member]):'♫';$('countdownBar').style.width=upcoming?`${Math.max(0,Math.min(1,1-(note.time-t)/preview))*100}%`:'0%';}
 $('elapsed').textContent=format(t);$('progressFill').style.width=`${Math.min(100,t/duration*100)}%`;$('chapter').textContent=t>0?`第 ${Math.min(5,Math.floor(t/duration*5)+1)} 乐章 · ${chapters[Math.min(4,Math.floor(t/duration*5))]}`:'序幕 · 等待指挥';
 roots.forEach((root,i)=>{const active=upcoming&&note.member===i;const pop=root.userData.hitUntil>now;root.position.y=bases[i].y+(state==='playing'?Math.sin(now*.003+i)*.035:0)+(pop?.14:0);root.rotation.z=state==='playing'?Math.sin(now*.002+i)*.025:0;rings[i].material.opacity=active?.8:0;if(active){const s=1+Math.max(0,note.time-t)/preview*.6;rings[i].scale.set(s,s,1);}materials[i].forEach(m=>{if(m.emissive){m.emissive.setHex(active||pop?0x614c19:0);m.emissiveIntensity=active?.2:pop?.4:0;}});labels[i].classList.toggle('active',!!active);projectPoint.set(root.position.x,root.position.y-.08,root.position.z+1.25).project(camera);labels[i].style.left=`${(projectPoint.x*.5+.5)*wrap.clientWidth}px`;labels[i].style.top=`${(-projectPoint.y*.5+.5)*wrap.clientHeight}px`;});
 ripples.forEach((r,i)=>{const s=1+Math.sin(now*.00035+i)*.03;r.scale.set(s,.68*s,1);});renderer.render(scene,camera);
}
resize();requestAnimationFrame(frame);
// Expose the same user actions to browsers with WebMCP support.
if(document.modelContext?.registerTool){for(const tool of [{name:'read_performance',description:'Read music game score and playback state',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:input=>{if(!input||Object.keys(input).length)throw Error('Expected an empty object');return {state,score,combo,mistakes,time:music.currentTime};}},{name:'restart_performance',description:'Reset this music performance to its beginning and stop playback',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{if(!input||Object.keys(input).length)throw Error('Expected an empty object');reset();return {state,score,mistakes};}}]){try{Promise.resolve(document.modelContext.registerTool(tool)).catch(console.warn);}catch(e){console.warn(e);}}}
// Small read-only hook for validating the real game state.
window.bandGame={getState:()=>({state,score,combo,mistakes,index,time:music.currentTime,next:notes[index]}),getMembers:()=>roots.map(o=>o.name)};

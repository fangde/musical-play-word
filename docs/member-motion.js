import * as THREE from 'three';

// Animate the actual Blender mesh parts, preserving their resting transforms.
export function prepareMember(root,id){
 root.updateWorldMatrix(true,true);
 const meshes=[];root.traverse(o=>{if(o.isMesh)meshes.push(o);});
 const name=o=>o.name.toLowerCase().replace(/[_.\d\s]/g,'');
 const head=new THREE.Group();head.name='head-motion';head.position.set(0,1.55,0);root.add(head);head.updateWorldMatrix(true,false);
 for(const mesh of meshes)if(/^(face|muzzle|eye|cheek|ear|sailorcap|capstripe|smile)/.test(name(mesh)))head.attach(mesh);
 const parts=meshes.filter(o=>!o.parent||o.parent!==head).map(o=>{const box=new THREE.Box3().setFromObject(o);return {o,name:name(o),position:o.position.clone(),rotation:o.rotation.clone(),scale:o.scale.clone(),side:Math.sign(box.getCenter(new THREE.Vector3()).x-root.position.x)||1};});
 const action={flute:'吹奏长笛、交替按键',clarinet:'吹奏单簧管、按键',bassoon:'吹奏巴松、按键',harp:'双手交替拨弦',violin:'往复拉弓',cello:'往复拉弓',horn:'吹奏圆号、按阀',trombone:'推动长号滑管',timpani:'双槌交替敲鼓',cymbals:'合拢碰击双钹'}[id];
 let status={performing:false,apologizing:false,action};
 return {
  status:()=>({...status}),
  update(time,performing,now){
   const elapsed=root.userData.apologyStart===undefined?Infinity:(now-root.userData.apologyStart)/1100;
   const sorry=elapsed>=0&&elapsed<1;performing=performing&&!sorry;
   status={performing,apologizing:sorry,action};
   head.rotation.set(0,0,0);root.rotation.x=0;
   for(const p of parts){p.o.position.copy(p.position);p.o.rotation.copy(p.rotation);p.o.scale.copy(p.scale);}
   if(sorry){const bow=Math.sin(Math.PI*elapsed);head.rotation.x=.55*bow;root.rotation.x=.15*bow;root.rotation.z=.045*Math.sin(elapsed*Math.PI*4)*bow;
    for(const p of parts)if(p.name.startsWith('hand')){p.o.position.x-=p.side*.16*bow;p.o.position.y-=.16*bow;p.o.position.z+=.12*bow;}
    return;
   }
   if(!performing)return;
   const beat=time*Math.PI*3.5,wave=Math.sin(beat);head.rotation.z=.025*Math.sin(time*3);head.rotation.x=-.025;
   for(const p of parts){const o=p.o,n=p.name,side=p.side;
    if(n.startsWith('hand')){
     if(id==='harp'){o.position.x+=side===-1?.16+.10*Math.sin(beat):-.17+.10*Math.sin(beat+Math.PI);o.position.y+=.09*Math.cos(beat+side);o.position.z+=.32;}
     else if(id==='violin'||id==='cello'){o.position.z+=.35;o.position.y+=side<0?.22:.07;o.position.x+=side<0?.07:.15*wave;}
     else if(id==='timpani'){o.position.y+=.13+.18*Math.sin(beat+(side<0?0:Math.PI));o.position.z+=.22;}
     else if(id==='cymbals'){o.position.x-=side*.16*(.5+.5*wave);o.position.z+=.23;}
     else{o.position.y+=.12+.025*Math.sin(beat+side);o.position.z+=.16;if(id==='trombone'&&side<0){o.position.x-=.07*(1+wave);o.position.y-=.12*(1+wave);}}
    }
    if((id==='violin'||id==='cello')&&n.startsWith('bow')){o.position.x+=.18*wave;o.position.y+=.11*wave;}
    if(id==='trombone'&&n.startsWith('slide')){o.position.x-=.08*(1+wave);o.position.y-=.18*(1+wave);}
    if(id==='timpani'&&n.startsWith('mallet')){o.position.y+=.12+.16*Math.sin(beat+(side<0?0:Math.PI));}
    if(id==='cymbals'&&n.startsWith('cymbal')){o.position.x-=side*.17*(.5+.5*wave);o.rotation.y+=side*.13*wave;}
    if(/^(flutekey|clarinetkey|bassoonkey|valve)/.test(n))o.position.y-=.022*(.5+.5*Math.sin(beat+p.position.y*9));
   }
  }
 };
}

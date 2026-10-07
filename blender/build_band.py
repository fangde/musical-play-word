import bpy, math, os
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
def mat(n,c,metal=0):
 m=bpy.data.materials.new(n); m.diffuse_color=(*c,1); m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*c,1); p.inputs['Metallic'].default_value=metal; p.inputs['Roughness'].default_value=.32 if metal else .48
 return m
cream=mat('porcelain',(1,.91,.76)); ink=mat('ink',(.025,.045,.08)); white=mat('white',(1,1,1)); gold=mat('brass',(.95,.57,.13),.65); wood=mat('maple',(.48,.17,.055)); silver=mat('silver',(.68,.84,.91),.7); pink=mat('cheeks',(1,.32,.4)); darkwood=mat('bassoon',(.27,.07,.06)); sea=mat('stage',(.035,.23,.31)); rim=mat('stage-rim',(.12,.65,.66),.2)
parent=None
def finish(o,n,m):
 o.name=n; o.data.materials.append(m)
 if parent: o.parent=parent
 if o.type=='MESH':
  for p in o.data.polygons:p.use_smooth=True
 return o
def ball(n,p,s,m):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,location=p); o=bpy.context.object; o.scale=s; return finish(o,n,m)
def cube(n,p,s,m,bevel=.07):
 bpy.ops.mesh.primitive_cube_add(size=1,location=p); o=bpy.context.object; o.scale=s; bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bevel:
  mod=o.modifiers.new('soft corners','BEVEL');mod.width=bevel;mod.segments=3; bpy.ops.object.modifier_apply(modifier=mod.name)
 return finish(o,n,m)
def cyl(n,p,r,d,m):
 bpy.ops.mesh.primitive_cylinder_add(vertices=32,radius=r,depth=d,location=p); return finish(bpy.context.object,n,m)
def tube(n,pts,r,m):
 c=bpy.data.curves.new(n,'CURVE');c.dimensions='3D';c.bevel_depth=r;c.bevel_resolution=3
 s=c.splines.new('POLY');s.points.add(len(pts)-1)
 for a,b in zip(s.points,pts):a.co=(*b,1)
 o=bpy.data.objects.new(n,c);bpy.context.collection.objects.link(o);o.data.materials.append(m)
 if parent:o.parent=parent
 return o
def line(n,a,b,r,m):return tube(n,[a,b],r,m)
def bell(n,p,rad,length,m):
 bpy.ops.mesh.primitive_cone_add(vertices=32,radius1=.07,radius2=rad,depth=length,location=p);o=bpy.context.object;o.rotation_euler[0]=math.pi/2;finish(o,n,m)
 # front dark opening with gold rim
 o=cyl(n+' opening',(p[0],p[1]-length/2-.008,p[2]),rad*.86,.014,ink);o.rotation_euler[0]=math.pi/2
names=['harp','violin','cello','flute','clarinet','bassoon','horn','trombone','timpani','cymbals']
colors=[(1,.69,.3),(.98,.4,.5),(.66,.47,.9),(.25,.82,.79),(.4,.55,.98),(.57,.72,.4),(1,.78,.29),(.98,.5,.25),(.3,.66,.94),(.94,.62,.79)]
def spot(i):
 a=-math.pi/2+i*math.pi/9
 return (7.8*math.sin(a),-1.4+5.2*math.cos(a),.15)
for i,n in enumerate(names):
 parent=bpy.data.objects.new('moko_'+n,None);bpy.context.collection.objects.link(parent)
 cm=mat(n+' color',colors[i]); parent.location=spot(i)
 parent.rotation_euler[2]=-(-math.pi/2+i*math.pi/9)*.22
 ball('body',(0,0,.95),(.62,.44,.72),cm);ball('face',(0,-.13,1.85),(.65,.49,.61),cm)
 ball('muzzle',(0,-.52,1.73),(.4,.055,.23),cream)
 for side in [-1,1]:
  ball('eye',(side*.225,-.569,1.97),(.073,.044,.09),ink);ball('eye sparkle',(side*.225-.015,-.61,2.005),(.019,.011,.021),white)
  ball('cheek',(side*.43,-.526,1.76),(.095,.025,.054),pink)
  ball('foot',(side*.29,-.12,.22),(.23,.36,.18),cream)
  ball('ear',(side*.49,-.015,2.26),(.2,.19,.3),cm)
  ball('hand',(side*.63,-.36,1.04),(.17,.19,.2),cream)
 tube('smile',[(-.07,-.584,1.74),(0,-.6,1.70),(.07,-.584,1.74)],.018,ink)
 cyl('sailor cap',(0,0,2.39),.41,.15,cream);cyl('cap stripe',(0,0,2.33),.42,.07,sea)
 # Distinct, physically readable instrument silhouettes
 if n=='flute':
  line('flute',(-.9,-.73,1.32),(.92,-.73,1.32),.065,silver)
  for j in range(8):ball('flute key',(-.6+j*.16,-.8,1.37),(.06,.028,.05),white)
 elif n=='clarinet':
  line('clarinet',(.23,-.77,.45),(-.18,-.68,1.6),.083,ink);bell('clarinet bell',(.28,-.79,.4),.2,.3,ink)
  for j in range(6):ball('clarinet key',(.17-j*.045,-.85,.65+j*.13),(.045,.025,.04),silver)
 elif n=='harp':
  tube('harp frame',[(-.85,-.74,.35),(-.85,-.74,1.77),(-.6,-.74,2),(.6,-.74,1.82),(.75,-.74,.35),(-.85,-.74,.35)],.095,gold)
  for j in range(9):line('harp string',(-.64+j*.15,-.77,.4),(-.64+j*.15,-.77,1.87-j*.015),.008,silver)
 elif n in ['violin','cello']:
  f=.8 if n=='violin' else 1.2
  ball('lower bout',(0,-.78,.66*f),(.36*f,.11,.3*f),wood);ball('upper bout',(0,-.78,1.02*f),(.27*f,.11,.22*f),wood)
  cube('neck',(0,-.78,1.45*f),(.095,.09,.64*f),darkwood);ball('scroll',(0,-.78,1.8*f),(.095,.1,.12),wood)
  for j in range(4):line('string',((j-1.5)*.023,-.9,.5*f),((j-1.5)*.023,-.9,1.76*f),.005,silver)
  line('bow',(-.65,-1,.62),(.66,-1,1.44),.023,wood)
  if n=='cello':line('end pin',(0,-.77,.05),(0,-.77,.45),.018,silver)
 elif n=='bassoon':
  line('bassoon long',(.2,-.72,.35),(.2,-.72,2.47),.09,darkwood);line('bassoon short',(.02,-.72,.36),(.02,-.72,1.44),.085,darkwood)
  tube('bocal',[(.02,-.72,1.44),(-.15,-.76,1.65),(-.32,-.74,1.71)],.026,silver)
  for j in range(9):ball('bassoon key',(.21,-.824,.6+j*.15),(.05,.028,.05),silver)
 elif n=='horn':
  tube('horn coil',[(.38*math.cos(a),-.81,.93+.38*math.sin(a)) for a in [j*math.pi/24 for j in range(65)]],.074,gold)
  tube('inner coil',[(.22*math.cos(a),-.83,.93+.22*math.sin(a)) for a in [j*math.pi/20 for j in range(42)]],.049,gold)
  bell('horn bell',(.55,-.86,1.08),.3,.55,gold)
  for j in range(3):cube('valve',(-.15+j*.13,-.94,1.12),(.06,.09,.16),silver)
 elif n=='trombone':
  tube('slide',[(-.25,-.8,1.4),(-.7,-.8,.42),(-.55,-.8,.3),(-.35,-.8,.35),(.16,-.8,1.4)],.047,gold)
  tube('brass tube',[(.16,-.8,1.4),(.4,-.8,1.5),(.65,-.8,1.37)],.073,gold);bell('trombone bell',(.65,-.9,1.37),.25,.45,gold)
 elif n=='timpani':
  for x in [-.43,.43]:
   ball('copper kettle',(x,-.83,.65),(.43,.43,.36),gold);cyl('drum skin',(x,-.83,.9),.44,.07,cream);cyl('drum rim',(x,-.83,.87),.46,.055,silver)
   for dx in [-.23,.23]:line('drum leg',(x+dx,-.83,.15),(x+dx,-.83,.62),.025,ink)
  for x in [-.58,.58]:line('mallet',(x,-.64,1.22),(x*.6,-.9,1.02),.022,wood);ball('mallet head',(x*.6,-.9,1.02),(.075,.075,.075),cream)
 elif n=='cymbals':
  for x in [-.52,.52]:
   o=cyl('cymbal',(x,-.8,1),.4,.035,gold);o.rotation_euler=(math.pi/2,0,-x*.8)
   ball('cymbal boss',(x,-.85,1),(.1,.065,.1),gold)
parent=None
cyl('island',(0,0,-.28),1,.45,sea).scale=(9.3,5.7,1)
cyl('turquoise rim',(0,0,-.48),1,.10,rim).scale=(9.4,5.8,1)
for i in range(10):
 o=cyl('podium_'+names[i],(spot(i)[0],spot(i)[1],.02),1.13,.18,cream)
world=bpy.context.scene.world;world.color=(.06,.12,.17)
for name,pos,power,size in [('key',(2,-8,12),1800,8),('fill',(-7,-2,8),1000,7),('rim',(3,7,10),1700,6)]:
 bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,0,0))-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(9,-18,14));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,.5))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=21;bpy.context.scene.camera=cam
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24;scene.render.resolution_x=1440;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.055,.15,.2,1)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'blender','moko-band.blend'))
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'dist','assets','moko-band.glb'),export_format='GLB',export_cameras=False,export_lights=False)
scene.render.filepath=os.path.join(ROOT,'blender','band-preview.png');bpy.ops.render.render(write_still=True)

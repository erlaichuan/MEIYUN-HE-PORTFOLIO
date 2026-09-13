import assert from 'node:assert/strict'
import { Box3, Mesh, Vector3 } from 'three'
import { createSideboardPropsModel, disposeSideboardProps } from '../src/scene/sideboardPropsModel.ts'

const model=createSideboardPropsModel()
model.updateMatrixWorld(true)
let triangles=0,drawCalls=0
const names=new Set()
model.traverse(part=>{
  if(!(part instanceof Mesh)) return
  assert(part.name && !names.has(part.name),`Missing or duplicate part name: ${part.name}`)
  names.add(part.name)
  const geometry=part.geometry
  assert([...geometry.attributes.position.array].every(Number.isFinite),`${part.name}: invalid vertices`)
  assert([...geometry.attributes.normal.array].every(Number.isFinite),`${part.name}: invalid normals`)
  const count=part.isInstancedMesh?part.count:1
  triangles+=(geometry.index?geometry.index.count:geometry.attributes.position.count)/3*count
  drawCalls++
})
const bounds=model.children.map(part=>{
  const box=new Box3().setFromObject(part)
  assert(Math.abs(box.min.y-.3)<1e-5,`${part.name}: base is not on cabinet top`)
  assert(box.min.x>=-7.468 && box.max.x<=-4.492,`${part.name}: exceeds cabinet width`)
  assert(box.min.z>=-2.736 && box.max.z<=-1.424,`${part.name}: exceeds cabinet depth`)
  return {name:part.name,box,size:box.getSize(new Vector3()).toArray()}
})
for(let i=0;i<bounds.length;i++) for(let j=i+1;j<bounds.length;j++) {
  assert(!bounds[i].box.intersectsBox(bounds[j].box),`${bounds[i].name} overlaps ${bounds[j].name}`)
}
assert(triangles<=14000,`Triangle budget exceeded: ${triangles}`)
assert(drawCalls<=32,`Draw call budget exceeded: ${drawCalls}`)
const shade=model.getObjectByName('LampDomeShade')
const shadePos=shade.geometry.attributes.position
const shadeNormal=shade.geometry.attributes.normal
assert(shadePos.getX(0)*shadeNormal.getX(0)+shadePos.getZ(0)*shadeNormal.getZ(0)>0,'Shade exterior normal points inward')
console.log(JSON.stringify({status:'pass',triangles,drawCalls,bounds:bounds.map(({name,box,size})=>({name,min:box.min.toArray(),max:box.max.toArray(),size}))},null,2))
disposeSideboardProps(model)

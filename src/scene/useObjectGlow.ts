import { useLayoutEffect, useRef, type RefObject } from 'react'
// Three.js objects are mutable renderer resources, not React state or immutable props.
/* oxlint-disable react/immutability */
import { useFrame, useThree } from '@react-three/fiber'
import { AdditiveBlending, Box3, CanvasTexture, Color, Group, Material, MathUtils, Mesh, MeshStandardMaterial, Sprite, SpriteMaterial, Vector3 } from 'three'
const warm = new Color('#efc58a')

/** Each target owns its material copies; hovering a drawer never lights the whole cabinet. */
export function useObjectGlow(root: RefObject<Group | null>, active: boolean) {
  const glow = useRef<{ materials: { material: MeshStandardMaterial; color: Color; intensity: number }[]; halo: Sprite } | null>(null)
  const level = useRef(0)
  const invalidate = useThree(state => state.invalidate)
  useLayoutEffect(() => {
    const group = root.current
    if (!group) return
    group.userData.navigationTarget = true
    const originals: { mesh: Mesh; material: Material | Material[] }[] = []
    const materials: { material: MeshStandardMaterial; color: Color; intensity: number }[] = []
    const visit = (object: Group | Mesh | import('three').Object3D) => {
      if (object !== group && object.userData.navigationTarget) return
      if (object instanceof Mesh) {
        originals.push({ mesh: object, material: object.material })
        const copy = (original: Material) => {
          const material = original.clone()
          if (material instanceof MeshStandardMaterial) materials.push({material, color:material.emissive.clone(), intensity:material.emissiveIntensity})
          return material
        }
        object.material = Array.isArray(object.material) ? object.material.map(copy) : copy(object.material)
      }
      object.children.forEach(visit)
    }
    visit(group)
    group.updateWorldMatrix(true, true)
    const bounds = new Box3().setFromObject(group)
    const center = group.worldToLocal(bounds.getCenter(new Vector3()))
    const worldScale = group.getWorldScale(new Vector3())
    const diameter = bounds.getSize(new Vector3()).length() / Math.max(.001, worldScale.x)
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 64
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(32,32,4,32,32,32)
    gradient.addColorStop(0, 'rgba(255,215,148,.65)')
    gradient.addColorStop(.5, 'rgba(255,215,148,.25)')
    gradient.addColorStop(1, 'rgba(255,215,148,0)')
    ctx.fillStyle=gradient; ctx.fillRect(0,0,64,64)
    const texture = new CanvasTexture(canvas)
    const halo = new Sprite(new SpriteMaterial({map:texture, transparent:true, opacity:0, blending:AdditiveBlending, depthWrite:false, depthTest:false}))
    halo.name='NavigationHoverGlow'; halo.position.copy(center); halo.scale.setScalar(diameter * 1.12)
    halo.raycast=()=>{}; group.add(halo)
    glow.current={materials,halo}
    return () => {
      glow.current=null
      for (const {mesh,material} of originals) {
        const copies=Array.isArray(mesh.material)?mesh.material:[mesh.material]
        copies.forEach(copy=>copy.dispose()); mesh.material=material
      }
      group.remove(halo); halo.material.dispose(); texture.dispose()
      delete group.userData.navigationTarget
    }
  }, [root])
  useFrame((_,delta) => {
    if (!glow.current) return
    const target=active?1:0
    if (level.current===target) return
    level.current=MathUtils.damp(level.current,target,12,delta)
    if (Math.abs(level.current-target)<.001) level.current=target
    for (const {material,color,intensity} of glow.current.materials) {
      material.emissive.copy(color).lerp(warm,level.current*.38)
      material.emissiveIntensity=intensity+level.current*.22
    }
    glow.current.halo.material.opacity=level.current*.3
    if(level.current!==target) invalidate()
  })
}

import * as THREE from 'three'

/** Photo-derived proportions; meters are not claimed. All bases start at local Y=0. */
export const SIDEBOARD_PROP_LAYOUT = {
  lamp: [-6.84, .30, -2.05],
  vase: [-5.64, .30, -2.12],
  cup: [-5.00, .30, -1.76],
} as const

type Profile = readonly (readonly [number, number])[]
const TAU = Math.PI * 2

function lathe(profile: Profile, segments = 40) {
  return new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments)
}

function part(parent: THREE.Group, name: string, geometry: THREE.BufferGeometry, material: THREE.Material,
  position: readonly number[] = [0, 0, 0]) {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = name
  mesh.position.set(position[0], position[1], position[2])
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.userData.explodeWithParent = true
  parent.add(mesh)
  return mesh
}

function tube(points: readonly (readonly number[])[], radius: number, segments = 24) {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(p[0], p[1], p[2]))), segments, radius, 6, false)
}

/** Analytic pigment only: no raster assets, copied shadows, extra meshes or animation work. */
function ceramicPattern(kind: 'waves' | 'weave') {
  const mat = new THREE.MeshPhysicalMaterial({ color: '#f4ead1', roughness: .29, metalness: 0, clearcoat: .3, clearcoatRoughness: .25 })
  mat.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vPotPosition;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPotPosition = position;')
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vPotPosition;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        float potAngle = atan(vPotPosition.x, vPotPosition.z);
        float pigment = 0.0;
        ${kind === 'waves' ? `
          float phase = potAngle * 16.0 + 0.65 * sin(vPotPosition.y * 39.0 + potAngle * 2.0);
          float wave = abs(sin(phase * 0.5));
          float aa = max(fwidth(wave), 0.015);
          pigment = (1.0 - smoothstep(0.19-aa, 0.19+aa, wave)) * step(0.035, vPotPosition.y) * (1.0-step(0.91, vPotPosition.y));
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.22,0.39,0.115), pigment * 0.92);
        ` : `
          vec2 cell = vec2(potAngle / 6.2831853 * 36.0, vPotPosition.y * 48.0);
          vec2 grid = fract(cell);
          vec2 aa = max(fwidth(cell), vec2(0.035));
          float across = smoothstep(0.12-aa.y,0.12+aa.y,grid.y) * (1.0-smoothstep(0.45-aa.y,0.45+aa.y,grid.y));
          float down = smoothstep(0.12-aa.x,0.12+aa.x,grid.x) * (1.0-smoothstep(0.45-aa.x,0.45+aa.x,grid.x));
          pigment = mix(across,down,mod(floor(cell.x)+floor(cell.y),2.0));
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.60,0.29,0.075), pigment * 0.9);
        `}`)
  }
  mat.customProgramCacheKey = () => `sideboard-ceramic-${kind}-1`
  return mat
}

export function createSideboardPropsModel() {
  const root = new THREE.Group()
  root.name = 'SideboardPhotoProps'
  const red = new THREE.MeshPhysicalMaterial({ color: '#c93412', roughness: .22, metalness: 0, clearcoat: .65, clearcoatRoughness: .18 })
  const ivory = new THREE.MeshPhysicalMaterial({ color: '#f4ead1', roughness: .29, clearcoat: .3, clearcoatRoughness: .25 })
  const gold = new THREE.MeshStandardMaterial({ color: '#bf863e', roughness: .35, metalness: .25 })
  const waves = ceramicPattern('waves')
  const weave = ceramicPattern('weave')
  const lamp = new THREE.Group()
  lamp.name = 'RedDomeLamp'
  lamp.position.set(...SIDEBOARD_PROP_LAYOUT.lamp)
  root.add(lamp)

  part(lamp, 'LampRoundedBase', lathe([[0,0],[.29,0],[.337,.012],[.345,.027],[.335,.065],[.32,.092],[.285,.116],[.22,.126],[0,.126]]), red)
  part(lamp, 'LampLowerCollar', new THREE.CylinderGeometry(.032,.032,.075,16), red, [0,.145,0])
  part(lamp, 'LampStem', new THREE.CylinderGeometry(.021,.021,.98,16), red, [0,.65,0])
  part(lamp, 'LampUpperCollar', new THREE.CylinderGeometry(.032,.032,.075,16), red, [0,1.13,0])
  part(lamp, 'LampBulbHousing', lathe([[0,1.158],[.058,1.158],[.082,1.173],[.087,1.215],[.087,1.325],[0,1.325]],32),red)
  // Internal shade carrier joins the housing to the dome apex, not a floating shell.
  part(lamp, 'LampShadeCarrier', new THREE.CylinderGeometry(.023,.023,.39,12),red,[0,1.495,0])
  const dome: [number,number][] = []
  // Outer equator -> apex -> inner apex -> inner equator -> outer equator.
  // Reversed profile ensures outward normals on the external dome.
  for (let i=0;i<=16;i++) {
    const t=i/16*Math.PI/2
    dome.push([.49*Math.cos(t),1.25+.445*Math.sin(t)])
  }
  for (let i=16;i>=0;i--) {
    const t=i/16*Math.PI/2
    dome.push([.478*Math.cos(t),1.25+.432*Math.sin(t)])
  }
  dome.push([.49,1.25])
  part(lamp,'LampDomeShade',lathe(dome,44),red)
  part(lamp,'LampApexFinial',new THREE.SphereGeometry(.025,12,8),red,[0,1.695,0])

  const vase = new THREE.Group()
  vase.name = 'GreenWavePitcher'
  vase.position.set(...SIDEBOARD_PROP_LAYOUT.vase)
  root.add(vase)
  part(vase,'PitcherBody',lathe([[0,0],[.165,0],[.19,.008],[.202,.027],[.20,.085],[.18,.30],[.15,.58],[.119,.84],[.116,.905]],48),waves)
  const mouth = lathe([[.116,.88],[.12,.915],[.175,.98],[.235,1.045],[.235,1.054],[.22,1.054],[.159,.98],[.105,.917],[.103,.88]],48)
  const pos=mouth.getAttribute('position')
  for(let i=0;i<pos.count;i++) {
    const flare=THREE.MathUtils.smoothstep(pos.getY(i),.915,1.054)
    const spout=Math.pow(Math.max(0,pos.getX(i)/.235),4)*flare
    pos.setX(i,pos.getX(i)+spout*.095)
    pos.setY(i,pos.getY(i)+spout*.015)
  }
  mouth.computeVertexNormals()
  part(vase,'PitcherFlaredLip',mouth,ivory)
  part(vase,'PitcherInterior',lathe([[.103,.905],[.112,.83],[.145,.57],[.177,.28],[.18,.045],[0,.045]],40),ivory)
  part(vase,'PitcherRedHandle',tube([[-.146,.968,0],[-.34,.90,0],[-.49,.72,0],[-.50,.53,0],[-.39,.34,0],[-.18,.22,0]],.021,32),red)

  // Four small blooms retain the bouquet silhouette; shared geometry/materials keep it cheap.
  const stems = new THREE.MeshStandardMaterial({color:'#465b23',roughness:.83})
  const petals = new THREE.MeshStandardMaterial({color:'#9e215e',roughness:.62})
  const centers = new THREE.MeshStandardMaterial({color:'#73822a',roughness:.83})
  const petalGeo = new THREE.SphereGeometry(1,8,5)
  const flowerData = [[-.16,1.31,.015],[.04,1.43,-.035],[.18,1.30,.005],[-.015,1.235,.09]]
  const petalMesh = new THREE.InstancedMesh(petalGeo,petals,48)
  petalMesh.name='BouquetPetals'
  petalMesh.castShadow=true
  petalMesh.receiveShadow=true
  const matrix = new THREE.Object3D()
  const flowerRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(-.40,0,0))
  flowerData.forEach(([x,y,z],j)=>{
    part(vase,`FlowerStem${j}`,tube([[j*.008,.81,0],[x*.35,1.03,z*.3],[x,y,z]],.008,10),stems)
    const bloom=part(vase,`FlowerCenter${j}`,new THREE.SphereGeometry(.033,10,6),centers,[x,y,z])
    bloom.scale.z=.42
    bloom.quaternion.copy(flowerRotation)
    for(let i=0;i<12;i++) {
      const angle=i/12*TAU+j*.17
      const offset=new THREE.Vector3(Math.sin(angle)*.064,Math.cos(angle)*.064,0).applyQuaternion(flowerRotation)
      matrix.position.set(x+offset.x,y+offset.y,z+offset.z)
      matrix.quaternion.copy(flowerRotation).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),-angle))
      matrix.scale.set(.018,.063,.013)
      matrix.updateMatrix()
      petalMesh.setMatrixAt(j*12+i,matrix.matrix)
    }
  })
  vase.add(petalMesh)

  const tea = new THREE.Group()
  tea.name='WovenCupAndSaucer'
  tea.position.set(...SIDEBOARD_PROP_LAYOUT.cup)
  root.add(tea)
  part(tea,'TeaSaucer',lathe([[0,0],[.14,0],[.20,.011],[.264,.029],[.285,.044],[.286,.052],[.28,.057],[.24,.047],[.175,.024],[0,.024]],48),ivory)
  const rim=part(tea,'SaucerGoldRim',new THREE.TorusGeometry(.281,.0035,6,48),gold,[0,.053,0])
  rim.rotation.x=Math.PI/2
  part(tea,'TeacupPatternedWall',lathe([[0,.024],[.138,.024],[.153,.035],[.16,.062],[.166,.287],[.165,.296]],48),weave)
  part(tea,'TeacupInnerWall',lathe([[.165,.296],[.153,.296],[.15,.07],[.138,.05],[0,.05]],48),ivory)
  const cupRim=part(tea,'TeacupGoldRim',new THREE.TorusGeometry(.16,.004,6,48),gold,[0,.296,0])
  cupRim.rotation.x=Math.PI/2
  part(tea,'TeacupHandle',tube([[.158,.26,0],[.23,.277,0],[.263,.231,0],[.24,.155,0],[.161,.084,0]],.012,22),ivory)

  root.userData.source='User photos: red dome lamp; green-striped pitcher, cup and saucer'
  root.userData.quality='Approximate lightweight procedural reconstruction; hidden sides simplified'
  root.userData.parts=[lamp.name,vase.name,tea.name]
  return root
}

export function disposeSideboardProps(root: THREE.Group) {
  const geometries=new Set<THREE.BufferGeometry>()
  const materials=new Set<THREE.Material>()
  root.traverse(object=>{
    if(!(object instanceof THREE.Mesh)) return
    geometries.add(object.geometry)
    for(const material of Array.isArray(object.material)?object.material:[object.material]) materials.add(material)
  })
  geometries.forEach(geometry=>geometry.dispose())
  materials.forEach(material=>material.dispose())
}

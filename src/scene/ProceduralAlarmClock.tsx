import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { ExtrudeGeometry, Object3D, Shape, type Group, type InstancedMesh } from 'three'

function ClockTicks() {
  const mesh = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const target = mesh.current
    if (!target) return
    const object = new Object3D()
    for (let index = 0; index < 60; index += 1) {
      const angle = (index / 60) * Math.PI * 2
      const major = index % 5 === 0
      const radius = major ? .252 : .266
      object.position.set(Math.sin(angle) * radius, Math.cos(angle) * radius, .096)
      object.rotation.set(0, 0, -angle)
      object.scale.set(major ? .03 : .012, major ? .09 : .045, .014)
      object.updateMatrix()
      target.setMatrixAt(index, object.matrix)
    }
    target.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <instancedMesh ref={mesh} name="AlarmClock_TickMarks" args={[undefined, undefined, 60]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#11110f" roughness={.62} />
    </instancedMesh>
  )
}

function ClockHand({ name, angle, length, width, z }: { name: string; angle: number; length: number; width: number; z: number }) {
  return (
    <group name={name} rotation={[0, 0, -angle]}>
      <mesh position={[0, length * .5, z]} castShadow>
        <boxGeometry args={[width, length, .026]} />
        <meshPhysicalMaterial color="#b81f20" roughness={.3} metalness={.12} clearcoat={.45} clearcoatRoughness={.24} />
      </mesh>
      <mesh position={[0, length + .015, z]} castShadow>
        <coneGeometry args={[width * 1.7, .085, 4]} />
        <meshPhysicalMaterial color="#b81f20" roughness={.3} metalness={.12} clearcoat={.45} />
      </mesh>
      <mesh position={[0, -.07, z]} rotation={[0, 0, Math.PI]} castShadow>
        <coneGeometry args={[width * 1.45, .095, 4]} />
        <meshStandardMaterial color="#b81f20" roughness={.36} metalness={.08} />
      </mesh>
    </group>
  )
}

function AnimatedClockHands() {
  const minute = useRef<Group>(null)
  const second = useRef<Group>(null)
  const invalidate = useThree((state) => state.invalidate)

  // 主场景静止时采用 demand 渲染；用 20fps 的轻量 tick 唤醒时针动画。
  useEffect(() => {
    const timer = window.setInterval(invalidate, 50)
    return () => window.clearInterval(timer)
  }, [invalidate])

  useFrame(() => {
    const now = new Date()
    const seconds = now.getSeconds() + now.getMilliseconds() / 1000
    const minutes = now.getMinutes() + seconds / 60
    if (minute.current) minute.current.rotation.z = -(minutes / 60) * Math.PI * 2
    if (second.current) second.current.rotation.z = -(seconds / 60) * Math.PI * 2
  })

  return (
    <>
      <group ref={minute} name="AlarmClock_AnimatedMinute">
        <ClockHand name="AlarmClock_MinuteHand" angle={0} length={.245} width={.022} z={.142} />
      </group>
      <group ref={second} name="AlarmClock_AnimatedSecond">
        <ClockHand name="AlarmClock_SecondHand" angle={0} length={.27} width={.009} z={.151} />
      </group>
    </>
  )
}

export default function ProceduralAlarmClock() {
  const standGeometry = useMemo(() => {
    const shape = new Shape()
    shape.moveTo(-.28, 0)
    shape.lineTo(.28, 0)
    shape.lineTo(.18, .19)
    shape.lineTo(-.18, .19)
    shape.closePath()
    const geometry = new ExtrudeGeometry(shape, { depth: .13, bevelEnabled: true, bevelSize: .014, bevelThickness: .012, bevelSegments: 2 })
    geometry.translate(0, 0, -.065)
    return geometry
  }, [])
  useEffect(() => () => standGeometry.dispose(), [standGeometry])

  return (
    <group name="ProceduralAlarmClock" position={[-1.54, 2.29, -.12]} rotation={[0, -.035, 0]} scale={0.78}>
      <mesh name="AlarmClock_Stand" geometry={standGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial color="#df2528" roughness={.28} metalness={.14} clearcoat={.6} clearcoatRoughness={.22} />
      </mesh>

      <group name="AlarmClock_Body" position={[0, .49, 0]}>
        <mesh name="AlarmClock_RedShell" rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[.37, .37, .145, 40]} />
          <meshPhysicalMaterial color="#df2528" roughness={.27} metalness={.15} clearcoat={.68} clearcoatRoughness={.2} />
        </mesh>
        <mesh name="AlarmClock_RearCap" position={[0, 0, -.07]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[.34, .36, .035, 40]} />
          <meshStandardMaterial color="#a8171b" roughness={.46} metalness={.12} />
        </mesh>
        <mesh name="AlarmClock_Dial" position={[0, 0, .082]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
          <cylinderGeometry args={[.315, .315, .018, 40]} />
          <meshPhysicalMaterial color="#f2efe4" roughness={.5} clearcoat={.12} clearcoatRoughness={.38} />
        </mesh>
        <mesh name="AlarmClock_Rim" position={[0, 0, .101]} castShadow>
          <torusGeometry args={[.325, .031, 10, 40]} />
          <meshPhysicalMaterial color="#ef3033" roughness={.25} metalness={.14} clearcoat={.72} clearcoatRoughness={.18} />
        </mesh>

        <ClockTicks />

        <group name="AlarmClock_BrandMark" position={[0, .105, .115]}>
          {[-.075, -.045, -.015, .015, .045, .075].map((x, index) => (
            <mesh key={x} position={[x, index % 2 ? 0 : .006, 0]}>
              <boxGeometry args={[.016, .045, .008]} />
              <meshStandardMaterial color="#181816" roughness={.6} />
            </mesh>
          ))}
        </group>

        <ClockHand name="AlarmClock_HourHand" angle={Math.PI / 3} length={.18} width={.035} z={.132} />
        <AnimatedClockHands />

        <mesh name="AlarmClock_HubBack" position={[0, 0, .139]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[.052, .052, .025, 20]} />
          <meshStandardMaterial color="#aeb1ae" roughness={.22} metalness={.66} />
        </mesh>
        <mesh name="AlarmClock_Hub" position={[0, 0, .158]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[.039, .039, .028, 20]} />
          <meshPhysicalMaterial color="#b91d20" roughness={.26} metalness={.2} clearcoat={.52} />
        </mesh>

        <mesh name="AlarmClock_Glass" position={[0, 0, .17]}>
          <circleGeometry args={[.31, 40]} />
          <meshPhysicalMaterial color="#fffdf4" transparent opacity={.055} roughness={.08} clearcoat={1} clearcoatRoughness={.05} depthWrite={false} />
        </mesh>
      </group>
    </group>
  )
}

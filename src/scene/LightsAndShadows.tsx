import { ContactShadows } from '@react-three/drei'
import { useMemo } from 'react'
import { Object3D } from 'three'

/**
 * 灯光与阴影。
 *
 * 参考参考的光照特征：
 * - 整体高调、近乎无环境色偏，柜面是浅蓝烤漆，高光柔而宽；
 * - 主光来自**左上前方**，柜体右下有一片明显的落地投影；
 * - 蓝色柜腔不是一块死平面，深处更暗、隔板下缘有接触遮蔽。
 *
 * 因此这里让台灯成为唯一的视觉主光；低强度环境光只负责保留暗部细节，
 * 落地阴影交给 drei 的 ContactShadows（渲染到透明平面，画布保持透明，
 * 页面底色仍由 CSS 提供，不用在 3D 里再铺一层白地板）。
 */
export default function LightsAndShadows({ dynamic = false }: { dynamic?: boolean }) {
  const lampTarget = useMemo(() => new Object3D(), [])

  return (
    <>
      <ambientLight color="#ffe5c4" intensity={0.43} />
      <hemisphereLight args={['#fff0d8', '#6b493d', 0.48]} />

      {/* 台灯主光：暖黄光束压向文件柜、键盘和桌面中央。 */}
      <primitive object={lampTarget} position={[-0.5, 0.22, 0.42]} />
      <spotLight
        name="Lamp_Key_Spot"
        target={lampTarget}
        castShadow
        position={[2.96, 1.62, -0.68]}
        color="#ffd08a"
        intensity={128}
        distance={10}
        decay={2}
        angle={1.05}
        penumbra={0.92}
        shadow-mapSize={[1536, 1536]}
        shadow-radius={8}
        shadow-bias={-0.0007}
        shadow-normalBias={0.018}
      />
      <pointLight
        name="Lamp_Bulb_Glow"
        position={[2.96, 1.62, -0.68]}
        color="#ffc56f"
        intensity={20}
        distance={5.8}
        decay={2}
      />

      <pointLight
        name="CRT_Fill"
        position={[1.11, 1.38, 0.18]}
        color="#a6c8bb"
        intensity={1.7}
        distance={3}
        decay={2}
      />
      {/* 覆盖整间房的柔和补光同时提供宽幅阴影，桌、椅与桌下物件都落在投影范围内。 */}
      <directionalLight
        name="Room_Soft_Fill"
        castShadow
        position={[-4.5, 6.8, 7.5]}
        color="#ffe0b5"
        intensity={0.42}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-5}
        shadow-camera-near={0.5}
        shadow-camera-far={22}
        shadow-radius={7}
        shadow-bias={-0.0006}
        shadow-normalBias={0.022}
      />

      <ContactShadows
        position={[0, 0.012, 0.12]}
        scale={[9.2, 4.8]}
        resolution={768}
        blur={3.25}
        far={2.2}
        opacity={0.38}
        color="#3d2118"
        frames={dynamic ? Infinity : 1}
      />
      <ContactShadows
        position={[0, -2.325, 0.3]}
        scale={[10.5, 7.2]}
        resolution={512}
        blur={4.4}
        far={4.8}
        opacity={0.24}
        color="#3b261e"
        frames={dynamic ? Infinity : 1}
      />
    </>
  )
}

import { useEffect, useState } from 'react'
import { createSideboardPropsModel, disposeSideboardProps } from './sideboardPropsModel'

export default function SideboardPhotoProps() {
  const [model] = useState(createSideboardPropsModel)
  useEffect(() => () => disposeSideboardProps(model), [model])
  return <primitive object={model} dispose={null} />
}

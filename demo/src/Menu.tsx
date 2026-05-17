import { Menubar } from './Menubar'
import { MenuButton } from './MenuButton'
import type { MenuProps } from './menuTypes'

export type { MenuProps } from './menuTypes'

export function Menu(props: MenuProps) {
  const flavor = props.data.state?.apgPattern === 'menu-button' ? 'menu-button' : 'menubar'
  if (flavor === 'menubar') return <Menubar {...props} />
  return <MenuButton {...props} />
}

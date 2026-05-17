import { Menubar } from './Menubar'
import { MenuButton } from './MenuButton'
import type { MenuProps } from './menuTypes'

export type { MenuProps } from './menuTypes'

export function Menu(props: MenuProps) {
  const flavor = props.flavor ?? props.apgPattern ?? 'menubar'
  if (flavor === 'menubar') return <Menubar {...props} flavor={flavor} />
  return <MenuButton {...props} />
}

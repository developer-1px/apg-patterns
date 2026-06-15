import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import type { Key, PatternData } from '../../schema'

type MenuItemRole = 'menuitem' | 'menuitemcheckbox' | 'menuitemradio'

export function withMenuItemRoleProps(props: ReactPatternProps, data: PatternData, key: Key): ReactPatternProps {
  const role = resolveMenuItemRole(data, key)
  if (role === 'menuitem') return { ...props, role }
  return { ...props, role, 'aria-checked': Boolean(data.state?.checkedByKey?.[key]) }
}

function resolveMenuItemRole(data: PatternData, key: Key): MenuItemRole {
  const kind = data.items[key]?.kind
  if (kind === 'menuitem' || kind === 'menuitemcheckbox' || kind === 'menuitemradio') return kind
  return Object.prototype.hasOwnProperty.call(data.state?.checkedByKey ?? {}, key) ? 'menuitemcheckbox' : 'menuitem'
}

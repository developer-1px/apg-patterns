import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import type { Key, PatternData } from '../../schema'

export function withMenuItemRoleProps(props: ReactPatternProps, data: PatternData, key: Key): ReactPatternProps {
  const kind = data.items[key]?.kind
  const role = kind === 'menuitem' || kind === 'menuitemcheckbox' || kind === 'menuitemradio'
    ? kind
    : Object.prototype.hasOwnProperty.call(data.state?.checkedByKey ?? {}, key) ? 'menuitemcheckbox' : 'menuitem'
  if (role === 'menuitem') return { ...props, role }
  return { ...props, role, 'aria-checked': Boolean(data.state?.checkedByKey?.[key]) }
}

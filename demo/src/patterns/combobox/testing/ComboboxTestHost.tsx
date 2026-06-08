import { usePatternDataHost } from '../../../shared/demoHostState'
import { Combobox } from '../Combobox'
import { buildComboboxData, reduceComboboxData } from '../comboboxData'

type ComboboxDemoVariant = 'selectOnly' | 'listAutocomplete' | 'listWithInlineAutocomplete' | 'datepicker' | 'gridPopup'

export function ComboboxDemo({ variant = 'listAutocomplete' }: { variant?: ComboboxDemoVariant }) {
  const host = usePatternDataHost(buildComboboxData(undefined, variant), reduceComboboxData)
  return <Combobox data={host.data} onEvent={host.dispatchEvent} />
}

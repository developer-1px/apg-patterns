import { useState } from 'react'
import type { PatternData, PatternEvent } from '../../../../../src/react'
import { Combobox } from '../Combobox'
import { buildComboboxData, reduceComboboxData } from '../comboboxData'

type ComboboxDemoVariant = 'selectOnly' | 'listAutocomplete' | 'listWithInlineAutocomplete' | 'datepicker' | 'gridPopup'

export function ComboboxDemo({ variant = 'listAutocomplete' }: { variant?: ComboboxDemoVariant }) {
  const [data, setData] = useState<PatternData>(() => buildComboboxData(undefined, variant))
  const handleEvent = (event: PatternEvent) => setData((current) => reduceComboboxData(current, event))
  return <Combobox data={data} onEvent={handleEvent} />
}

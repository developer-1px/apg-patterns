import { usePatternDataHost } from '../../../shared/demoHostState'
import {
  ListboxPreview,
  listboxDemoOptions,
  listboxPreviewData,
  listboxVariants,
  reduceListboxDemoData,
  type ListboxVariantKey,
} from '../listboxDemoRuntime'

export function ListboxDemo({ variant = 'basic' }: { variant?: ListboxVariantKey }) {
  const host = usePatternDataHost(listboxVariants[variant].data, reduceListboxDemoData)
  const options = listboxDemoOptions(variant)
  const data = listboxPreviewData(variant, host.data)
  return <ListboxPreview variant={variant} data={data} onEvent={host.dispatchEvent} options={options} />
}

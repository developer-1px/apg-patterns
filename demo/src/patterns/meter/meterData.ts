import { PatternDataSchema, type PatternData, type PatternOptions } from '../../../../src'

// Each variant maps to a common APG meter scenario.
//   - disk:    Disk usage percentage (0–100, percent valuetext)
//   - battery: Battery charge level (0–100, percent valuetext)
//   - cpu:     CPU load with per-item range override
//   - storage: Storage (GB used / GB total, custom valuetext)

export type MeterVariantKey = 'disk' | 'battery' | 'cpu' | 'storage'

const pctText = (n: number) => `${n}%`

const diskData = (): PatternData =>
  PatternDataSchema.parse({
    items: { disk: { label: 'Disk usage', valuetext: pctText(72) } },
    relations: { rootKeys: ['disk'] },
    state: { valueByKey: { disk: 72 } },
  })

const batteryData = (): PatternData =>
  PatternDataSchema.parse({
    items: { battery: { label: 'Battery level', valuetext: pctText(35) } },
    relations: { rootKeys: ['battery'] },
    state: { valueByKey: { battery: 35 } },
  })

const cpuData = (): PatternData =>
  PatternDataSchema.parse({
    items: { cpu: { label: 'CPU load', valuemin: 0, valuemax: 100, valuetext: pctText(48) } },
    relations: { rootKeys: ['cpu'] },
    state: { valueByKey: { cpu: 48 } },
  })

const storageData = (): PatternData =>
  PatternDataSchema.parse({
    items: { storage: { label: 'Storage', valuetext: '180 GB of 256 GB used' } },
    relations: { rootKeys: ['storage'] },
    state: { valueByKey: { storage: 180 } },
  })

export interface MeterVariant {
  key: MeterVariantKey
  label: string
  data: PatternData
  options: PatternOptions
}

const withOptions = (data: PatternData, options: PatternOptions): PatternData => ({
  ...data,
  state: { ...data.state, options },
})

export const meterVariants: Record<MeterVariantKey, MeterVariant> = {
  disk: { key: 'disk', label: 'Disk Usage', options: { min: 0, max: 100 }, data: withOptions(diskData(), { min: 0, max: 100 }) },
  battery: { key: 'battery', label: 'Battery', options: { min: 0, max: 100 }, data: withOptions(batteryData(), { min: 0, max: 100 }) },
  cpu: { key: 'cpu', label: 'CPU Load', options: { min: 0, max: 100 }, data: withOptions(cpuData(), { min: 0, max: 100 }) },
  storage: { key: 'storage', label: 'Storage', options: { min: 0, max: 256 }, data: withOptions(storageData(), { min: 0, max: 256 }) },
}

export const meterVariantItems = Object.values(meterVariants).map((v) => ({ key: v.key, label: v.label }))

// Back-compat — simple single-meter exports.
export const initialMeterData = meterVariants.disk.data
export const meterOptions: PatternOptions = { min: 0, max: 100 }

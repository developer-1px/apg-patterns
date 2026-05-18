import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { AccordionDefinitionSchema } from '../patterns/accordion/definition'
import { AlertDialogDefinitionSchema } from '../patterns/alertdialog/definition'
import { BreadcrumbDefinitionSchema } from '../patterns/breadcrumb/definition'
import { CarouselDefinitionSchema } from '../patterns/carousel/definition'
import { DialogDefinitionSchema } from '../patterns/dialog/definition'
import { DisclosureDefinitionSchema } from '../patterns/disclosure/definition'
import { TabsDefinitionSchema } from '../patterns/tabs/definition'
import { ToolbarDefinitionSchema } from '../patterns/toolbar/definition'
import { TooltipDefinitionSchema } from '../patterns/tooltip/definition'
import { TreeviewDefinitionSchema } from '../patterns/treeview/definition'
import { getComboboxRuntimeState } from '../patterns/combobox/comboboxRuntimeState'
import { getCheckboxRuntimeState } from '../patterns/checkbox/checkboxRuntimeState'
import { getRadioGroupRuntimeState } from '../patterns/radio/radioGroupRuntimeState'
import { getSwitchRuntimeState } from '../patterns/switch/switchRuntimeState'
import { getToolbarRuntimeState } from '../patterns/toolbar/toolbarRuntimeState'

const malformedDefinition = {
  apgPattern: 'wrong',
  rootRole: 'button',
  containedRoles: [],
  parts: {},
  navigation: { visibleOrder: { kind: 'flat' }, targets: {} },
  keyboard: [],
}

function issueCount(parse: () => unknown) {
  try {
    parse()
    return 0
  } catch (error) {
    return (error as { issues?: unknown[] }).issues?.length ?? -1
  }
}

function DefinitionSchemaHost() {
  const [result, setResult] = useState('')

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setResult([
            issueCount(() => AlertDialogDefinitionSchema.parse(malformedDefinition)),
            issueCount(() => CarouselDefinitionSchema.parse(malformedDefinition)),
            issueCount(() => DialogDefinitionSchema.parse(malformedDefinition)),
            issueCount(() => ToolbarDefinitionSchema.parse(malformedDefinition)),
            issueCount(() => BreadcrumbDefinitionSchema.parse(malformedDefinition)),
            issueCount(() => AccordionDefinitionSchema.parse(malformedDefinition)),
            issueCount(() => TabsDefinitionSchema.parse(malformedDefinition)),
            issueCount(() => TreeviewDefinitionSchema.parse(malformedDefinition)),
            issueCount(() => DisclosureDefinitionSchema.parse(malformedDefinition)),
            issueCount(() => TooltipDefinitionSchema.parse(malformedDefinition)),
          ].join('|'))
        }}
      >
        Parse malformed definitions
      </button>
      <button
        type="button"
        onClick={() => {
          const checkbox = getCheckboxRuntimeState({ items: {}, relations: {}, state: {} })
          const radio = getRadioGroupRuntimeState({ items: {}, relations: {}, state: {} })
          const switchState = getSwitchRuntimeState({ items: {}, relations: {}, state: {} })
          const toolbar = getToolbarRuntimeState({ items: {}, relations: {}, state: {} })
          const combobox = getComboboxRuntimeState({
            items: { combobox: { label: 'Choose' }, selected: {} },
            relations: {},
            state: { selectedKeys: ['selected'] },
          })
          setResult([
            checkbox.activeKey ?? 'null',
            Object.keys(checkbox.checkedByKey).length,
            checkbox.disabledKeys.length,
            radio.activeKey ?? 'null',
            radio.selectedKeys.length,
            radio.disabledKeys.length,
            switchState.activeKey ?? 'null',
            Object.keys(switchState.checkedByKey).length,
            switchState.disabledKeys.length,
            toolbar.activeKey ?? 'null',
            toolbar.selectedKeys.length,
            toolbar.disabledKeys.length,
            combobox.listboxId,
            combobox.displayValue,
            combobox.label,
          ].join('|'))
        }}
      >
        Read empty runtime state
      </button>
      <output>{result}</output>
    </div>
  )
}

describe('definition schema coverage from pointer input', () => {
  it('covers malformed schema branches and empty runtime-state fallbacks from clicks', () => {
    render(<DefinitionSchemaHost />)

    fireEvent.click(screen.getByRole('button', { name: 'Parse malformed definitions' }))
    expect(screen.getByText('7|7|7|5|5|6|7|6|4|4')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Read empty runtime state' }))
    expect(screen.getByText('null|0|0|null|0|0|null|0|0|null|0|0|combobox-popup||Choose')).toBeTruthy()
  })
})

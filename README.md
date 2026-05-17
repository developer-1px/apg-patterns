# @interactive-os/apg-treeview-contract

Zod-validated APG treeview MVP.

```txt
MVP
├─ single data interface
├─ single PatternEvent union
├─ serialized keyboard binding using aria-keyshortcuts strings
├─ serializable treeview PatternDefinition
├─ runtime-generated slotProps/items
└─ strict validation for hallucination-prone fields
```

```txt
PatternData
├─ items
│  └─ stable item payload
├─ relations
│  └─ rootKeys + childrenByKey
├─ state
│  └─ activeKey / selectedKeys / expandedKeys / APG derived set metadata
└─ refs
   └─ host-facing labels and external references
```

## Demo

```bash
pnpm --filter @interactive-os/apg-treeview-contract demo
```

The demo renders the treeview contract, option switches, event log, and raw source panels.

The package is intentionally small. It proves the direction: APG behavior can be declared
as serializable data, validated with Zod, and executed by a runtime without asking app code
or LLM-generated code to read raw `PatternData`.

```txt
keyboard -> APG binding
├─ @interactive-os/keyboard
│  └─ matches KeyInput against serialized shortcut strings
├─ PatternDefinition.keyboard
│  └─ maps shortcut -> PatternEvent template
├─ @interactive-os/keyboard-navigation
│  └─ resolves tree visible order and linear navigation targets
└─ PatternEventSchema
   └─ rejects extra payload fields and non-canonical event names
```

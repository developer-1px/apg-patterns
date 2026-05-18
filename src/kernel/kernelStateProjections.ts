import { defineStateProjection } from './patternKernel'

defineStateProjection('state.activeKey', (ctx) => ctx.key != null && ctx.activeKey === ctx.key)
defineStateProjection('state.selectedKeys', (ctx) => (ctx.key ? ctx.data.state?.selectedKeys?.includes(ctx.key) ?? false : false))
defineStateProjection('state.disabledKeys', (ctx) => (ctx.key ? ctx.data.state?.disabledKeys?.includes(ctx.key) ?? false : false))
defineStateProjection('state.expandedKeys', (ctx) => (ctx.key ? ctx.data.state?.expandedKeys?.includes(ctx.key) ?? false : false))
defineStateProjection('state.checkedByKey', (ctx) => (ctx.key ? ctx.data.state?.checkedByKey?.[ctx.key] : undefined))
defineStateProjection('state.pressedByKey', (ctx) => (ctx.key ? ctx.data.state?.pressedByKey?.[ctx.key] : undefined))
defineStateProjection('state.currentByKey', (ctx) => (ctx.key ? ctx.data.state?.currentByKey?.[ctx.key] : undefined))
defineStateProjection('state.valueByKey', (ctx) => (ctx.key ? ctx.data.state?.valueByKey?.[ctx.key] : undefined))

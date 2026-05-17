export function attrLine(props: Record<string, unknown>, names: readonly string[]) {
  return names
    .filter((name) => props[name] !== undefined)
    .map((name) => `${name}=${JSON.stringify(props[name])}`)
    .join(' ')
}

export function htmlAttrs(props: Record<string, unknown>, names: readonly string[]) {
  return names
    .filter((name) => props[name] !== undefined)
    .map((name) => ` ${htmlAttrName(name)}="${String(props[name])}"`)
    .join('')
}

function htmlAttrName(name: string) {
  return name === 'tabIndex' ? 'tabindex' : name
}

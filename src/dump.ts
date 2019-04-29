export default function dump(value?: any): string {
  if (typeof value === 'undefined') {
    return 'undefined'
  }

  if (value === null) {
    return 'null'
  }

  if (typeof value === 'string') {
    return `'${value}'`
  }

  if (typeof value === 'function') {
    return value.toString()
  }

  if (typeof value === 'number') {
    return `${value}`
  }

  if (Array.isArray(value)) {
    const inner = value.map(dump).join(', ')
    return `[ ${inner} ]`
  }

  if (typeof value === 'object') {
    const inner = Object.entries(value)
      .map(([key, val]) => `${key}: ${dump(val)}`)
      .join(', ')
    return `{ ${inner} }`
  }

  return JSON.stringify(value)
}

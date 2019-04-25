import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import createType from './index'

test('transpiles code correctly', () => {
  const type = createType()
  const schema = new yaml.Schema({
    include: [yaml.DEFAULT_SAFE_SCHEMA],
    explicit: [type],
  })
  const content = yaml.load(
    `
customModule: !!ts/module |
  export default {
    boolean: true,
    func: () => true,
    asyncFunc: async () => true,
  }
`,
    { schema }
  )

  expect(content).not.toBeNull()
  expect(content.customModule).toBeDefined()
  expect(content.customModule.default).toBeDefined()
  expect(content.customModule.default.boolean).toEqual(true)
  expect(content.customModule.default.func).toBeDefined()
  expect(content.customModule.default.func()).toEqual(true)
  expect(content.customModule.default.asyncFunc()).resolves.toEqual(true)
  expect(content).toMatchSnapshot('load')
  expect(yaml.dump(content, { schema })).toMatchSnapshot('dump')
})

test('throw error for invalid module', () => {
  const log = jest.fn()
  const type = createType({ log })
  const schema = new yaml.Schema({
    include: [yaml.DEFAULT_SAFE_SCHEMA],
    explicit: [type],
  })

  expect(() => {
    yaml.load(
      `
customModule: !!ts/module '---'
  `,
      { schema }
    )
  }).toThrowErrorMatchingSnapshot()
  expect(log.mock.calls[0][0]).toMatchSnapshot('log')
})

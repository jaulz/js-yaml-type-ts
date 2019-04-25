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
    jsx: (React) => <Test />,
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
  expect(content).toMatchSnapshot()
})

test('dumps code correctly', () => {
  const type = createType()
  const schema = new yaml.Schema({
    include: [yaml.DEFAULT_SAFE_SCHEMA],
    explicit: [type],
  })
  const options = { schema }
  const content = yaml.load(
    yaml.dump(
      yaml.load(
        `
customModule: !!ts/module |
  export default {
    boolean: true,
    func: () => true,
    asyncFunc: async () => true,
    jsx: (React) => <Test />,
  }
`,
        options
      ),
      options
    ),
    options
  )

  expect(content).not.toBeNull()
  expect(content.customModule).toBeDefined()
  expect(content.customModule.default).toBeDefined()
  expect(content.customModule.default.boolean).toEqual(true)
  expect(content.customModule.default.func).toBeDefined()
  expect(content.customModule.default.func()).toEqual(true)
  expect(content.customModule.default.asyncFunc()).resolves.toEqual(true)
  expect(content).toMatchSnapshot()
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

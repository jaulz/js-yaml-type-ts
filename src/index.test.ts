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

test('dumps code correctly (original style)', () => {
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
      {
        ...options,
        styles: {
          'tag:yaml.org,2002:ts/module': 'original',
        },
      }
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

test('dumps code correctly (transpiled style)', () => {
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
      {
        ...options,
        styles: {
          '!!ts/module': 'transpiled',
        },
      }
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

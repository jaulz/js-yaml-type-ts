import yaml from 'js-yaml'
import {
  createFunctionType,
  createModuleType,
  createIncludeType,
} from './index'

describe('createModuleType', () => {
  it('transpiles code correctly', () => {
    const type = createModuleType()
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

  it('dumps code correctly (original style)', () => {
    const type = createModuleType()
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

  it('dumps code correctly (transpiled style)', () => {
    const type = createModuleType()
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

  it('throws error for invalid module', () => {
    const log = jest.fn()
    const type = createModuleType({ log })
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
})

describe('createIncludeType', () => {
  it('transpiles code correctly', () => {
    const type = createIncludeType()
    const schema = new yaml.Schema({
      include: [yaml.DEFAULT_SAFE_SCHEMA],
      explicit: [type],
    })
    const content = yaml.load(
      `customModule: !!ts/include "fixtures/include.tsx"`,
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

  it('dumps code correctly as module type', () => {
    const type = createIncludeType({
      log: console.log,
    })
    const schema = new yaml.Schema({
      include: [yaml.DEFAULT_SAFE_SCHEMA],
      explicit: [type, createModuleType()],
    })
    const options = { schema }
    const content = yaml.load(
      yaml.dump(
        yaml.load(`customModule: !!ts/include "fixtures/include.tsx"`, options),
        {
          ...options,
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

  it('throws error for invalid module', () => {
    const log = jest.fn()
    const type = createIncludeType({ log })
    const schema = new yaml.Schema({
      include: [yaml.DEFAULT_SAFE_SCHEMA],
      explicit: [type],
    })

    expect(() => {
      yaml.load(
        `
customModule: !!ts/include '---'
  `,
        { schema }
      )
    }).toThrowErrorMatchingSnapshot()
    expect(log.mock.calls[0][0]).toMatchSnapshot('log')
  })
})

describe('createFunctionType', () => {
  it('transpiles code correctly', () => {
    const type = createFunctionType()
    const schema = new yaml.Schema({
      include: [yaml.DEFAULT_SAFE_SCHEMA],
      explicit: [type],
    })
    const content = yaml.load(
      `
customFunction: !!ts/function |
  (input) => {
    return input
  }
`,
      { schema }
    )

    expect(content.customFunction).not.toBeNull()
    expect(typeof content.customFunction).toEqual('function')
    expect(content.customFunction('test')).toEqual('test')
  })

  it('dumps code correctly (original style)', () => {
    const type = createFunctionType()
    const schema = new yaml.Schema({
      include: [yaml.DEFAULT_SAFE_SCHEMA],
      explicit: [type],
    })
    const options = { schema }
    const content = yaml.load(
      yaml.dump(
        yaml.load(
          `
customFunction: !!ts/function |
  (input) => {
    return input
  }
`,
          options
        ),
        {
          ...options,
          styles: {
            'tag:yaml.org,2002:ts/function': 'original',
          },
        }
      ),
      options
    )

    expect(content.customFunction).not.toBeNull()
    expect(typeof content.customFunction).toEqual('function')
    expect(content.customFunction('test')).toEqual('test')
  })

  it('dumps code correctly (transpiled style)', () => {
    const type = createFunctionType()
    const schema = new yaml.Schema({
      include: [yaml.DEFAULT_SAFE_SCHEMA],
      explicit: [type],
    })
    const options = { schema }
    const content = yaml.load(
      yaml.dump(
        yaml.load(
          `
customFunction: !!ts/function |
  (input) => {
    return input
  }
`,
          options
        ),
        {
          ...options,
          styles: {
            '!!ts/function': 'transpiled',
          },
        }
      ),
      options
    )

    expect(content.customFunction).not.toBeNull()
    expect(typeof content.customFunction).toEqual('function')
    expect(content.customFunction('test')).toEqual('test')
  })

  it('throws error for invalid module', () => {
    const log = jest.fn()
    const type = createFunctionType({ log })
    const schema = new yaml.Schema({
      include: [yaml.DEFAULT_SAFE_SCHEMA],
      explicit: [type],
    })

    expect(() => {
      yaml.load(
        `
customFunction: !!ts/function '---'
  `,
        { schema }
      )
    }).toThrowErrorMatchingSnapshot()
    expect(log.mock.calls[0][0]).toMatchSnapshot('log')
  })
})

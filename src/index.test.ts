import yaml from 'js-yaml'
import {
  createFunctionType,
  createIncludeFunctionType,
  createModuleType,
  createIncludeModuleType,
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

describe('createIncludeModuleType', () => {
  it('transpiles code correctly', () => {
    const type = createIncludeModuleType()
    const schema = new yaml.Schema({
      include: [yaml.DEFAULT_SAFE_SCHEMA],
      explicit: [type],
    })
    const content = yaml.load(
      `customModule: !!ts/includeModule "fixtures/module.tsx"`,
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
    const type = createIncludeModuleType({
      log: console.log,
    })
    const schema = new yaml.Schema({
      include: [yaml.DEFAULT_SAFE_SCHEMA],
      explicit: [type, createModuleType()],
    })
    const options = { schema }
    const content = yaml.load(
      yaml.dump(
        yaml.load(
          `customModule: !!ts/includeModule "fixtures/module.tsx"`,
          options
        ),
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
    const type = createIncludeModuleType({ log })
    const schema = new yaml.Schema({
      include: [yaml.DEFAULT_SAFE_SCHEMA],
      explicit: [type],
    })

    expect(() => {
      yaml.load(
        `
customModule: !!ts/includeModule '---'
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
  export default (input) => {
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
  export default (input) => {
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

    expect(content).not.toBeNull()
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
  export default (input) => {
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

    expect(content).not.toBeNull()
    expect(content.customFunction).not.toBeNull()
    expect(typeof content.customFunction).toEqual('function')
    expect(content.customFunction('test')).toEqual('test')
  })

  it('throws error for invalid function', () => {
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

describe('createIncludeFunctionType', () => {
  it('transpiles code correctly', () => {
    const type = createIncludeFunctionType()
    const schema = new yaml.Schema({
      include: [yaml.DEFAULT_SAFE_SCHEMA],
      explicit: [type],
    })
    const content = yaml.load(
      `customFunction: !!ts/includeFunction "fixtures/function.tsx"`,
      { schema }
    )

    expect(content).not.toBeNull()
    expect(content.customFunction).not.toBeNull()
    expect(typeof content.customFunction).toEqual('function')
    expect(content.customFunction('test')).toEqual('test')
  })

  it('dumps code correctly as function type', () => {
    const type = createIncludeFunctionType({
      log: console.log,
    })
    const schema = new yaml.Schema({
      include: [yaml.DEFAULT_SAFE_SCHEMA],
      explicit: [type, createFunctionType()],
    })
    const options = { schema }
    const content = yaml.load(
      yaml.dump(
        yaml.load(
          `customFunction: !!ts/includeFunction "fixtures/function.tsx"`,
          options
        ),
        {
          ...options,
        }
      ),
      options
    )

    expect(content).not.toBeNull()
    expect(content.customFunction).not.toBeNull()
    expect(typeof content.customFunction).toEqual('function')
    expect(content.customFunction('test')).toEqual('test')
  })

  it('throws error for invalid function', () => {
    const log = jest.fn()
    const type = createIncludeFunctionType({ log })
    const schema = new yaml.Schema({
      include: [yaml.DEFAULT_SAFE_SCHEMA],
      explicit: [type],
    })

    expect(() => {
      yaml.load(
        `
customModule: !!ts/includeFunction '---'
  `,
        { schema }
      )
    }).toThrowErrorMatchingSnapshot()
    expect(log.mock.calls[0][0]).toMatchSnapshot('log')
  })
})

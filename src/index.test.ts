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
    const dumpedContent = yaml.dump(
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
    )

    expect(dumpedContent).toContain('<Test />')

    const content = yaml.load(dumpedContent, options)

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
    const dumpedContent = yaml.dump(
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
    )

    expect(dumpedContent).toContain(`React.createElement(Test`)

    const content = yaml.load(dumpedContent, options)

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
    const type = createModuleType()
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
    const type = createIncludeModuleType()
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
    const type = createIncludeModuleType()
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
    }).toThrowError(
      expect.objectContaining({
        name: 'Error',
        message: expect.stringMatching('no such file or directory'),
      })
    )
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
    const dumpedContent = yaml.dump(
      yaml.load(
        `
customFunction: !!ts/function |
  export default (input) => {
    const Test = () => <div />

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
    )

    expect(dumpedContent).toContain('<div />')

    const content = yaml.load(dumpedContent, options)

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
    const dumpedContent = yaml.dump(
      yaml.load(
        `
customFunction: !!ts/function |
  export default (input) => {
    const Test = () => <div />

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
    )

    expect(dumpedContent).toContain(`React.createElement(\"div\"`)

    const content = yaml.load(dumpedContent, options)

    expect(content).not.toBeNull()
    expect(content.customFunction).not.toBeNull()
    expect(typeof content.customFunction).toEqual('function')
    expect(content.customFunction('test')).toEqual('test')
  })

  it('throws error for invalid function', () => {
    const type = createFunctionType()
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
    const type = createIncludeFunctionType()
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
    const type = createIncludeFunctionType()
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
    }).toThrowError(
      expect.objectContaining({
        name: 'Error',
        message: expect.stringMatching('no such file or directory'),
      })
    )
  })
})

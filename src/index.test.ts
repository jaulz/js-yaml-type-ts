import yaml from 'js-yaml'
import createType, { TSModule } from './index'

describe('createType', () => {
  it('transpiles code correctly', () => {
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

  it('dumps code correctly (original style)', () => {
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

  it('dumps code correctly (transpiled style)', () => {
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

  it('dumps code correctly if the module was manually created (original style)', () => {
    const type = createType()
    const schema = new yaml.Schema({
      include: [yaml.DEFAULT_SAFE_SCHEMA],
      explicit: [type],
    })
    const options = { schema }
    const customModule = new TSModule({
      default: {
        boolean: true,
        func: () => true,
        asyncFunc: () => {
          return Promise.resolve(true)
        },
      },
    })
    const content = yaml.load(
      yaml.dump(
        {
          customModule,
        },
        {
          ...options,
          styles: {
            '!!ts/module': 'original',
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

  it('dumps code correctly if the module was manually created (transpiled style)', () => {
    const type = createType()
    const schema = new yaml.Schema({
      include: [yaml.DEFAULT_SAFE_SCHEMA],
      explicit: [type],
    })
    const options = { schema }
    const customModule = new TSModule({
      default: {
        boolean: true,
        func: () => true,
        asyncFunc: () => {
          return Promise.resolve(true)
        },
      },
    })
    const content = yaml.load(
      yaml.dump(
        {
          customModule,
        },
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
})

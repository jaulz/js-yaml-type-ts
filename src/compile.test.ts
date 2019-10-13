import compile from './compile'
import transpile from './transpile'

describe('compile', () => {
  it('compile code correctly', () => {
    const content = compile(
      transpile(`
      export default {
        boolean: true,
        func: () => true,
        asyncFunc: async () => true,
        jsx: (React) => <Test />,
      }
    `)
    )

    expect(content).not.toBeNull()
    expect(typeof content).toEqual('object')
    expect(content).toMatchSnapshot()
  })
})

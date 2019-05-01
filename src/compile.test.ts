import compile from './compile'

describe('compile', () => {
  it('compile code correctly', () => {
    const content = compile(`
      export default {
        boolean: true,
        func: () => true,
        asyncFunc: async () => true,
        jsx: (React) => <Test />,
      }
    `)

    expect(content).not.toBeNull()
    expect(typeof content).toEqual('object')
    expect(content).toMatchSnapshot()
  })
})

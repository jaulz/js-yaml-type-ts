import transpile from './transpile'

describe('transpile', () => {
  it('transpiles code correctly', () => {
    const content = transpile(`
      export default {
        boolean: true,
        func: () => true,
        asyncFunc: async () => true,
        jsx: (React) => <Test />,
      }
    `)

    expect(content).not.toBeNull()
    expect(content).toMatchSnapshot()
  })
})

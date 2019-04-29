import dump from './dump'

describe('dump', () => {
  it('is a function', () => {
    expect(dump).toBeDefined()
  })

  it('dumps undefined', () => {
    expect(dump()).toMatchSnapshot()
    expect(dump(undefined)).toMatchSnapshot()
  })

  it('dumps null', () => {
    expect(dump(null)).toMatchSnapshot()
  })

  it('dumps string', () => {
    expect(dump('test')).toMatchSnapshot()
  })

  it('dumps number', () => {
    expect(dump(3)).toMatchSnapshot()
  })

  it('dumps function', () => {
    expect(dump(() => true)).toMatchSnapshot()
  })

  it('dumps class', () => {
    expect(
      dump(
        class Test {
          test() {
            return true
          }
        }
      )
    ).toMatchSnapshot()
  })

  it('dumps flat object', () => {
    expect(
      dump({
        1: 2,
        '2': 'string',
        3: false,
      })
    ).toMatchSnapshot()
  })

  it('dumps deep object', () => {
    expect(
      dump({
        1: 2,
        '2': 'string',
        3: [
          'array',
          {
            undefined: undefined,
            null: null,
            custom: 'object',
            with: 'multiple',
            keys: (and: any) => {
              return 'functions'
            },
          },
        ],
      })
    ).toMatchSnapshot()
  })
})

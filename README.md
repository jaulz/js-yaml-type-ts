# js-yaml-type-ts-module

Use it like this:

```js
import createTSModuleType from 'js-yaml-type-ts-module'

const type = createTSModuleType()
const schema = new yaml.Schema({
  include: [yaml.DEFAULT_SAFE_SCHEMA],
  explicit: [type],
})
const parsed = yaml.load(
  `
customModule: !!ts/module |
  export default {
    boolean: true,
    func: () => true,
    asyncFunc: async () => true,
  }
`,
  { schema }
)
```

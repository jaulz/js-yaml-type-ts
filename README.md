# js-yaml-type-ts

Use it like this:

```js
import { createIncludeType, createModuleType } from 'js-yaml-type-ts'

const schema = new yaml.Schema({
  include: [yaml.DEFAULT_SAFE_SCHEMA],
  explicit: [createIncludeType(), createModuleType()],
})
const tsModule = yaml.load(
  `
customInclude: !!ts/include "fixtures/include.tsx"
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

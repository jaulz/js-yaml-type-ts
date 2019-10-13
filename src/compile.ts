import transpile from './transpile'
import { VMScript, NodeVM, NodeVMOptions } from 'vm2'
import { CompilerOptions } from 'typescript'
import { OriginalCodeSymbol, TranspiledCodeSymbol } from '.'

export default function compile<T = any>(
  code: string,
  compilerOptions?: CompilerOptions,
  vmOptions?: NodeVMOptions
): T {
  // Create VM
  const vm = new NodeVM({
    timeout: 10000,
    sandbox: {},
    ...vmOptions,
  })

  return vm.run(new VMScript(code))
}

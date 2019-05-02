import transpile from './transpile'
import { VMScript, NodeVM, NodeVMOptions } from 'vm2'
import { CompilerOptions } from 'typescript'
import { OriginalCodeSymbol, TranspiledCodeSymbol } from '.'

export default function compile<T = any>(
  code: string | object,
  compilerOptions?: CompilerOptions,
  vmOptions?: NodeVMOptions
): T {
  const transpiledCode = transpile(code, compilerOptions)

  // Create VM
  const vm = new NodeVM({
    timeout: 10000,
    sandbox: {},
    ...vmOptions,
  })
  const compiledModule = vm.run(new VMScript(transpiledCode))

  // Add meta data
  if (compiledModule) {
    compiledModule[OriginalCodeSymbol] = code
    compiledModule[TranspiledCodeSymbol] = transpiledCode
  }

  return compiledModule
}

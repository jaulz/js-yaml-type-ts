import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { CompilerOptions } from 'typescript'
import { NodeVM, NodeVMOptions, VMScript } from 'vm2'
import transpile from './transpile'

export { default as dump } from './dump'
export { default as transpile } from './transpile'

export interface ModuleOptions {
  name?: string
  compilerOptions?: CompilerOptions
  vmOptions?: NodeVMOptions
  log?: (message?: any, ...optionalParams: any[]) => void
}

export interface IncludeOptions extends ModuleOptions {
  relativeTo?: string
}

export const OriginalCodeSymbol = Symbol('originalCode')
export const TranspiledCodeSymbol = Symbol('transpiledCode')
export const ModuleSymbol = Symbol('module')

export function createIncludeType({
  name = 'tag:yaml.org,2002:ts/include',
  compilerOptions = {},
  vmOptions = {},
  log = () => {},
  relativeTo = process.cwd(),
}: IncludeOptions = {}) {
  return new yaml.Type(name, {
    kind: 'scalar',
    resolve: (includePath: string) => {
      try {
        const code = fs.readFileSync(
          path.resolve(relativeTo, includePath),
          'utf8'
        )
        transpile(code, compilerOptions)
      } catch (error) {
        log(error)
        return false
      }

      return true
    },
    construct: (includePath: string) => {
      const code = fs.readFileSync(
        path.resolve(relativeTo, includePath),
        'utf8'
      )
      return compile(code, compilerOptions, vmOptions)
    },
    predicate: (data: any) => {
      // Cannot be dumped and should be dumped as a module instead
      return false
    },
  })
}

export function createModuleType({
  name = 'tag:yaml.org,2002:ts/module',
  compilerOptions = {},
  vmOptions = {},
  log = () => {},
}: ModuleOptions = {}) {
  return new yaml.Type(name, {
    kind: 'scalar',
    resolve: (code: string) => {
      try {
        transpile(code, compilerOptions)
      } catch (error) {
        log(error)
        return false
      }

      return true
    },
    construct: (code: string) => {
      return compile(code, compilerOptions, vmOptions)
    },
    predicate: (data: any) => {
      return !!data[OriginalCodeSymbol] && !!data[TranspiledCodeSymbol]
    },
    represent: {
      original: (data: any) => {
        return data[OriginalCodeSymbol]
      },
      transpiled: (data: any) => {
        return data[TranspiledCodeSymbol]
      },
    },
    defaultStyle: 'transpiled',
  })
}

export function compile<T = any>(
  code: any,
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

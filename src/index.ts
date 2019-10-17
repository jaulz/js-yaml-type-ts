import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { CompilerOptions } from 'typescript'
import { NodeVMOptions } from 'vm2'
import transpile from './transpile'
import compile from './compile'
import minify from './minify'

export { compile, minify, transpile }

export interface ModuleOptions {
  name?: string
  compilerOptions?: CompilerOptions
  vmOptions?: NodeVMOptions
  format?: (code: string) => string
}

export interface IncludeOptions {
  name?: string
  compilerOptions?: CompilerOptions
  vmOptions?: NodeVMOptions
  relativeTo?: string
}

export const OriginalCodeSymbol = Symbol('originalCode')
export const TranspiledCodeSymbol = Symbol('transpiledCode')

export type CompiledModule = {
  [key: string]: any
  [OriginalCodeSymbol]: string
  [TranspiledCodeSymbol]: string
}

export type CompiledFunction = ((args: any[]) => any) & {
  [OriginalCodeSymbol]: string
  [TranspiledCodeSymbol]: string
}

export function constructModule(
  code: string,
  compilerOptions: CompilerOptions,
  vmOptions: NodeVMOptions
) {
  const transpiledCode = transpile(code, compilerOptions)
  const compiledModule = compile(transpiledCode, compilerOptions, vmOptions)

  if (!compiledModule) {
    return compiledModule
  }

  compiledModule[OriginalCodeSymbol] = code
  compiledModule[TranspiledCodeSymbol] = transpiledCode
  return compiledModule as CompiledModule
}

export function createModuleType({
  name = 'tag:yaml.org,2002:ts/module',
  compilerOptions = {},
  vmOptions = {},
  format = code => code,
}: ModuleOptions = {}) {
  return new yaml.Type(name, {
    kind: 'scalar',
    resolve: () => {
      return true
    },
    construct: (code: string) => {
      return constructModule(code, compilerOptions, vmOptions)
    },
    predicate: (data: any) => {
      return (
        data &&
        typeof data === 'object' &&
        !!data[OriginalCodeSymbol] &&
        !!data[TranspiledCodeSymbol]
      )
    },
    represent: {
      original: (data: any) => {
        return format(data[OriginalCodeSymbol])
      },
      transpiled: (data: any) => {
        return format(data[TranspiledCodeSymbol])
      },
      minified: (data: any) => {
        return format(minify(data[TranspiledCodeSymbol]))
      },
    },
    defaultStyle: 'transpiled',
  })
}

export function createIncludeModuleType({
  name = 'tag:yaml.org,2002:ts/includeModule',
  compilerOptions = {},
  vmOptions = {},
  relativeTo = process.cwd(),
}: IncludeOptions = {}) {
  return new yaml.Type(name, {
    kind: 'scalar',
    resolve: () => {
      return true
    },
    construct: (includePath: string) => {
      const code = fs.readFileSync(
        path.resolve(relativeTo, includePath),
        'utf8'
      )

      return constructModule(code, compilerOptions, vmOptions)
    },
    predicate: (data: any) => {
      // Cannot be dumped and should be dumped as a module instead
      return false
    },
  })
}

export function constructFunction(
  code: string,
  compilerOptions: CompilerOptions,
  vmOptions: NodeVMOptions
) {
  const transpiledCode = transpile(code, compilerOptions)
  const compiledModule = compile(transpiledCode, compilerOptions, vmOptions)

  if (!compiledModule) {
    return compiledModule
  }

  const compiledFunction = compiledModule.default

  if (!compiledFunction) {
    return compiledFunction
  }

  compiledFunction[OriginalCodeSymbol] = code
  compiledFunction[TranspiledCodeSymbol] = transpiledCode
  return compiledFunction as CompiledFunction
}

export function createFunctionType({
  name = 'tag:yaml.org,2002:ts/function',
  compilerOptions = {},
  vmOptions = {},
  format = code => code,
}: ModuleOptions = {}) {
  return new yaml.Type(name, {
    kind: 'scalar',
    resolve: () => {
      return true
    },
    construct: (code: string) => {
      return constructFunction(code, compilerOptions, vmOptions)
    },
    predicate: (data: any) => {
      return data && {}.toString.call(data) === '[object Function]'
    },
    represent: {
      original: (data: any) => {
        const code = data
          ? data[OriginalCodeSymbol] || `export default ${data.toString()}`
          : null

        return format(code)
      },
      transpiled: (data: any) => {
        const code = data
          ? data[TranspiledCodeSymbol] ||
            transpile(`exports.default = ${data.toString()}`)
          : null

        return format(code)
      },
      minified: (data: any) => {
        const code = data
          ? data[TranspiledCodeSymbol] ||
            transpile(`exports.default = ${data.toString()}`)
          : null

        return format(minify(code))
      },
    },
    defaultStyle: 'transpiled',
  })
}

export function createIncludeFunctionType({
  name = 'tag:yaml.org,2002:ts/includeFunction',
  compilerOptions = {},
  vmOptions = {},
  relativeTo = process.cwd(),
}: IncludeOptions = {}) {
  return new yaml.Type(name, {
    kind: 'scalar',
    resolve: () => {
      return true
    },
    construct: (includePath: string) => {
      const code = fs.readFileSync(
        path.resolve(relativeTo, includePath),
        'utf8'
      )

      return constructFunction(code, compilerOptions, vmOptions)
    },
    predicate: (data: any) => {
      // Cannot be dumped and should be dumped as a function instead
      return false
    },
  })
}

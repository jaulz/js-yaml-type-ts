import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { CompilerOptions } from 'typescript'
import { NodeVMOptions } from 'vm2'
import transpile from './transpile'
import compile from './compile'

export { default as compile } from './compile'
export { default as transpile } from './transpile'

export interface ModuleOptions {
  name?: string
  compilerOptions?: CompilerOptions
  vmOptions?: NodeVMOptions
  format?: (code: string) => string
  log?: (message?: any, ...optionalParams: any[]) => void
}

export interface IncludeOptions {
  name?: string
  compilerOptions?: CompilerOptions
  vmOptions?: NodeVMOptions
  relativeTo?: string
  log?: (message?: any, ...optionalParams: any[]) => void
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
    },
    defaultStyle: 'transpiled',
  })
}

export function createIncludeModuleType({
  name = 'tag:yaml.org,2002:ts/includeModule',
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
  const transpiledModuleCode = transpile(code, compilerOptions)
  const compiledModule = compile(
    transpiledModuleCode,
    compilerOptions,
    vmOptions
  )

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
          ? data[TranspiledCodeSymbol] || `exports.default = ${data.toString()}`
          : null

        return format(code)
      },
    },
    defaultStyle: 'transpiled',
  })
}

export function createIncludeFunctionType({
  name = 'tag:yaml.org,2002:ts/includeFunction',
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

      return constructFunction(code, compilerOptions, vmOptions)
    },
    predicate: (data: any) => {
      // Cannot be dumped and should be dumped as a function instead
      return false
    },
  })
}

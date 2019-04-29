import yaml from 'js-yaml'
import { CompilerOptions } from 'typescript'
import ts from 'typescript'
import { NodeVM, NodeVMOptions, VMScript } from 'vm2'
import dump from './dump'

export interface Options {
  name?: string
  compilerOptions?: CompilerOptions
  vmOptions?: NodeVMOptions
  log?: (message?: any, ...optionalParams: any[]) => void
}

export const OriginalCodeSymbol = Symbol('originalCode')
export const TranspiledCodeSymbol = Symbol('transpiledCode')
export const ModuleSymbol = Symbol('module')

export class TSModule {
  [OriginalCodeSymbol]: string;
  [TranspiledCodeSymbol]: string;
  [ModuleSymbol]: any

  constructor(
    code: any,
    compilerOptions?: CompilerOptions,
    vmOptions?: NodeVMOptions
  ) {
    this[OriginalCodeSymbol] =
      typeof code === 'string' ? code : `module.exports = ${dump(code)}`
    this[TranspiledCodeSymbol] = transpile(
      this[OriginalCodeSymbol],
      compilerOptions
    )
    const vm = new NodeVM({
      timeout: 10000,
      sandbox: {},
      ...vmOptions,
    })
    this[ModuleSymbol] = vm.run(new VMScript(this[TranspiledCodeSymbol]))

    // Create getters
    for (let key in this[ModuleSymbol]) {
      Object.defineProperty(this, key, {
        get: () => {
          return this[ModuleSymbol][key]
        },
        set: () => {
          // No setter
        },
      })
    }
  }
}

export default function createType({
  name = 'tag:yaml.org,2002:ts/module',
  compilerOptions = {},
  vmOptions = {},
  log = () => {},
}: Options = {}) {
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
      return new TSModule(code, compilerOptions, vmOptions)
    },
    instanceOf: TSModule,
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

export function transpile(
  code: string,
  compilerOptions: CompilerOptions = {}
): string {
  const result = ts.transpileModule(code, {
    reportDiagnostics: true,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES5,
      jsx: ts.JsxEmit.React,
      noEmitHelpers: false,
      sourceMap: false,
      inlineSourceMap: false,
      ...compilerOptions,
    },
  })

  // Check if there was a compilation error
  const diagnostics = result.diagnostics
  if (diagnostics && diagnostics.length > 0) {
    const message = diagnostics[0].messageText
    const error = typeof message === 'string' ? message : message.messageText

    throw new Error(`SyntaxError: ${error}`)
  }

  return result.outputText.trim()
}

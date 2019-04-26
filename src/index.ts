import yaml from 'js-yaml'
import { CompilerOptions } from 'typescript'
import ts from 'typescript'

export interface Options {
  name?: string
  compilerOptions?: CompilerOptions
  log?: (message?: any, ...optionalParams: any[]) => void
}

export const CodeSymbol = Symbol('code')
export const TranspiledCodeSymbol = Symbol('transpiledCode')
export const EvalSymbol = Symbol('eval')

export class TSModule {
  [CodeSymbol]: string;
  [TranspiledCodeSymbol]: string;
  [EvalSymbol]: any

  constructor(code: string, compilerOptions: CompilerOptions) {
    this[CodeSymbol] = code
    this[TranspiledCodeSymbol] = transpile(code, compilerOptions)

    // Intentional line breaks in case the last line of code is a comment
    this[EvalSymbol] = new Function(`const exports = {}; 
        ${this[TranspiledCodeSymbol]}; 
        return exports;
      `)()

    // Create getters
    for (let key in this[EvalSymbol]) {
      Object.defineProperty(this, key, {
        get: () => {
          return this[EvalSymbol][key]
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
      return new TSModule(code, compilerOptions)
    },
    instanceOf: TSModule,
    represent: {
      original: (data: any) => {
        return (data as TSModule)[CodeSymbol]
      },
      transpiled: (data: any) => {
        return (data as TSModule)[TranspiledCodeSymbol]
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

  // Remove "use strict;" at the beginning
  const cleanCode =
    result.outputText.indexOf('"use strict";') === 0
      ? result.outputText.substr('"use strict";'.length)
      : result.outputText

  return cleanCode.trim()
}

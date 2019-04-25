import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { CompilerOptions } from 'typescript'
import ts from 'typescript'

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
      inlineSourceMap: true,
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

export interface Options {
  name?: string
  prettier?: (code: string) => string
  compilerOptions?: CompilerOptions
  log?: (message?: any, ...optionalParams: any[]) => void
}

const codeSymbol = Symbol('code')
const evalSymbol = Symbol('eval')
class Module {
  [codeSymbol]: string;
  [evalSymbol]: any

  constructor(code: string, compilerOptions: CompilerOptions) {
    this[codeSymbol] = code

    // Intentional line breaks in case the last line of code is a comment
    this[evalSymbol] = new Function(`const exports = {}; 
        ${transpile(code, compilerOptions)}; 
        return exports;
      `)()

    // Create getters
    for (let key in this[evalSymbol]) {
      Object.defineProperty(this, key, {
        get: () => {
          return this[evalSymbol][key]
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
  prettier = code => code,
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
      return new Module(code, compilerOptions)
    },
    instanceOf: Module,
    represent: (data: any) => {
      return (data as Module).code
    },
  })
}

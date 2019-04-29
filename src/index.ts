import yaml from 'js-yaml'
import { CompilerOptions } from 'typescript'
import ts from 'typescript'
import { NodeVM, NodeVMOptions, VMScript } from 'vm2'

export interface Options {
  name?: string
  compilerOptions?: CompilerOptions
  vmOptions?: NodeVMOptions
  log?: (message?: any, ...optionalParams: any[]) => void
}

export const OriginalCodeSymbol = Symbol('originalCode')
export const TranspiledCodeSymbol = Symbol('transpiledCode')

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
      const transpiledCode = transpile(code, compilerOptions)
      const vm = new NodeVM({
        timeout: 10000,
        sandbox: {},
        ...vmOptions,
      })
      const script = new VMScript(transpiledCode)
      const tsModule = vm.run(script)

      // Define meta data
      tsModule[OriginalCodeSymbol] = code
      tsModule[TranspiledCodeSymbol] = transpiledCode

      return tsModule
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

import { CompilerOptions } from 'typescript'
import ts from 'typescript'
import dump from './dump'

export default function transpile(
  code: string | object,
  compilerOptions: CompilerOptions = {}
): string {
  const result = ts.transpileModule(
    typeof code === 'string' ? code : `Object.assign(exports, ${dump(code)})`,
    {
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
    }
  )

  // Check if there was a compilation error
  const diagnostics = result.diagnostics
  if (diagnostics && diagnostics.length > 0) {
    const message = diagnostics[0].messageText
    const error = typeof message === 'string' ? message : message.messageText

    throw new Error(`SyntaxError: ${error}`)
  }

  return result.outputText.trim()
}

import { CompilerOptions } from 'typescript'
import ts from 'typescript'

export default function transpile(
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

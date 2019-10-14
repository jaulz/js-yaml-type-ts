import UglifyJS from 'uglify-js'

export default function transpile(code: string): string {
  // Try to minimize the code
  const minifiedCode = UglifyJS.minify(code)
  if (minifiedCode.error) {
    throw minifiedCode.error
  }

  return minifiedCode.code.trim()
}

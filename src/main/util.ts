/* eslint import/prefer-default-export: off */
import { URL } from "url"
import path from "path"
import http from "http"

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212
    const url = new URL(`http://localhost:${port}`)
    url.pathname = htmlFileName
    return url.href
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`
}

export function waitForDevServer(
  htmlFileName: string,
  timeoutMs = 120_000,
  intervalMs = 500,
): Promise<string> {
  const targetUrl = resolveHtmlPath(htmlFileName)
  const deadline = Date.now() + timeoutMs

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const request = http.get(targetUrl, (response) => {
        response.resume()
        if (
          response.statusCode &&
          response.statusCode >= 200 &&
          response.statusCode < 400
        ) {
          resolve(targetUrl)
          return
        }
        if (Date.now() >= deadline) {
          reject(
            new Error(
              `Dev server at ${targetUrl} returned HTTP ${response.statusCode}`,
            ),
          )
          return
        }
        setTimeout(attempt, intervalMs)
      })

      request.on('error', () => {
        if (Date.now() >= deadline) {
          reject(new Error(`Dev server at ${targetUrl} did not become ready`))
          return
        }
        setTimeout(attempt, intervalMs)
      })
    }

    attempt()
  })
}

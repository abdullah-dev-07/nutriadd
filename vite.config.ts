import { fileURLToPath, URL } from 'node:url'
import type { IncomingMessage, ServerResponse } from 'node:http'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { Plugin, ViteDevServer } from 'vite'
import { defineConfig, loadEnv } from 'vite'

function createDevApiContactPlugin(): Plugin {
  return {
    name: 'dev-api-contact',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        if (req.method !== 'POST' || !req.url?.startsWith('/api/contact')) {
          return next()
        }

        const host = req.headers.host ?? 'localhost:5173'
        const url = `http://${host}${req.url}`
        const chunks: Uint8Array[] = []

        for await (const chunk of req) {
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
        }

        const body = Buffer.concat(chunks)
        const headers = new Headers()

        for (const [key, value] of Object.entries(req.headers)) {
          if (!value) continue
          if (Array.isArray(value)) {
            value.forEach((item) => headers.append(key, item))
          } else {
            headers.set(key, value)
          }
        }

        const request = new Request(url, {
          method: req.method,
          headers,
          body: body.length ? body : undefined,
        })

        const { default: handler } = await import('./api/contact.ts')
        const response = await handler(request)

        res.statusCode = response.status
        response.headers.forEach((value, key) => {
          res.setHeader(key, value)
        })
        res.end(await response.text())
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [react(), tailwindcss(), createDevApiContactPlugin()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            if (
              /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/.test(
                id
              )
            ) {
              return 'react-vendor'
            }
            if (
              /[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(
                id
              )
            ) {
              return 'motion-vendor'
            }
            return undefined
          },
        },
      },
    },
  }
})

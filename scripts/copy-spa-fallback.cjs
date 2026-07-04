const { copyFileSync, existsSync } = require('node:fs')
const { join } = require('node:path')

const distDir = join(__dirname, '..', 'dist')
const indexPath = join(distDir, 'index.html')
const fallbackPath = join(distDir, '404.html')

if (!existsSync(indexPath)) {
  throw new Error('dist/index.html bulunamadi. Once Vite build calismali.')
}

copyFileSync(indexPath, fallbackPath)

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const wat = await readFile(new URL('./sum.wat', import.meta.url), 'utf8')
const wabt = (await import('wabt')).default
const factory = await wabt()
const module = factory.parseWat('sum.wat', wat)
module.validate()
const { buffer } = module.toBinary({})
const target = path.join(root, 'apps', 'web', 'public', 'sum.wasm')
await mkdir(path.dirname(target), { recursive: true })
await writeFile(target, Buffer.from(buffer))
console.log(`wrote ${target}`)

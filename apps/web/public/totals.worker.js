let ready

function init() {
  if (!ready) {
    ready = fetch('/sum.wasm')
      .then((response) => response.arrayBuffer())
      .then((buffer) => WebAssembly.instantiate(buffer))
      .then((result) => result.instance.exports)
  }
  return ready
}

self.onmessage = async (event) => {
  const exports = await init()
  const values = event.data.values
  const memory = exports.memory
  const needed = values.length * 4
  const pages = Math.ceil(needed / 65536)
  if (memory.buffer.byteLength < needed) memory.grow(pages)
  const view = new Int32Array(memory.buffer, 0, values.length)
  for (let index = 0; index < values.length; index += 1) view[index] = values[index] | 0
  const sum = exports.sum(0, values.length)
  self.postMessage({ id: event.data.id, sum })
}

// buffer is an ArrayBuffer
const buf2hex = (buffer) =>
  [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('')

export default buf2hex

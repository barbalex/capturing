// https://stackoverflow.com/a/43131635/712005

const hex2buf = (hex) =>
  new Uint8Array(hex.match(/[\da-f]{2}/gi).map((h) => parseInt(h, 16)))

export default hex2buf

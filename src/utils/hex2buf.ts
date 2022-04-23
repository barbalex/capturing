// https://stackoverflow.com/a/43131635/712005

const hex2buf = (hex) => {
  // need to remove postgreSQL's preset \x
  const realHex = hex.substring(2)
  return new Uint8Array(
    realHex.match(/[\da-f]{2}/gi).map((h) => parseInt(h, 16)),
  )
}

export default hex2buf

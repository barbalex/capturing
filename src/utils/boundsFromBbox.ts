const boundsFromBbox = (bbox: number[]) => [
  [bbox[1], bbox[0]],
  [bbox[3], bbox[2]],
]

export default boundsFromBbox

const geometryTypes = [
  'Point',
  'LineString',
  'Polygon',
  'MultiPoint',
  'MultiLineString',
  'MultiPolygon',
]

interface Props {
  xmlFeature: object | undefined
  typeName: string
}
export interface GeometryFeature {
  type: string
  properties: object
  geometry: {
    type: string | undefined
    coordinates: number[] | number[][]
  }
}

const featureFromWfsGml = ({
  xmlFeature = {},
  typeName,
}: Props): GeometryFeature => {
  const props = Object.entries(xmlFeature?.[typeName?.toUpperCase?.()]).filter(
    ([key]) => key.startsWith('MS:'),
  )

  const propertyGmls = props.filter((p) => p[0] !== 'MS:GEOMETRY')
  const properties = {}
  for (const p of propertyGmls) {
    properties[p[0].replace('MS:', '')] = p[1]?.['#text']
  }
  // console.log('featureFromWfsGml, properties:', properties)

  const gml1 = props.find((p) => p[0] === 'MS:GEOMETRY')?.[1]
  // one of: Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon
  const gml2Key = Object.keys(gml1).find((key) => key.startsWith('GML:'))
  // console.log('featureFromWfsGml, geometryTypeKey:', gml2Key)
  const gml2 = gml1[gml2Key]
  const gml3Key = Object.keys(gml2).find((key) => key.startsWith('GML:'))
  const gml3 = gml2[gml3Key]
  const gml4Key = Object.keys(gml3).find((key) => key.startsWith('GML:'))
  const gml4 = gml3[gml4Key]
  const gml5Key = Object.keys(gml4).find((key) => key.startsWith('GML:'))
  const gml5 = gml4[gml5Key]?.['#text']
  // console.log('featureFromWfsGml, gml5:', gml5)
  const geometryType = gml2Key?.replace('GML:', '')
  const geometryTypeIsArray = geometryType?.toLowerCase?.().includes('multi')
  const coordinates = gml5
    .split(' ')
    .filter((o) => !!o)
    .reverse()
  // console.log('featureFromWfsGml, coordinates:', coordinates)

  const feature = {
    type: 'Feature',
    properties,
    geometry: {
      type: geometryTypes.find((t) =>
        t.toLowerCase().includes(geometryType?.toLowerCase?.()),
      ),
      coordinates: geometryTypeIsArray
        ? [coordinates as number[]]
        : (coordinates as number[]),
    },
  }

  return feature
}

export default featureFromWfsGml

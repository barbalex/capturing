// https://davidwalsh.name/convert-xml-json
const xmlToJson = (xml) => {
  // Create the return object
  let obj = {}

  if (xml.nodeType == 1) {
    // element
    // do attributes
    if (xml.attributes.length > 0) {
      obj['@attributes'] = {}
      for (let j = 0; j < xml.attributes.length; j++) {
        const attribute = xml.attributes.item(j)
        obj['@attributes'][attribute.nodeName] = attribute.nodeValue
      }
    }
  } else if (xml.nodeType == 3) {
    // text
    obj = xml.nodeValue
  }

  // do children
  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      const item = xml.childNodes.item(i)
      const nodeName = item.nodeName
      if (typeof obj[nodeName] == 'undefined') {
        obj[nodeName] = xmlToJson(item)
      } else {
        if (typeof obj[nodeName].push == 'undefined') {
          const old = obj[nodeName]
          obj[nodeName] = []
          obj[nodeName].push(old)
        }
        obj[nodeName].push(xmlToJson(item))
      }
    }
  }
  // extract layers
  const output = obj?.HTML?.BODY?.MSGMLOUTPUT
  const layers = Object.entries(output ?? {})
    .filter(([key]) => key.toLowerCase().includes('_layer'))
    .map(([key, value]) => value)

  const layersDataKeyValueArray = layers.map((l) => {
    const title = l['GML:NAME']?.['#text']
    const propsValue = Object.entries(l ?? {})
      .filter(([key]) => key.toLowerCase().includes('_feature'))
      .map(([key, value]) => value)?.[0]
    if (propsValue?.['#text']) delete propsValue['#text']
    const props = Object.entries(propsValue)
      .filter(([key, value]) => !key.includes(':'))
      .map(([key, value]) => [key, value?.['#text']])
    return [title, props]
  })
  console.log('xmlToJson, layersDataKeyValueArray:', layersDataKeyValueArray)
  return obj
}

export default xmlToJson

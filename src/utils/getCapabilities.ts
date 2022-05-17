import WMSCapabilities from 'wms-capabilities'
import axios from 'redaxios'

const fetchWmsGetCapabilities = async ({ url, service }) => {
  // Exaple url to get: https://wms.zh.ch/FnsSVOZHWMS?service=WMS&request=GetCapabilities
  let res
  try {
    res = await axios.get(`${url}?service=${service}&request=GetCapabilities`)
  } catch (error) {
    // console.log(`error fetching ${row.label}`, error?.toJSON())
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data)
      console.log(error.response.status)
      console.log(error.response.headers)
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request)
    } else {
      // Something happened in setting up the request that triggered an Error
      // TODO: surface
      console.log('Error', error.message)
    }
    console.log(error.config)
    return
  }
  return new WMSCapabilities().parse(res.data)
}

export default fetchWmsGetCapabilities

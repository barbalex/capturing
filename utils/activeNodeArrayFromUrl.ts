const activeNodeArrayFromUrl = (url) => {
  if (url.startsWith('/')) {
    return url.substring(1).split('/')
  }
  // console.log('activeNodeArrayFromUrl', {
  //   url,
  //   activeNodeArray: url.split('/'),
  // })
  return url.split('/')
}

export default activeNodeArrayFromUrl

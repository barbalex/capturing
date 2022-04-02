const activeNodeArrayFromUrl = (url) => {
  // need to remove hash or query
  const urlToUse = url.split(/[?#]/)[0]
  if (urlToUse.startsWith('/')) {
    return urlToUse.substring(1).split('/')
  }
  // console.log('activeNodeArrayFromUrl', {
  //   url,
  //   activeNodeArray: url.split('/'),
  // })
  return urlToUse.split('/')
}

export default activeNodeArrayFromUrl

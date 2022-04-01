const activeNodeArrayFromUrl = (url) => {
  if (url.startsWith('/')) {
    return url.substring(1).split('/')
  }
  return url.split('/')
}

export default activeNodeArrayFromUrl

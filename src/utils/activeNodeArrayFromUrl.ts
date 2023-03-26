const activeNodeArrayFromUrl = (url: string): string[] => {
  // need to remove hash or query
  const urlToUse = url.split(/[?#]/)[0]
  if (urlToUse.startsWith('/')) {
    return urlToUse
      .substring(1)
      .split('/')
      .filter((e) => e !== '')
  }
  return urlToUse.split('/').filter((e) => e !== '')
}

export default activeNodeArrayFromUrl

// TODO: most of these constants are not used yet
const constants = {
  appBarHeight: 64,
  titleRowHeight: 52,
  singleRowHeight: 48,
  getAppUri: () => {
    if (typeof window === 'undefined') return
    return window?.location?.hostname === 'localhost'
      ? `http://${window.location.hostname}:3000`
      : 'https://erfassen.app'
  },
  tree: {
    minimalWidth: 331,
    minimalWindowWidth: 1000,
  },
  sidebar: {
    width: 420,
    minimalWindowWidth: 1000,
  },
}

export default constants

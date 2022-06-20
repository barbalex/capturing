// see: https://stackoverflow.com/a/47140708/712005
import htmlFromLexical from './htmlFromLexical'

const textFromLexical = async (value) => {
  if (!value) return
  const html = await htmlFromLexical(value)
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent ?? ''
}

export default textFromLexical

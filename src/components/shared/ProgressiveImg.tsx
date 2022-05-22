import { useState, useEffect } from 'react'
import styled from 'styled-components'

const Img = styled.img`
  display: block;
  max-width: 100%;
  height: auto;
  filter: ${(props) => (props.loading ? 'blur(10px)' : 'blur(0px)')};
  ${(props) => props.loading && 'clip-path: inset(0);'}
  ${(props) => props.loaded && 'transition: filter 0.5s linear;'}
`

const ProgressiveImg = ({ placeholderSrc, src, ...props }) => {
  const [imgSrc, setImgSrc] = useState(placeholderSrc || src)

  useEffect(() => {
    const img = new Image()
    img.src = src
    img.onload = () => {
      setImgSrc(src)
    }
  }, [src])

  const customClass =
    placeholderSrc && imgSrc === placeholderSrc ? 'loading' : 'loaded'

  return (
    <Img
      {...{ src: imgSrc, ...props }}
      alt={props.alt || ''}
      className={`image ${customClass}`}
    />
  )
}
export default ProgressiveImg

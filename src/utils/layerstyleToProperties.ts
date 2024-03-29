import { LayerStyle } from '../dexieClient'

interface Props {
  layerStyle: LayerStyle
  extraProps?: Record<string, unknown>
}

const layerstyleToProperties = ({
  layerStyle: style,
  extraProps,
}: Props): Record<string, unknown> => {
  if (!style) return {}

  // TODO: add missing styles for points?
  return {
    ...(typeof style.stroke === 'number' && { stroke: style.stroke === 1 }),
    ...(style.color && { color: style.color }),
    ...(typeof style.weight === 'number' && { weight: style.weight }),
    ...(typeof style.opacity === 'number' && { opacity: style.opacity }),
    ...(style.line_cap && { lineCap: style.line_cap }),
    ...(style.line_join && { lineJoin: style.line_join }),
    ...(style.dash_array && { dashArray: style.dash_array }),
    ...(style.dash_offset && { dashOffset: style.dash_offset }),
    ...(typeof style.fill === 'number' && { fill: style.fill === 1 }),
    ...(style.fill_color && { fillColor: style.fill_color }),
    ...(typeof style.fill_opacity === 'number' && {
      fillOpacity: style.fill_opacity,
    }),
    ...(style.fill_rule && { fillRule: style.fill_rule }),
    ...extraProps,
  }
}

export default layerstyleToProperties

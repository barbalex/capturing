import isNumeric from './isNumeric'

export default (value: unknown): unknown => (isNumeric(value) ? +value : value)

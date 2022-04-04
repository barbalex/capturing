// prevents children from rendering twice
// because router renders component twice
// https://github.com/vercel/next.js/issues/12010#issuecomment-1004004485
import React, { useEffect } from 'react'

export default function Initializer({
  children,
}: WaitForRouterProps): JSX.Element {
  console.log('Initializer rendering')

  return <>{children}</>
}

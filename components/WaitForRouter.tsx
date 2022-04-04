// prevents children from rendering twice
// because router renders component twice
// https://github.com/vercel/next.js/issues/12010#issuecomment-1004004485
import React, { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function WaitForRouter({
  children,
}: WaitForRouterProps): JSX.Element {
  const router = useRouter()
  const [ready, setReady] = React.useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  if (ready && router.isReady) return <>{children}</>
}

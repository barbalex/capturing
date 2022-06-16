import styled from 'styled-components'
import { Link } from 'react-router-dom'

import { Container } from './ImageLayerTypes'

const DataVersioning = () => {
  return (
    <Container>
      <h1>Data Versioning</h1>

      <p>Also known as: conflict-capable data structure.</p>

      <h3>1. The problem</h3>
      <p>Let's assume an app that lets users edit offline:</p>
      <ul>
        <li>User A sits at the desk and edits a row (online).</li>
        <li>
          User A now remembers having edited this row last week in the field on
          her mobile phone. So she opens the app on her phone and syncs the
          data.
        </li>
        <li>
          User B edited the same row one week ago. But was offline and has not
          synced since. He will sync next week when returning to the office.
        </li>
      </ul>

      <p>
        There is no algorithm in the world that can decide what is the _true_
        state of this row's data.
      </p>
      <p>
        Arguably the best solution is: Users A and B should realize that
        conflicts exist and what was edited when by whom. This should enable
        them to choose the correct state.
      </p>

      <h3>2. Requirements</h3>

      <h3>3. Basic idea</h3>

      <h3>4. Implementation</h3>
    </Container>
  )
}

export default DataVersioning

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
          Then user A remembers having edited this row last week in the field on
          her mobile phone when she was offline. So she opens the app on her
          phone and syncs the data.
        </li>
        <li>
          User B edited the same row two weeks ago. But was offline and has not
          synced since. He will sync next week when returning to the office.
        </li>
      </ul>
      <p>We'll call this: A and B worked _concurrently_ on the same row.</p>

      <h3>2. Requirements</h3>

      <p>
        No algorithm can decide what is the _true_ state of this row's data.
      </p>
      <p>
        Arguably the best solution is: Users A and B realize that conflicts
        exist and can see who edited what and when. This enables them to choose
        the correct state according to their specific business logic.
      </p>

      <p>There needs to be a method to:</p>
      <ul>
        <li>See all changes made to a row, when and by whom</li>
        <li>Automatically detect the existence of conflicts</li>
        <li>Automatically choose a winning version, while...</li>
        <li>...alerting the users to the existence of conflicts</li>
        <li>...and enabling them to set the correct state in a simple way</li>
        <li>This should work for deletions as well</li>
      </ul>

      <p>
        Apps can _work_ offline without these requirements. But when users work
        concurrently, edits will be lost.
      </p>

      <h3>3. Basic idea</h3>

      <ul>
        <li>
          Rows are never edited. Instead: Every edit creates a new version
        </li>
        <li>
          Rows keep a list of their ancestors (= preceding versions, aka
          "branch")
        </li>
        <li>
          When a row ist edited by several users concurrently, the branch (list
          of versions) forks
        </li>
        <li>Forks define conflicts</li>
        <li>Algorithms can find forks and choose a winner</li>
      </ul>

      <h3>4. Implementation</h3>
    </Container>
  )
}

export default DataVersioning

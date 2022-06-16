import { Container } from './ImageLayerTypes'

const DataVersioning = () => {
  return (
    <Container>
      <h1>Data Versioning</h1>

      <p>Also known as: conflict-capable data structure.</p>
      <p>This is a bit technical. You have been warned 😉.</p>
      <p>
        But as you entrust us your data, we owe you a good explanation of what
        happens with it.
      </p>

      <h3>1. The problem</h3>
      <p>Let&apos;s assume an app that lets users edit offline:</p>
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
      <p>
        We&apos;ll call this: A and B worked _concurrently_ on the same row.
      </p>

      <h3>2. Requirements</h3>

      <p>
        No algorithm can decide what is the _true_ state of this row&apos;s
        data.
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
          &quot;branch&quot;)
        </li>
        <li>
          When a row ist edited by several users concurrently, the branch (list
          of versions) forks
        </li>
        <li>
          Forks define conflicts (their branches represent conflicting versions)
        </li>
        <li>
          Algorithms find forks, declare the longest branch a winner and give it
          a list of it&apos;s conflicting versions
        </li>
      </ul>

      <h3>4. Implementation</h3>
      <p>This is a bit more technical 🤔.</p>
      <p>Still reading? Great 😁.</p>
      <ul>
        <li>When the user updates or creates a row:</li>
        <ul>
          <li>The app builds a new version with new or updated data</li>
          <li>Documents time of change and user</li>
          <li>Updates the row&apos;s list of ancestors</li>
          <li>Inserts the new version into a queue...</li>
          <li>
            ...that sends it to the server as soon as the internet connection
            allows
          </li>
        </ul>
        <li>On the server two types of versioned tables exist:</li>
        <ul>
          <li>
            One containing all versions.
            <br />
            This is where the app inserts new versions
          </li>
          <li>
            One containing only the winners.
            <br />
            This is what the app reads
          </li>
        </ul>
        <li>When a new version arrives at the server, a trigger function:</li>
        <ul>
          <li>Chooses the version with the longest ancestry as winner</li>
          <li>If conflicts exist: adds a list of conflicting rows</li>
          <li>
            If the new version wins: updates or inserts the row in the winner
            table
          </li>
        </ul>
        <li>
          Deletions are treated like updates: All rows have a field
          &apos;deleted&apos; that is set to true.
        </li>
        <li>
          Changes in a winning tables are synced live when the app is active and
          online (or as soon as that happens)
        </li>
        <li>If conflicts exist, the app informs the user</li>
        <li>
          The user can compare the conflicting versions, choose one and if
          necessary edit it to declare the true winner
        </li>
        <li>
          The app then appends this version to the ancestry of the previous
          winner, to make it the new winner (due to the longest ancestry)
        </li>
        <li>
          It also appends new versions of the previously conflicting versions
          where &#34;deleted&#34; is set to true. This makes the server&apos;s
          algorithm ignore them when choosing conflicts
        </li>
      </ul>
    </Container>
  )
}

export default DataVersioning

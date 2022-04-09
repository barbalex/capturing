import axios from 'redaxios'

import constants from './constants'

/**
 * TODO: do not know what url the live endpoint is on
 * see:
 * https://postgrest.org/en/latest/admin.html#health-check
 * https://github.com/supabase/supabase/discussions/357#discussioncomment-2516469
 */

const config = {
  url: constants?.getHealthUri(),
  timeout: 5000, // timeout error happens after 5 seconds
}

const isOnline = async () => {
  let res
  try {
    // based on: https://hasura.io/docs/1.0/graphql/core/api-reference/health.html
    // TODO: head request to root <ref>/rest/v1/
    res = await axios.get(config.url, { timeout: config.timeout })
  } catch (error) {
    // error can also be caused by timeout
    return false
  }
  if (res.status === 200) return true
  return false
}

export default isOnline

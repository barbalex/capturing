import axios from 'redaxios'

/**
 * TODO: do not know what url the live endpoint is on
 * see:
 * https://postgrest.org/en/latest/admin.html#health-check
 * https://github.com/supabase/supabase/discussions/357#discussioncomment-2516469
 */

const isOnline = async (token) => {
  const config = {
    timeout: 5000, // timeout error happens after 5 seconds
    headers: {
      authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
    },
  }
  let res
  try {
    res = await axios.head(
      `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/rest/v1/`,
      config,
    )
  } catch (error) {
    // error can also be caused by timeout
    console.error('isOnline, error:', error)
    return false
  }
  // console.log('isOnline, res:', res)
  if (res.status === 200) return true
  return false
}

export default isOnline

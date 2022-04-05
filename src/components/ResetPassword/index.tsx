import { useSearchParams } from 'react-router-dom'

import ResetPassword from './ResetPassword'

const ResetPasswordController = () => {
  // detect type = recovery to open reset password modal
  // eslint-disable-next-line no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams()
  const resetPassword = searchParams.get('type') === 'recovery'

  if (resetPassword) return <ResetPassword />
}

export default ResetPasswordController

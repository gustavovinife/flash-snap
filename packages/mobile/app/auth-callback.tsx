import { Redirect } from 'expo-router'

// Google sign-in returns to flashsnap://auth-callback; the session is handled in AuthContext
export default function AuthCallback(): React.JSX.Element {
  return <Redirect href="/" />
}

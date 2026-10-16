import { Redirect } from 'expo-router'

// Google sign-in on Android returns to the app through this link; the session is already handled
export default function AuthCallback(): React.JSX.Element {
  return <Redirect href="/" />
}

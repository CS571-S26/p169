import { AuthProvider } from './AuthContext.jsx'
import { useAuth } from './AuthContext.jsx'
import { TuningProvider } from './TuningContext.jsx'

function UserScopedTuningProvider({ children }) {
    const { user } = useAuth()
    const userId = user?.id || 'guest'

    return (
        <TuningProvider key={userId} storageUserId={userId}>
            {children}
        </TuningProvider>
    )
}

export function AppProviders({ children }) {
    return (
        <AuthProvider>
            <UserScopedTuningProvider>{children}</UserScopedTuningProvider>
        </AuthProvider>
    )
}

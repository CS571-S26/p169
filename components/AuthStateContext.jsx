'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { clearAuthUser, loadAuthUser, saveAuthUser } from '../utils/authState.js'

const AuthStateContext = createContext(null)

export function AuthStateProvider({ children }) {
    const [authUser, setAuthUser] = useState(() => loadAuthUser())

    useEffect(() => {
        const syncAuthState = () => {
            setAuthUser(loadAuthUser())
        }

        window.addEventListener('storage', syncAuthState)
        window.addEventListener('auth-state-updated', syncAuthState)
        return () => {
            window.removeEventListener('storage', syncAuthState)
            window.removeEventListener('auth-state-updated', syncAuthState)
        }
    }, [])

    const value = useMemo(() => ({
        authUser,
        isSignedIn: Boolean(authUser),
        signIn: (user) => {
            saveAuthUser(user)
            setAuthUser(user)
        },
        signOut: () => {
            clearAuthUser()
            setAuthUser(null)
        },
    }), [authUser])

    return <AuthStateContext.Provider value={value}>{children}</AuthStateContext.Provider>
}

export function useAuthState() {
    const context = useContext(AuthStateContext)
    if (!context) {
        throw new Error('useAuthState must be used within an AuthStateProvider')
    }

    return context
}

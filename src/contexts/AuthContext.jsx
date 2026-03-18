/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)
const AUTH_STORAGE_KEY = 'stringpilot-auth-v1'

function parseStoredUser() {
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY)
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}

function persistUser(user) {
    if (!user) {
        localStorage.removeItem(AUTH_STORAGE_KEY)
        return
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
}

function makeUser({ displayName, email }) {
    const cleanEmail = email.trim().toLowerCase()
    const fallback = cleanEmail.split('@')[0] || 'Player'

    return {
        id: cleanEmail,
        email: cleanEmail,
        displayName: (displayName || fallback).trim(),
        createdAt: new Date().toISOString(),
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => parseStoredUser())

    const login = useCallback((email) => {
        const nextUser = makeUser({ email })
        setUser(nextUser)
        persistUser(nextUser)
        return nextUser
    }, [])

    const register = useCallback((displayName, email) => {
        const nextUser = makeUser({ displayName, email })
        setUser(nextUser)
        persistUser(nextUser)
        return nextUser
    }, [])

    const logout = useCallback(() => {
        setUser(null)
        persistUser(null)
    }, [])

    const value = useMemo(
        () => ({
            user,
            login,
            register,
            logout,
            isLoggedIn: Boolean(user),
        }),
        [login, logout, register, user],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider')
    }

    return context
}

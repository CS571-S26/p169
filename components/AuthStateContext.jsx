'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../utils/supabaseClient.js'

const AuthStateContext = createContext(null)

export function AuthStateProvider({ children }) {
    const [session, setSession] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let isMounted = true

        supabase.auth.getSession().then(({ data }) => {
            if (isMounted) {
                setSession(data.session ?? null)
                setIsLoading(false)
            }
        })

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            setSession(nextSession ?? null)
            setIsLoading(false)
        })

        return () => {
            isMounted = false
            authListener.subscription.unsubscribe()
        }
    }, [])

    const authUser = useMemo(() => {
        const user = session?.user
        if (!user) {
            return null
        }

        const metadataName = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.preferred_username
        return {
            id: user.id,
            email: user.email,
            displayName: metadataName || user.email?.split('@')[0] || 'User',
        }
    }, [session])

    const value = useMemo(() => ({
        authUser,
        isSignedIn: Boolean(authUser),
        isLoading,
        signInWithPassword: async ({ email, password }) => {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            return { error }
        },
        signUpWithPassword: async ({ email, password }) => {
            const { data, error } = await supabase.auth.signUp({ email, password })
            return { data, error }
        },
        signInWithGitHub: async () => {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })
            return { error }
        },
        signOut: async () => {
            const { error } = await supabase.auth.signOut()
            return { error }
        },
    }), [authUser, isLoading])

    return <AuthStateContext.Provider value={value}>{children}</AuthStateContext.Provider>
}

export function useAuthState() {
    const context = useContext(AuthStateContext)
    if (!context) {
        throw new Error('useAuthState must be used within an AuthStateProvider')
    }

    return context
}

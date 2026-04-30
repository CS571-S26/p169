'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Alert, Button } from 'react-bootstrap'
import { supabase } from '../../../utils/supabaseClient.js'

function AuthCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState('finalizing')
    const [message, setMessage] = useState('Finalizing sign in...')

    useEffect(() => {
        const run = async () => {
            const oauthError = searchParams.get('error_description') || searchParams.get('error')
            if (oauthError) {
                setStatus('error')
                setMessage(oauthError)
                return
            }

            const code = searchParams.get('code')
            if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(code)
                if (error) {
                    setStatus('error')
                    setMessage(error.message)
                    return
                }
            }

            setStatus('success')
            setMessage('Signed in successfully. Redirecting...')
            router.replace('/')
        }

        run()
    }, [router, searchParams])

    return (
        <section className="main-panel auth-page rounded-4 border border-stone-300 p-4 shadow-sm grid gap-4">
            <h1 className="text-2xl font-semibold mb-1">OAuth Callback</h1>
            <Alert variant={status === 'error' ? 'danger' : status === 'success' ? 'success' : 'info'} className="mb-0">
                {message}
            </Alert>
            {status === 'error' ? (
                <Button as={Link} href="/signin" variant="dark">
                    Back to Sign In
                </Button>
            ) : null}
        </section>
    )
}

export default function AuthCallbackPage() {
    return (
        <Suspense
            fallback={(
                <section className="main-panel auth-page rounded-4 border border-stone-300 p-4 shadow-sm grid gap-4">
                    <h1 className="text-2xl font-semibold mb-1">OAuth Callback</h1>
                    <Alert variant="info" className="mb-0">Finalizing sign in...</Alert>
                </section>
            )}
        >
            <AuthCallbackContent />
        </Suspense>
    )
}
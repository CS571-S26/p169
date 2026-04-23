'use client'

import Link from 'next/link'
import { Button } from 'react-bootstrap'
import { AuthForm } from '../../components/AuthForm.jsx'

export default function SignInPage() {
    return (
        <section className="main-panel auth-page rounded-4 border border-stone-300 p-4 shadow-sm grid gap-4">
            <div className="d-flex flex-wrap align-items-end justify-content-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold mb-1">Sign In</h1>
                    <p className="text-stone-600 mb-0">Sign in to access your account and sync custom tuning presets across devices.</p>
                </div>
                <Button as={Link} href="/signup" variant="outline-dark">
                    Create account
                </Button>
            </div>

            <AuthForm mode="signin" />
        </section>
    )
}

'use client'

import Link from 'next/link'
import { Button } from 'react-bootstrap'
import { AuthForm } from '../../components/AuthForm.jsx'

export default function SignUpPage() {
    return (
        <section className="main-panel auth-page rounded-4 border border-stone-300 p-4 shadow-sm grid gap-4">
            <div className="d-flex flex-wrap align-items-end justify-content-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold mb-1">Sign Up</h1>
                    <p className="text-stone-600 mb-0">Create an account to save and sync your custom tuning presets across devices.</p>
                </div>
                <Button as={Link} href="/signin" variant="outline-dark">
                    Sign in instead
                </Button>
            </div>

            <AuthForm mode="signup" />
        </section>
    )
}

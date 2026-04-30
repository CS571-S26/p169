'use client'

import { AuthStateProvider } from './AuthStateContext.jsx'
import { PrimaryNavbar } from './PrimaryNavbar.jsx'

export function AppShell({ children }) {
    return (
        <AuthStateProvider>
            <a href="#main-content" className="skip-link">Skip to content</a>
            <PrimaryNavbar />
            <div className="mx-auto max-w-5xl p-4">
                <main id="main-content" className="mt-4">{children}</main>
            </div>
        </AuthStateProvider>
    )
}

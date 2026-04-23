'use client'

import { AuthStateProvider } from './AuthStateContext.jsx'
import { PrimaryNavbar } from './PrimaryNavbar.jsx'

export function AppShell({ children }) {
    return (
        <AuthStateProvider>
            <PrimaryNavbar />
            <div className="mx-auto max-w-5xl p-4">
                <main className="mt-4">{children}</main>
            </div>
        </AuthStateProvider>
    )
}

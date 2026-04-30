import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'
import { AppShell } from '../components/AppShell.jsx'

export const metadata = {
    title: 'TunedUp',
    description: 'Guitar tuning app built with Next.js and Tailwind CSS',

    width: 'device-width',
    initialScale: 1,
    userScalable: true,
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <div id="a11y-announcer" className="sr-only" aria-live="polite" aria-atomic="true" />
                <AppShell>{children}</AppShell>
            </body>
        </html>
    )
}

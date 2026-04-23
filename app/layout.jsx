import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'
import { AppShell } from '../components/AppShell.jsx'

export const metadata = {
    title: 'TunedUp',
    description: 'Guitar tuning app built with Next.js and Tailwind CSS',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <AppShell>{children}</AppShell>
            </body>
        </html>
    )
}

import 'bootstrap/dist/css/bootstrap.min.css'
import './globals.css'
import { PrimaryNavbar } from '../components/PrimaryNavbar.jsx'

export const metadata = {
    title: 'TunedUp',
    description: 'Simple Next.js conversion',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <div className="mx-auto max-w-5xl p-4">
                    <PrimaryNavbar />
                    <main className="mt-4">{children}</main>
                </div>
            </body>
        </html>
    )
}

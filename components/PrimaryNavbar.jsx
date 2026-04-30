'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, Nav, Navbar } from 'react-bootstrap'
import { useAuthState } from './AuthStateContext.jsx'

export function PrimaryNavbar() {
    const router = useRouter()
    const { authUser, isSignedIn, signOut } = useAuthState()

    const handleAuthClick = async () => {
        if (isSignedIn) {
            await signOut()
            router.push('/')
            return
        }

        router.push('/signin')
    }

    return (
        <Navbar expand="md" className="site-navbar shadow-sm">
            <div className="site-navbar-inner mx-auto w-full max-w-5xl px-4">
                <Navbar.Brand as={Link} href="/" className="fw-bold navbar-brand-custom">
                    TunedUp
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="site-nav" />
                <Navbar.Collapse id="site-nav">
                    <Nav className="ms-auto site-nav-links">
                        <Nav.Link as={Link} href="/" className="site-nav-link">
                            Tuner
                        </Nav.Link>
                        <Nav.Link as={Link} href="/tunings" className="site-nav-link">
                            Tunings
                        </Nav.Link>
                        <Nav.Link as={Link} href="/about" className="site-nav-link">
                            About
                        </Nav.Link>
                        <Button
                            variant={isSignedIn ? 'outline-light' : 'dark'}
                            className="site-nav-link site-nav-button"
                            onClick={handleAuthClick}
                        >
                            {isSignedIn ? `Sign Out${authUser?.displayName ? ` · ${authUser.displayName}` : ''}` : 'Sign In'}
                        </Button>
                    </Nav>
                </Navbar.Collapse>
            </div>
        </Navbar>
    )
}

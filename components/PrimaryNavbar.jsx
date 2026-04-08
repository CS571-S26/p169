'use client'

import Link from 'next/link'
import { Container, Nav, Navbar } from 'react-bootstrap'

export function PrimaryNavbar() {
    return (
        <Navbar bg="white" expand="md" className="rounded-4 border border-stone-300 shadow-sm">
            <Container fluid>
                <Navbar.Brand as={Link} href="/" className="fw-bold">
                    TunedUp
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="site-nav" />
                <Navbar.Collapse id="site-nav">
                    <Nav className="ms-auto">
                        <Nav.Link as={Link} href="/">
                            Tuner
                        </Nav.Link>
                        <Nav.Link as={Link} href="/tunings">
                            Tunings
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

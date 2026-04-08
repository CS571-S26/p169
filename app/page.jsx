'use client'

import { Row, Col } from 'react-bootstrap'
import { SimpleCard } from '../components/SimpleCard.jsx'

export default function HomePage() {
    return (
        <section className="grid gap-3">
            <h1 className="text-3xl font-semibold">TunedUp</h1>
            <Row className="g-3">
                <Col md={6}>
                    <SimpleCard title="Status">Next.js + Tailwind conversion is in place.</SimpleCard>
                </Col>
                <Col md={6}>
                    <SimpleCard title="Focus">Keep this scaffold simple and build features gradually.</SimpleCard>
                </Col>
            </Row>
        </section>
    )
}

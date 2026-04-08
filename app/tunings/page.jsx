'use client'

import { Button, Form } from 'react-bootstrap'

export default function TuningsPage() {
    return (
        <section className="rounded-4 border border-stone-300 bg-white p-4 shadow-sm">
            <h1 className="text-2xl font-semibold">Tunings</h1>
            <p className="text-stone-600">Simple placeholder page.</p>
            <Form className="grid gap-2 md:grid-cols-2">
                <Form.Group>
                    <Form.Label>Name</Form.Label>
                    <Form.Control placeholder="Open C" />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Notes</Form.Label>
                    <Form.Control placeholder="C2 G2 C3 G3 C4 E4" />
                </Form.Group>
            </Form>
            <Button className="mt-3" variant="dark">
                Save
            </Button>
        </section>
    )
}

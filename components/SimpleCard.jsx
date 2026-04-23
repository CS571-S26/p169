import { Card } from 'react-bootstrap'

export function SimpleCard({ title, children }) {
    return (
        <Card className="border-stone-300 shadow-sm">
            <Card.Body>
                <Card.Title>{title}</Card.Title>
                <div className="text-stone-600 mb-0">{children}</div>
            </Card.Body>
        </Card>
    )
}

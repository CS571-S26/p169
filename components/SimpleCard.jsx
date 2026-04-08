import { Card } from 'react-bootstrap'

export function SimpleCard({ title, children }) {
    return (
        <Card className="border-stone-300 shadow-sm">
            <Card.Body>
                <Card.Title>{title}</Card.Title>
                <Card.Text className="text-stone-600 mb-0">{children}</Card.Text>
            </Card.Body>
        </Card>
    )
}

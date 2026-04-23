'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Alert, Button, Card, Form } from 'react-bootstrap'
import { useAuthState } from './AuthStateContext.jsx'

export function AuthForm({ mode }) {
    const isSignup = mode === 'signup'
    const router = useRouter()
    const { signIn } = useAuthState()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [feedback, setFeedback] = useState({
        variant: 'info',
        message: isSignup
            ? 'Create your account to unlock synced custom tuning presets across your devices.'
            : 'Sign in to access your synced custom tuning presets on any device.',
    })

    const handleChange = (field) => (event) => {
        const { value } = event.target
        setFormData((current) => ({ ...current, [field]: value }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        if (isSignup && formData.password !== formData.confirmPassword) {
            setFeedback({ variant: 'danger', message: 'Passwords do not match.' })
            return
        }

        setFeedback({
            variant: 'success',
            message: isSignup
                ? 'Account created successfully. Your custom tuning presets will sync across devices.'
                : 'Signed in successfully. Your custom tuning presets are available across devices.',
        })

        signIn({
            displayName: formData.email.split('@')[0],
            email: formData.email,
        })

        router.push('/')
    }

    return (
        <Card className="auth-form-card border-stone-300 shadow-sm">
            <Card.Body className="grid gap-3">
                <div>
                    <Card.Title className="mb-1">{isSignup ? 'Create Account' : 'Sign In'}</Card.Title>
                    <Card.Text className="text-stone-600 mb-0">
                        {isSignup
                            ? 'Create your TunedUp account to save and sync custom tuning presets.'
                            : 'Sign in to manage your tuning profile and synced presets.'}
                    </Card.Text>
                </div>

                <Alert variant={feedback.variant} className="mb-0">
                    {feedback.message}
                </Alert>

                <Form onSubmit={handleSubmit} className="grid gap-3">
                    <Form.Group controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            autoComplete="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleChange('email')}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            autoComplete={isSignup ? 'new-password' : 'current-password'}
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange('password')}
                            required
                        />
                    </Form.Group>

                    {isSignup ? (
                        <Form.Group controlId="confirmPassword">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                autoComplete="new-password"
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={handleChange('confirmPassword')}
                                required
                            />
                        </Form.Group>
                    ) : null}

                    <Button type="submit" variant="dark">
                        {isSignup ? 'Create Account' : 'Sign In'}
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    )
}

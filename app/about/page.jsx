'use client'

import { SimpleCard } from '../../components/SimpleCard.jsx'

const stackItems = ['Next.js App Router', 'React Bootstrap', 'Tailwind utility classes', 'LocalStorage for tuning state', 'Web Audio API pitch detection']

export default function AboutPage() {
    return (
        <section className="main-panel auth-page rounded-4 border border-stone-300 p-4 shadow-sm grid gap-4">
            <div>
                <h1 className="text-2xl font-semibold mb-1">About TunedUp</h1>
                <p className="text-stone-600 mb-0">
                    A small guitar tuner project to learn Next.js and work with WebAudioAPI.
                </p>
            </div>

            <SimpleCard title="Tech Stack">
                <ul className="about-stack-list mb-0">
                    {stackItems.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            </SimpleCard>

            <SimpleCard title="Quick Guide for Non-Guitar Users">
                <ul className="about-stack-list mb-0">
                    <li>
                        <strong>Standard tuning (E A D G B E):</strong> The usual pitch setup for guitar strings, from the lowest string to the highest.
                    </li>
                    <li>
                        <strong>Hz (hertz):</strong> Frequency, or how fast a note vibrates each second. Higher Hz means a higher pitch.
                    </li>
                    <li>
                        <strong>Cents:</strong> A tiny pitch unit. 100 cents equals 1 semitone, and 0 cents means the note is right on target.
                    </li>
                    <li>
                        <strong>Offset:</strong> The difference from the target note measured in cents. Negative means flat, positive means sharp.
                    </li>
                    <li>
                        <strong>Too low / too high:</strong> The detected note is below or above the target note.
                    </li>
                    <li>
                        <strong>Pitch lock:</strong> The tuner only shows a lock after the note stays stable and in tune for a moment.
                    </li>
                </ul>
            </SimpleCard>
        </section>
    )
}

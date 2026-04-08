'use client'

import { useEffect, useState } from 'react'
import { Form } from 'react-bootstrap'
import { STRING_ORDER, STRING_OPTIONS, loadSelectedNotes, saveSelectedNotes } from '../../utils/tuningSettings.js'

export default function TuningsPage() {
    const [selectedNotes, setSelectedNotes] = useState(() => loadSelectedNotes())

    useEffect(() => {
        saveSelectedNotes(selectedNotes)
    }, [selectedNotes])

    return (
        <section className="rounded-4 border border-stone-300 bg-white p-4 shadow-sm grid gap-3">
            <h1 className="text-2xl font-semibold">Tunings</h1>
            <p className="text-stone-600 mb-0">Choose the note you want each string to tune to.</p>

            <div className="grid gap-3">
                {STRING_ORDER.map((stringName) => (
                    <div key={stringName} className="grid gap-2 rounded-4 border border-stone-200 bg-stone-50 p-3">
                        <div className="fw-semibold">String {stringName}</div>
                        <Form.Select
                            value={selectedNotes[stringName]}
                            onChange={(event) =>
                                setSelectedNotes((current) => ({
                                    ...current,
                                    [stringName]: event.target.value,
                                }))
                            }
                        >
                            {STRING_OPTIONS[stringName].map((note) => (
                                <option key={note} value={note}>
                                    {note}
                                </option>
                            ))}
                        </Form.Select>
                    </div>
                ))}
            </div>

            <div className="grid gap-2 rounded-4 border border-stone-200 bg-stone-50 p-3">
                <div className="fw-semibold">Current setup</div>
                {STRING_ORDER.map((stringName) => (
                    <div key={stringName}>
                        {stringName}: {selectedNotes[stringName]}
                    </div>
                ))}
            </div>
        </section>
    )
}
